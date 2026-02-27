export interface AgentRun {
  id: string
  agentType: string
  agentLabel: string
  parentRunId: string | null
  status: 'pending' | 'running' | 'done' | 'failed' | 'killed'
  task: string
  result?: string
  toolCalls: ToolCallRecord[]
  children: AgentRun[]
  startedAt: number
  endedAt?: number
  tokensUsed?: number
}

export interface ToolCallRecord {
  tool: string
  params: Record<string, any>
  result: string
  success: boolean
  timestamp: number
}

export interface SpawnOptions {
  agentType: string
  task: string
  parentRunId: string | null
  depth: number
  maxDepth?: number
}

export const AGENT_CONFIGS: Record<string, { label: string; systemPrompt: string; color: string }> = {
  commander: {
    label: 'Commander',
    color: '#6366f1',
    systemPrompt: `You are the Commander Agent. You analyze objectives, create plans, and delegate to specialist agents. You coordinate the overall execution.`,
  },
  growth: {
    label: 'Growth Agent',
    color: '#10b981',
    systemPrompt: `You are the Growth Agent specializing in marketing, content creation, lead generation, outreach campaigns, and growth strategies. Provide specific, actionable deliverables.`,
  },
  ops: {
    label: 'Ops Agent',
    color: '#3b82f6',
    systemPrompt: `You are the Ops Agent specializing in operations, process optimization, scheduling, workflows, and internal systems. Provide concrete steps and documentation.`,
  },
  support: {
    label: 'Support Agent',
    color: '#8b5cf6',
    systemPrompt: `You are the Support Agent specializing in customer service, user communication, help documentation, and support workflows. Provide templates and scripts.`,
  },
  analyst: {
    label: 'Analyst Agent',
    color: '#f59e0b',
    systemPrompt: `You are the Analyst Agent specializing in data analysis, reporting, metrics, insights, and research. Provide structured analysis and recommendations.`,
  },
}

export const MAX_AGENT_DEPTH = 3
export const MAX_CHILDREN_PER_AGENT = 5
