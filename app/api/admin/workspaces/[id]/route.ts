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

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
        agents: {
          select: { id: true, name: true, type: true, isEnabled: true },
        },
        connectors: {
          select: { id: true, type: true, isEnabled: true, createdAt: true },
        },
        _count: {
          select: {
            tasks: true,
            approvalRequests: true,
            auditEvents: true,
            chatThreads: true,
            meetingSessions: true,
          },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { workspaceId: params.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        createdBy: { select: { email: true } },
      },
    })

    // Calculate workspace costs
    const costAggregate = await prisma.run.aggregate({
      where: {
        task: { workspaceId: params.id },
      },
      _sum: {
        costEstimateUsd: true,
        promptTokens: true,
        completionTokens: true,
      },
    })

    // Task status breakdown
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { workspaceId: params.id },
      _count: true,
    })

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        members: workspace.members.map((member) => ({
          id: member.id,
          email: member.user.email,
          name: member.user.name,
          role: member.role,
          joinedAt: member.createdAt,
        })),
        agents: workspace.agents,
        connectors: workspace.connectors,
        stats: {
          totalTasks: workspace._count.tasks,
          pendingApprovals: workspace._count.approvalRequests,
          auditEvents: workspace._count.auditEvents,
          chatThreads: workspace._count.chatThreads,
          meetingSessions: workspace._count.meetingSessions,
          totalCostUsd: costAggregate._sum.costEstimateUsd || 0,
          totalTokens:
            (costAggregate._sum.promptTokens || 0) +
            (costAggregate._sum.completionTokens || 0),
        },
        tasksByStatus: tasksByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        recentTasks,
      },
    })
  } catch (error: any) {
    console.error('Admin workspace detail error:', error)
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
    const { name } = body

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    // Create audit event
    await createAuditEvent({
      workspaceId: params.id,
      type: 'admin.workspace.updated',
      actorUserId: adminUser.id,
      payload: {
        workspaceId: params.id,
        changes: body,
      },
    })

    return NextResponse.json({ workspace: updatedWorkspace })
  } catch (error: any) {
    console.error('Admin workspace update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
