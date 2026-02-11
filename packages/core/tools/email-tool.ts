import { Tool } from './registry'
import { prisma } from '../../../lib/db'
import { decrypt } from '../../../lib/encryption'
import { SMTPConnector } from '../../../lib/connectors/smtp'

export const sendEmailTool: Tool = {
  name: 'send_email',
  description: 'Send an email via configured SMTP',
  requiresApproval: true,
  execute: async (input: any, context: any) => {
    // Get SMTP connector for workspace
    const connector = await prisma.connector.findFirst({
      where: {
        workspaceId: context.workspaceId,
        type: 'smtp',
        isEnabled: true,
      },
    })

    if (!connector) {
      throw new Error('SMTP connector not configured')
    }

    const config = JSON.parse(decrypt(connector.encryptedConfig))
    const smtp = new SMTPConnector(config)

    const result = await smtp.execute('send_email', input)
    return result
  },
}
