import { prisma } from '@/lib/db'

export interface MemoryEntry {
  id: string
  workspaceId: string
  agentType: string
  content: string
  metadata: Record<string, any>
  createdAt: Date
  relevance?: number
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
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  if (words.length === 0) return getRecentMemories(workspaceId, limit)

  // Fetch candidates matching any word
  const candidates = await prisma.auditEvent.findMany({
    where: {
      workspaceId,
      type: 'agent.memory',
      OR: words.map((word) => ({ payloadJson: { contains: word } })),
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3,
  })

  // Score by number of matching words
  const scored = candidates.map((e) => {
    const payload = JSON.parse(e.payloadJson)
    const contentLower = (payload.content || '').toLowerCase()
    const matchCount = words.filter((w) => contentLower.includes(w)).length
    return {
      id: e.id,
      workspaceId: e.workspaceId,
      agentType: payload.agentType || 'unknown',
      content: payload.content || '',
      metadata: payload.metadata || {},
      createdAt: e.createdAt,
      relevance: matchCount / words.length,
    }
  })

  return scored
    .filter((s) => s.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
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

export async function getMemoryContext(workspaceId: string, objective: string): Promise<string> {
  const relevant = await searchMemory(workspaceId, objective, 5)
  if (relevant.length === 0) return ''

  return '\n\nRelevant context from memory:\n' +
    relevant.map((m) => `- [${m.agentType}] ${m.content.slice(0, 200)}`).join('\n')
}
