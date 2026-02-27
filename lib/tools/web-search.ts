import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'web_search',
  description: 'Search the web for current information. Use this when you need up-to-date facts, news, or research.',
  parameters: [
    { name: 'query', type: 'string', description: 'The search query', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const query = params.query
    if (!query) return { success: false, output: 'Missing query parameter' }

    try {
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Authority13-Agent/1.0' },
      })
      const html = await res.text()

      const results: string[] = []
      const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
      const titleRegex = /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/gi
      let match

      while ((match = titleRegex.exec(html)) !== null && results.length < 5) {
        const title = match[1].replace(/<[^>]*>/g, '').trim()
        const snippetMatch = snippetRegex.exec(html)
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : ''
        if (title) results.push(`${title}: ${snippet}`)
      }

      if (results.length === 0) {
        return { success: true, output: `No results found for "${query}". Try a different search term.` }
      }

      return {
        success: true,
        output: `Search results for "${query}":\n\n${results.map((r, i) => `${i + 1}. ${r}`).join('\n\n')}`,
        data: results,
      }
    } catch (err: any) {
      return { success: false, output: `Search failed: ${err.message}` }
    }
  },
})
