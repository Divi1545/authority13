import { Tool } from './registry'

export const webhookPostTool: Tool = {
  name: 'webhook_post',
  description: 'Post data to a webhook endpoint',
  requiresApproval: true,
  execute: async (input: any, context: any) => {
    const res = await fetch(input.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.headers || {}),
      },
      body: JSON.stringify(input.payload),
    })

    const data = await res.json().catch(() => ({}))

    return {
      success: res.ok,
      status: res.status,
      data,
    }
  },
}
