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

  // Load from audit events (we store settings as a special event type)
  const settingsEvent = await prisma.auditEvent.findFirst({
    where: { workspaceId: membership.workspaceId, type: 'workspace.spend_limits' },
    orderBy: { createdAt: 'desc' },
  })

  const defaults = { dailyLimitUsd: 50, monthlyLimitUsd: 500 }
  const limits = settingsEvent ? JSON.parse(settingsEvent.payloadJson) : defaults

  // Calculate current usage
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [dailySpend, monthlySpend] = await Promise.all([
    prisma.run.aggregate({
      where: { task: { workspaceId: membership.workspaceId }, startedAt: { gte: startOfDay }, status: 'completed' },
      _sum: { costEstimateUsd: true },
    }),
    prisma.run.aggregate({
      where: { task: { workspaceId: membership.workspaceId }, startedAt: { gte: startOfMonth }, status: 'completed' },
      _sum: { costEstimateUsd: true },
    }),
  ])

  return NextResponse.json({
    limits,
    usage: {
      daily: dailySpend._sum.costEstimateUsd || 0,
      monthly: monthlySpend._sum.costEstimateUsd || 0,
    },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })
  if (membership.role !== 'admin' && membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only admins can change spend limits' }, { status: 403 })
  }

  const { dailyLimitUsd, monthlyLimitUsd } = await req.json()

  await prisma.auditEvent.create({
    data: {
      workspaceId: membership.workspaceId,
      type: 'workspace.spend_limits',
      payloadJson: JSON.stringify({ dailyLimitUsd: dailyLimitUsd ?? 50, monthlyLimitUsd: monthlyLimitUsd ?? 500 }),
      actorUserId: (session.user as any).id,
    },
  })

  return NextResponse.json({ success: true })
}
