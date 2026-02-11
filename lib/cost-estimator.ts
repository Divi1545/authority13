// Token cost estimates per 1K tokens (as of 2026)
const MODEL_COSTS = {
  'gpt-4': { prompt: 0.03, completion: 0.06 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'claude-3-opus': { prompt: 0.015, completion: 0.075 },
  'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
  'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
  'gemini-pro': { prompt: 0.000125, completion: 0.000375 },
}

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-3.5-turbo']
  
  const promptCost = (promptTokens / 1000) * costs.prompt
  const completionCost = (completionTokens / 1000) * costs.completion
  
  return promptCost + completionCost
}

export async function checkSpendLimit(
  workspaceId: string,
  estimatedCost: number
): Promise<{ allowed: boolean; reason?: string }> {
  // TODO: Implement actual spend limit checking
  // For now, allow all requests
  return { allowed: true }
}

export function approximateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}
