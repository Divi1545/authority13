import { registerTool, type ToolResult } from './registry'

registerTool({
  name: 'send_email',
  description: 'Draft an email. Returns the formatted email for review. Use when the task involves email communication.',
  parameters: [
    { name: 'to', type: 'string', description: 'Recipient email address', required: true },
    { name: 'subject', type: 'string', description: 'Email subject line', required: true },
    { name: 'body', type: 'string', description: 'Email body content', required: true },
  ],
  async execute(params): Promise<ToolResult> {
    const { to, subject, body } = params
    if (!to || !subject || !body) {
      return { success: false, output: 'Missing required parameters: to, subject, body' }
    }

    const draft = `📧 Email Draft:\nTo: ${to}\nSubject: ${subject}\n\n${body}`

    return {
      success: true,
      output: draft,
      data: { to, subject, body, status: 'drafted' },
    }
  },
})
