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
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [workspaces, totalCount] = await Promise.all([
      prisma.workspace.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              members: true,
              agents: true,
              tasks: true,
              connectors: true,
              approvalRequests: true,
            },
          },
        },
      }),
      prisma.workspace.count({ where: whereClause }),
    ])

    // Get costs for each workspace
    const workspaceData = await Promise.all(
      workspaces.map(async (workspace) => {
        const costAggregate = await prisma.run.aggregate({
          where: {
            task: { workspaceId: workspace.id },
          },
          _sum: {
            costEstimateUsd: true,
          },
        })

        const recentTasksCount = await prisma.task.count({
          where: {
            workspaceId: workspace.id,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        })

        return {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          createdAt: workspace.createdAt,
          stats: {
            members: workspace._count.members,
            agents: workspace._count.agents,
            tasks: workspace._count.tasks,
            connectors: workspace._count.connectors,
            pendingApprovals: workspace._count.approvalRequests,
            recentTasks: recentTasksCount,
            totalCostUsd: costAggregate._sum.costEstimateUsd || 0,
          },
        }
      })
    )

    return NextResponse.json({
      workspaces: workspaceData,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('Admin workspaces list error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Super admin access required' ? 403 : 500 }
    )
  }
}
