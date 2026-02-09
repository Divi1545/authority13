import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireSuperAdmin((session.user as any).id)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const whereClause = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workspaceMembers: {
            include: {
              workspace: { select: { name: true, slug: true } },
            },
          },
          _count: {
            select: {
              createdTasks: true,
              approvalDecisions: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ])

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
        workspaces: user.workspaceMembers.map((member) => ({
          name: member.workspace.name,
          slug: member.workspace.slug,
          role: member.role,
        })),
        stats: {
          tasksCreated: user._count.createdTasks,
          approvalDecisions: user._count.approvalDecisions,
        },
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
