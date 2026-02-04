export interface TaskPlan {
  objective: string
  assumptions: string[]
  constraints: string[]
  subtasks: Subtask[]
  success_criteria: string[]
  next_question_for_user: string | null
}

export interface Subtask {
  id: string
  agent: 'growth' | 'ops' | 'support' | 'analyst'
  title: string
  description: string
  tools_needed: string[]
  risk_level: 'low' | 'medium' | 'high'
  requires_approval: boolean
}

export interface AgentStep {
  step: number
  action: string
  tool_call: ToolCall | null
  needs_approval: boolean
  approval_request: ApprovalRequestData | null
  result_summary: string
}

export interface ToolCall {
  tool: string
  input: Record<string, any>
}

export interface ApprovalRequestData {
  summary: string
  details: string
  editable_payload: Record<string, any>
}

export interface RuntimeConfig {
  workspaceId: string
  taskId: string
  runId: string
}

export interface RuntimeEvent {
  type: string
  data: any
  timestamp: number
}

export type AgentType = 'commander' | 'growth' | 'ops' | 'support' | 'analyst'

export interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}
