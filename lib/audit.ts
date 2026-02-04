import { prisma } from './db'

export interface AuditEventData {
  workspaceId: string
  type: string
  payload: any
  actorUserId?: string
  actorAgentId?: string
}

export async function createAuditEvent(data: AuditEventData) {
  return await prisma.auditEvent.create({
    data: {
      workspaceId: data.workspaceId,
      type: data.type,
      payloadJson: JSON.stringify(data.payload),
      actorUserId: data.actorUserId,
      actorAgentId: data.actorAgentId,
    },
  })
}

export const AuditEventTypes = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  RUN_STARTED: 'run.started',
  RUN_COMPLETED: 'run.completed',
  RUN_FAILED: 'run.failed',
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_APPROVED: 'approval.approved',
  APPROVAL_REJECTED: 'approval.rejected',
  CONNECTOR_ADDED: 'connector.added',
  CONNECTOR_UPDATED: 'connector.updated',
  API_KEY_ADDED: 'api_key.added',
  API_KEY_UPDATED: 'api_key.updated',
  WORKSPACE_CREATED: 'workspace.created',
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
}
