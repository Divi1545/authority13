import { prisma } from './db'

const MODEL_COSTS: Record<string, { prompt: number; completion: number }> = {
  'gpt-4': { prompt: 0.03, completion: 0.06 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-4o': { prompt: 0.005, completion: 0.015 },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'claude-3-opus': { prompt: 0.015, completion: 0.075 },
  'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
  'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
  'gemini-pro': { prompt: 0.000125, completion: 0.000375 },
  'deepseek-chat': { prompt: 0.00014, completion: 0.00028 },
  'llama-3.1-70b-versatile': { prompt: 0.00059, completion: 0.00079 },
}

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['gpt-4o-mini']
  return (promptTokens / 1000) * costs.prompt + (completionTokens / 1000) * costs.completion
}

export async function checkSpendLimit(
  workspaceId: string,
  estimatedCost: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
    if (!workspace) return { allowed: false, reason: 'Workspace not found' }

    // Check for spend limits stored in workspace metadata (if any)
    // For now, use reasonable defaults: $50/day, $500/month
    const dailyLimit = 50
    const monthlyLimit = 500

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [dailySpend, monthlySpend] = await Promise.all([
      prisma.run.aggregate({
        where: { task: { workspaceId }, startedAt: { gte: startOfDay }, status: 'completed' },
        _sum: { costEstimateUsd: true },
      }),
      prisma.run.aggregate({
        where: { task: { workspaceId }, startedAt: { gte: startOfMonth }, status: 'completed' },
        _sum: { costEstimateUsd: true },
      }),
    ])

    const todayTotal = (dailySpend._sum.costEstimateUsd || 0) + estimatedCost
    const monthTotal = (monthlySpend._sum.costEstimateUsd || 0) + estimatedCost

    if (todayTotal > dailyLimit) {
      return { allowed: false, reason: `Daily spend limit reached ($${dailyLimit}). Today's total: $${todayTotal.toFixed(2)}` }
    }

    if (monthTotal > monthlyLimit) {
      return { allowed: false, reason: `Monthly spend limit reached ($${monthlyLimit}). This month: $${monthTotal.toFixed(2)}` }
    }

    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

export function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}
