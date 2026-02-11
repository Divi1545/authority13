import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { enqueueTask } from '@/lib/queue'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await req.json()

    // Get user's workspace (for now, get the first one)
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: (session.user as any).id },
      include: { workspace: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        workspaceId: membership.workspaceId,
        createdByUserId: (session.user as any).id,
        title: message.substring(0, 100),
        objective: message,
        status: 'pending',
      },
    })

    // Create audit event
    await createAuditEvent({
      workspaceId: membership.workspaceId,
      type: AuditEventTypes.TASK_CREATED,
      payload: { taskId: task.id, title: task.title },
      actorUserId: (session.user as any).id,
    })

    // Enqueue task for processing
    await enqueueTask({
      taskId: task.id,
      workspaceId: membership.workspaceId,
      userId: (session.user as any).id,
    })

    return NextResponse.json({
      success: true,
      response: `Task "${task.title}" created! Watch the timeline for updates.`,
      taskId: task.id,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
