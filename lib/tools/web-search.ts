import { registerTool, type ToolResult } from './registry'

async function braveSearch(query: string): Promise<ToolResult> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) return { success: false, output: '' }

  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
    headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': apiKey },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) return { success: false, output: '' }

  const data = await res.json()
  const results = (data.web?.results || []).slice(0, 5).map((r: any, i: number) =>
    `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.description || ''}`
  )

  if (results.length === 0) return { success: false, output: '' }

  return {
    success: true,
    output: `Search results for "${query}":\n\n${results.join('\n\n')}`,
    data: data.web?.results?.slice(0, 5),
  }
}

async function duckDuckGoFallback(query: string): Promise<ToolResult> {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'Authority13-Agent/1.0' },
    signal: AbortSignal.timeout(10000),
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
    if (title) results.push(`${results.length + 1}. **${title}**: ${snippet}`)
  }

  if (results.length === 0) {
    return { success: true, output: `No results found for "${query}". Try different keywords.` }
  }

  return { success: true, output: `Search results for "${query}":\n\n${results.join('\n\n')}`, data: results }
}

registerTool({
  name: 'web_search',
  description: 'Search the web for current information, news, research, or facts.',
  parameters: [
    { name: 'query', type: 'string', description: 'The search query', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const query = params.query?.trim()
    if (!query) return { success: false, output: 'Missing query parameter' }

    try {
      const braveResult = await braveSearch(query)
      if (braveResult.success) return braveResult

      return await duckDuckGoFallback(query)
    } catch (err: any) {
      try {
        return await duckDuckGoFallback(query)
      } catch (fallbackErr: any) {
        return { success: false, output: `Search failed: ${fallbackErr.message}` }
      }
    }
  },
})
