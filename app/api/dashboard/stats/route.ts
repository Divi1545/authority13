import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const wsId = membership.workspaceId

  const [totalTasks, completedTasks, failedTasks, pendingTasks, recentTasks, connectors, agents, auditEvents] = await Promise.all([
    prisma.task.count({ where: { workspaceId: wsId } }),
    prisma.task.count({ where: { workspaceId: wsId, status: 'completed' } }),
    prisma.task.count({ where: { workspaceId: wsId, status: 'failed' } }),
    prisma.task.count({ where: { workspaceId: wsId, status: { in: ['pending', 'planning', 'executing'] } } }),
    prisma.task.findMany({
      where: { workspaceId: wsId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, status: true, createdAt: true, objective: true },
    }),
    prisma.connector.count({ where: { workspaceId: wsId, isEnabled: true } }),
    prisma.agent.count({ where: { workspaceId: wsId, isEnabled: true } }),
    prisma.auditEvent.count({ where: { workspaceId: wsId } }),
  ])

  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return NextResponse.json({
    totalTasks,
    completedTasks,
    failedTasks,
    pendingTasks,
    successRate,
    recentTasks,
    connectors,
    agents,
    auditEvents,
  })
}
