import { BaseConnector } from './base'

export class WebhookConnector extends BaseConnector {
  async test(): Promise<boolean> {
    try {
      const res = await fetch(this.config.url, {
        method: 'GET',
        headers: this.config.headers || {},
      })
      return res.ok
    } catch (error) {
      console.error('Webhook test failed:', error)
      return false
    }
  }

  async execute(toolName: string, input: any): Promise<any> {
    if (toolName === 'webhook_post') {
      const res = await fetch(input.url || this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.headers || {}),
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
    }

    throw new Error(`Tool ${toolName} not supported by Webhook connector`)
  }
}
