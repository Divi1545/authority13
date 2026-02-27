export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean'
  description: string
  required: boolean
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: ToolParameter[]
  execute: (params: Record<string, any>, context: ToolContext) => Promise<ToolResult>
}

export interface ToolContext {
  workspaceId: string
  apiKey: string
  provider: string
  model: string
}

export interface ToolResult {
  success: boolean
  output: string
  data?: any
}

const tools = new Map<string, ToolDefinition>()

export function registerTool(tool: ToolDefinition) {
  tools.set(tool.name, tool)
}

export function getTool(name: string): ToolDefinition | undefined {
  return tools.get(name)
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values())
}

export function getToolSchemas(): Array<{ name: string; description: string; parameters: ToolParameter[] }> {
  return getAllTools().map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }))
}

export function formatToolsForLLM(): string {
  return getAllTools()
    .map((t) => {
      const params = t.parameters.map((p) => `  - ${p.name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`).join('\n')
      return `**${t.name}**: ${t.description}\nParameters:\n${params}`
    })
    .join('\n\n')
}
