import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'
import { enqueueTask } from '@/lib/queue'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    await requireWorkspaceAccess((session.user as any).id, workspaceId)

    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, title, objective, priority } = await req.json()

    await requireWorkspaceAccess((session.user as any).id, workspaceId, 'operator')

    const task = await prisma.task.create({
      data: {
        workspaceId,
        createdByUserId: (session.user as any).id,
        title,
        objective,
        priority: priority || 'medium',
        status: 'pending',
      },
    })

    await createAuditEvent({
      workspaceId,
      type: AuditEventTypes.TASK_CREATED,
      payload: { taskId: task.id, title: task.title },
      actorUserId: (session.user as any).id,
    })

    await enqueueTask({
      taskId: task.id,
      workspaceId,
      userId: (session.user as any).id,
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
