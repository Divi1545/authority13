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
    const limit = parseInt(searchParams.get('limit') || '100')
    const workspaceId = searchParams.get('workspaceId') || ''
    const type = searchParams.get('type') || ''
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (workspaceId) {
      whereClause.workspaceId = workspaceId
    }

    if (type) {
      whereClause.type = { contains: type, mode: 'insensitive' }
    }

    if (userId) {
      whereClause.actorUserId = userId
    }

    const [events, totalCount] = await Promise.all([
      prisma.auditEvent.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workspace: { select: { name: true, slug: true } },
          actorUser: { select: { email: true, name: true } },
          actorAgent: { select: { name: true, type: true } },
        },
      }),
      prisma.auditEvent.count({ where: whereClause }),
    ])

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        workspace: {
          name: event.workspace.name,
          slug: event.workspace.slug,
        },
        actor: event.actorUser
          ? {
              type: 'user',
              email: event.actorUser.email,
              name: event.actorUser.name,
            }
          : event.actorAgent
          ? {
              type: 'agent',
              name: event.actorAgent.name,
              agentType: event.actorAgent.type,
            }
          : null,
        payload: JSON.parse(event.payloadJson),
        createdAt: event.createdAt,
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('Admin audit log error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
