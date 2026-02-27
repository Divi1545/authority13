import { prisma } from '@/lib/db'

export interface MemoryEntry {
  id: string
  workspaceId: string
  agentType: string
  content: string
  metadata: Record<string, any>
  createdAt: Date
}

export async function saveMemory(workspaceId: string, agentType: string, content: string, metadata: Record<string, any> = {}) {
  return prisma.auditEvent.create({
    data: {
      workspaceId,
      type: 'agent.memory',
      payloadJson: JSON.stringify({ agentType, content, metadata, savedAt: new Date().toISOString() }),
    },
  })
}

export async function searchMemory(workspaceId: string, query: string, limit = 10): Promise<MemoryEntry[]> {
  const events = await prisma.auditEvent.findMany({
    where: {
      workspaceId,
      type: 'agent.memory',
      payloadJson: { contains: query.toLowerCase().split(' ')[0] },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return events.map((e) => {
    const payload = JSON.parse(e.payloadJson)
    return {
      id: e.id,
      workspaceId: e.workspaceId,
      agentType: payload.agentType || 'unknown',
      content: payload.content || '',
      metadata: payload.metadata || {},
      createdAt: e.createdAt,
    }
  })
}

export async function getRecentMemories(workspaceId: string, limit = 20): Promise<MemoryEntry[]> {
  const events = await prisma.auditEvent.findMany({
    where: { workspaceId, type: 'agent.memory' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return events.map((e) => {
    const payload = JSON.parse(e.payloadJson)
    return {
      id: e.id,
      workspaceId: e.workspaceId,
      agentType: payload.agentType || 'unknown',
      content: payload.content || '',
      metadata: payload.metadata || {},
      createdAt: e.createdAt,
    }
  })
}
