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

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [runs, taskCount] = await Promise.all([
    prisma.run.findMany({
      where: { task: { workspaceId: membership.workspaceId }, startedAt: { gte: thirtyDaysAgo } },
      select: { id: true, startedAt: true, promptTokens: true, completionTokens: true, costEstimateUsd: true, status: true },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.task.count({ where: { workspaceId: membership.workspaceId } }),
  ])

  const totalTokens = runs.reduce((sum, r) => sum + (r.promptTokens || 0) + (r.completionTokens || 0), 0)
  const totalCost = runs.reduce((sum, r) => sum + (r.costEstimateUsd || 0), 0)

  // Aggregate by day
  const dailyMap = new Map<string, { tokens: number; cost: number; runs: number }>()
  for (const run of runs) {
    const date = run.startedAt.toISOString().slice(0, 10)
    const entry = dailyMap.get(date) || { tokens: 0, cost: 0, runs: 0 }
    entry.tokens += (run.promptTokens || 0) + (run.completionTokens || 0)
    entry.cost += run.costEstimateUsd || 0
    entry.runs++
    dailyMap.set(date, entry)
  }

  const dailyUsage = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))

  return NextResponse.json({
    totalTasks: taskCount,
    totalRuns: runs.length,
    totalTokens,
    totalCost,
    dailyUsage,
  })
}
