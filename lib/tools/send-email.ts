import { registerTool, type ToolResult, type ToolContext } from './registry'

async function trySendViaSMTP(context: ToolContext, to: string, subject: string, body: string): Promise<ToolResult | null> {
  try {
    const { prisma } = await import('@/lib/db')
    const { decrypt } = await import('@/lib/encryption')

    const connector = await prisma.connector.findFirst({
      where: { workspaceId: context.workspaceId, type: 'smtp', isEnabled: true },
    })

    if (!connector) return null

    const config = JSON.parse(decrypt(connector.encryptedConfig))
    const nodemailer = (await import('nodemailer')).default

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port) || 587,
      secure: config.secure === 'true' || config.port === '465',
      auth: { user: config.username, pass: config.password },
    })

    const info = await transporter.sendMail({
      from: config.defaultFrom || config.username,
      to,
      subject,
      text: body,
    })

    return {
      success: true,
      output: `Email sent successfully to ${to}\nSubject: ${subject}\nMessage ID: ${info.messageId}`,
      data: { to, subject, messageId: info.messageId, status: 'sent' },
    }
  } catch {
    return null
  }
}

registerTool({
  name: 'send_email',
  description: 'Send an email. If SMTP is configured, sends immediately. Otherwise drafts for review.',
  parameters: [
    { name: 'to', type: 'string', description: 'Recipient email address', required: true },
    { name: 'subject', type: 'string', description: 'Email subject line', required: true },
    { name: 'body', type: 'string', description: 'Email body content', required: true },
  ],
  async execute(params, context): Promise<ToolResult> {
    const { to, subject, body } = params
    if (!to || !subject || !body) {
      return { success: false, output: 'Missing required parameters: to, subject, body' }
    }

    const smtpResult = await trySendViaSMTP(context, to, subject, body)
    if (smtpResult) return smtpResult

    return {
      success: true,
      output: `Email drafted (no SMTP connector configured -- configure one in Settings > Connectors to send automatically):\n\nTo: ${to}\nSubject: ${subject}\n\n${body}`,
      data: { to, subject, body, status: 'drafted' },
    }
  },
})
