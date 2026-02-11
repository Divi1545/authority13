import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        plans: true,
        runs: {
          include: {
            steps: {
              orderBy: { index: 'asc' },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await requireWorkspaceAccess((session.user as any).id, task.workspaceId)

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}
