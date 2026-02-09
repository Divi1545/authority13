import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/db'
import { createAuditEvent } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireSuperAdmin((session.user as any).id)

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        workspaceMembers: {
          include: {
            workspace: { select: { name: true, slug: true, createdAt: true } },
          },
        },
        _count: {
          select: {
            createdTasks: true,
            approvalDecisions: true,
            chatMessages: true,
            auditEvents: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's task activity
    const recentTasks = await prisma.task.findMany({
      where: { createdByUserId: params.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        workspace: { select: { name: true } },
      },
    })

    // Calculate user's API cost
    const userCosts = await prisma.run.aggregate({
      where: {
        task: { createdByUserId: params.id },
      },
      _sum: {
        costEstimateUsd: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
        workspaces: user.workspaceMembers.map((member) => ({
          name: member.workspace.name,
          slug: member.workspace.slug,
          role: member.role,
          joinedAt: member.createdAt,
        })),
        stats: {
          tasksCreated: user._count.createdTasks,
          approvalDecisions: user._count.approvalDecisions,
          chatMessages: user._count.chatMessages,
          auditEvents: user._count.auditEvents,
          totalCostUsd: userCosts._sum.costEstimateUsd || 0,
        },
        recentTasks,
      },
    })
  } catch (error: any) {
    console.error('Admin user detail error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await requireSuperAdmin((session.user as any).id)

    const body = await req.json()
    const { isSuperAdmin, name } = body

    // Prevent self-demotion
    if (params.id === adminUser.id && isSuperAdmin === false) {
      return NextResponse.json(
        { error: 'Cannot remove your own super admin access' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(typeof isSuperAdmin === 'boolean' && { isSuperAdmin }),
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
      },
    })

    // Create audit event
    const firstWorkspace = await prisma.workspace.findFirst()
    if (firstWorkspace) {
      await createAuditEvent({
        workspaceId: firstWorkspace.id, // System-level, but needs a workspace
        type: 'admin.user.updated',
        actorUserId: adminUser.id,
        payload: {
          targetUserId: params.id,
          targetUserEmail: updatedUser.email,
          changes: body,
        },
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
