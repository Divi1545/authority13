export interface Tool {
  name: string
  description: string
  requiresApproval: boolean
  execute: (input: any, context: any) => Promise<any>
}

class ToolRegistry {
  private tools: Map<string, Tool> = new Map()

  register(tool: Tool) {
    this.tools.set(tool.name, tool)
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }

  list(): Tool[] {
    return Array.from(this.tools.values())
  }
}

export const toolRegistry = new ToolRegistry()

// Register default tools
toolRegistry.register({
  name: 'search_db',
  description: 'Search database tables',
  requiresApproval: false,
  execute: async (input: any) => {
    // Mock implementation
    return { results: [] }
  },
})

toolRegistry.register({
  name: 'upsert_db',
  description: 'Insert or update database records',
  requiresApproval: true,
  execute: async (input: any) => {
    // Mock implementation
    return { success: true }
  },
})

toolRegistry.register({
  name: 'send_email',
  description: 'Send an email',
  requiresApproval: true,
  execute: async (input: any) => {
    // Mock implementation
    return { sent: true }
  },
})
