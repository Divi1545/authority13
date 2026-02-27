import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'memory_search',
  description: 'Search agent memory for past context, decisions, or results. Use when you need to recall previous work.',
  parameters: [
    { name: 'query', type: 'string', description: 'What to search for in memory', required: true },
  ],
  async execute(params, context): Promise<ToolResult> {
    const { query } = params
    if (!query) return { success: false, output: 'Missing query parameter' }

    try {
      const { searchMemory } = await import('@/lib/memory/store')
      const results = await searchMemory(context.workspaceId, query, 5)

      if (results.length === 0) {
        return { success: true, output: `No memories found for "${query}".` }
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. [${r.agentType}] ${r.content.slice(0, 200)}${r.content.length > 200 ? '...' : ''} (${r.createdAt.toLocaleDateString()})`
      ).join('\n\n')

      return { success: true, output: `Memory search results for "${query}":\n\n${formatted}`, data: results }
    } catch (err: any) {
      return { success: false, output: `Memory search failed: ${err.message}` }
    }
  },
})

registerTool({
  name: 'memory_save',
  description: 'Save important information to agent memory for future reference.',
  parameters: [
    { name: 'content', type: 'string', description: 'The information to remember', required: true },
    { name: 'category', type: 'string', description: 'Category: decision, result, context, insight', required: false },
  ],
  async execute(params, context): Promise<ToolResult> {
    const { content, category } = params
    if (!content) return { success: false, output: 'Missing content parameter' }

    try {
      const { saveMemory } = await import('@/lib/memory/store')
      await saveMemory(context.workspaceId, 'agent', content, { category: category || 'general' })
      return { success: true, output: `Saved to memory: "${content.slice(0, 100)}..."` }
    } catch (err: any) {
      return { success: false, output: `Memory save failed: ${err.message}` }
    }
  },
})
