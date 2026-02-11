import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'
import { publishEvent } from '@/lib/redis'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, editedPayload } = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get approval request
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: params.id },
      include: { task: true },
    })

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    await requireWorkspaceAccess(
      (session.user as any).id,
      approval.workspaceId,
      'manager'
    )

    // Update approval
    const updatedApproval = await prisma.approvalRequest.update({
      where: { id: params.id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        decidedByUserId: (session.user as any).id,
        decidedAt: new Date(),
        ...(editedPayload && {
          editablePayloadJson: JSON.stringify(editedPayload),
        }),
      },
    })

    // Create audit event
    await createAuditEvent({
      workspaceId: approval.workspaceId,
      type:
        action === 'approve'
          ? AuditEventTypes.APPROVAL_APPROVED
          : AuditEventTypes.APPROVAL_REJECTED,
      payload: {
        approvalId: approval.id,
        taskId: approval.taskId,
        action,
      },
      actorUserId: (session.user as any).id,
    })

    // Emit event to resume run if approved
    if (action === 'approve') {
      await publishEvent(`run:${approval.runId}`, {
        type: 'approval.resolved',
        data: {
          approvalId: approval.id,
          approved: true,
          editedPayload,
        },
        timestamp: Date.now(),
      })
    }

    return NextResponse.json({ approval: updatedApproval })
  } catch (error) {
    console.error('Approval action error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
