import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'call_webhook',
  description: 'Send data to an external API or webhook endpoint. Use for integrations with external services.',
  parameters: [
    { name: 'url', type: 'string', description: 'The webhook/API URL', required: true },
    { name: 'method', type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE). Default: POST', required: false },
    { name: 'body', type: 'string', description: 'JSON body to send', required: false },
  ],
  async execute(params): Promise<ToolResult> {
    const { url, body } = params
    const method = (params.method || 'POST').toUpperCase()
    if (!url) return { success: false, output: 'Missing url parameter' }

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Authority13-Agent/1.0' },
        signal: AbortSignal.timeout(15000),
      }
      if (body && method !== 'GET') {
        options.body = typeof body === 'string' ? body : JSON.stringify(body)
      }

      const res = await fetch(url, options)
      const text = await res.text()
      const truncated = text.length > 2000 ? text.slice(0, 2000) + '...[truncated]' : text

      return {
        success: res.ok,
        output: `${method} ${url} → ${res.status}\n\n${truncated}`,
        data: { status: res.status, body: truncated },
      }
    } catch (err: any) {
      return { success: false, output: `Webhook failed: ${err.message}` }
    }
  },
})
