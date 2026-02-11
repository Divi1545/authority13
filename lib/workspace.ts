import { prisma } from './db'

export type WorkspaceRole = 'admin' | 'manager' | 'operator' | 'viewer'

export interface WorkspacePermissions {
  canRead: boolean
  canWrite: boolean
  canApprove: boolean
  canManageSettings: boolean
  canManageTeam: boolean
}

const rolePermissions: Record<WorkspaceRole, WorkspacePermissions> = {
  admin: {
    canRead: true,
    canWrite: true,
    canApprove: true,
    canManageSettings: true,
    canManageTeam: true,
  },
  manager: {
    canRead: true,
    canWrite: true,
    canApprove: true,
    canManageSettings: false,
    canManageTeam: false,
  },
  operator: {
    canRead: true,
    canWrite: true,
    canApprove: false,
    canManageSettings: false,
    canManageTeam: false,
  },
  viewer: {
    canRead: true,
    canWrite: false,
    canApprove: false,
    canManageSettings: false,
    canManageTeam: false,
  },
}

export function getPermissions(role: WorkspaceRole): WorkspacePermissions {
  return rolePermissions[role] || rolePermissions.viewer
}

export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string,
  minRole: WorkspaceRole = 'viewer'
): Promise<{ member: any; workspace: any }> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      workspace: true,
    },
  })

  if (!member) {
    throw new Error('Access denied: Not a member of this workspace')
  }

  const memberPerms = getPermissions(member.role as WorkspaceRole)
  const requiredPerms = getPermissions(minRole)

  // Check if member has sufficient permissions
  if (minRole === 'admin' && member.role !== 'admin') {
    throw new Error('Access denied: Admin privileges required')
  }

  if (minRole === 'manager' && !['admin', 'manager'].includes(member.role)) {
    throw new Error('Access denied: Manager privileges required')
  }

  if (minRole === 'operator' && member.role === 'viewer') {
    throw new Error('Access denied: Operator privileges required')
  }

  return { member, workspace: member.workspace }
}

export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'desc' },
  })

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }))
}

export async function createWorkspace(userId: string, name: string, slug: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId,
          role: 'admin',
        },
      },
    },
  })

  return workspace
}
