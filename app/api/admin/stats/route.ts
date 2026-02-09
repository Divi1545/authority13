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

    // Verify super admin access
    await requireSuperAdmin((session.user as any).id)

    // Fetch system-wide statistics
    const [
      totalUsers,
      totalWorkspaces,
      totalTasks,
      totalRuns,
      activeRuns,
      totalApprovals,
      pendingApprovals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.task.count(),
      prisma.run.count(),
      prisma.run.count({ where: { status: { in: ['started', 'executing'] } } }),
      prisma.approvalRequest.count(),
      prisma.approvalRequest.count({ where: { status: 'pending' } }),
    ])

    // Calculate total API cost estimate
    const costAggregate = await prisma.run.aggregate({
      _sum: {
        costEstimateUsd: true,
      },
    })

    // Recent activity (last 10 audit events)
    const recentActivity = await prisma.auditEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: { select: { name: true, slug: true } },
        actorUser: { select: { email: true, name: true } },
      },
    })

    // Task status breakdown
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalWorkspaces,
        totalTasks,
        totalRuns,
        activeRuns,
        totalApprovals,
        pendingApprovals,
        totalCostUsd: costAggregate._sum.costEstimateUsd || 0,
      },
      tasksByStatus: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      recentActivity: recentActivity.map((event) => ({
        id: event.id,
        type: event.type,
        workspace: event.workspace?.name,
        actor: event.actorUser?.email,
        createdAt: event.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
