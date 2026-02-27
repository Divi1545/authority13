import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const task = await prisma.task.findFirst({
    where: { id: params.id, workspaceId: membership.workspaceId },
    include: {
      plans: { orderBy: { createdAt: 'desc' }, take: 1 },
      runs: {
        orderBy: { startedAt: 'desc' },
        include: { steps: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  return NextResponse.json({ task })
}
