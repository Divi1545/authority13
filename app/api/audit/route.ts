import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    await requireWorkspaceAccess((session.user as any).id, workspaceId)

    const events = await prisma.auditEvent.findMany({
      where: { workspaceId },
      include: {
        actorUser: {
          select: { id: true, name: true },
        },
        actorAgent: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get audit events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    )
  }
}
