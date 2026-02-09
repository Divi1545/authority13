import nodemailer from 'nodemailer'
import { BaseConnector } from './base'

export class SMTPConnector extends BaseConnector {
  private transporter: any

  constructor(config: any) {
    super(config)
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    })
  }

  async test(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('SMTP test failed:', error)
      return false
    }
  }

  async execute(toolName: string, input: any): Promise<any> {
    if (toolName === 'send_email') {
      const info = await this.transporter.sendMail({
        from: input.from || this.config.defaultFrom,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    }

    throw new Error(`Tool ${toolName} not supported by SMTP connector`)
  }
}
