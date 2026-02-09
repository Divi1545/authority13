import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireWorkspaceAccess } from '@/lib/workspace'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')
    const status = searchParams.get('status') // 'success', 'error', or null for all
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // Check workspace access
    await requireWorkspaceAccess(userId, workspaceId, 'viewer')

    // Build where clause
    const whereClause: any = {
      workspaceId,
      userId, // Users can only see their own queries
    }

    if (status) {
      whereClause.status = status
    }

    // Fetch query history
    const queries = await prisma.sqlQuery.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100), // Cap at 100
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      queries: queries.map((q) => ({
        id: q.id,
        query: q.query,
        status: q.status,
        resultRows: q.resultRows,
        error: q.error,
        executionMs: q.executionMs,
        createdAt: q.createdAt,
        user: {
          email: q.user.email,
          name: q.user.name,
        },
      })),
    })
  } catch (error: any) {
    console.error('SQL history API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
