import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'web_scrape',
  description: 'Fetch and extract text content from a URL. Use this to read articles, documentation, or web pages.',
  parameters: [
    { name: 'url', type: 'string', description: 'The URL to fetch', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const url = params.url
    if (!url) return { success: false, output: 'Missing url parameter' }

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Authority13-Agent/1.0', Accept: 'text/html' },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) return { success: false, output: `HTTP ${res.status}: Failed to fetch ${url}` }

      const html = await res.text()

      let text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()

      if (text.length > 4000) text = text.slice(0, 4000) + '...[truncated]'

      return { success: true, output: `Content from ${url}:\n\n${text}` }
    } catch (err: any) {
      return { success: false, output: `Scrape failed: ${err.message}` }
    }
  },
})
