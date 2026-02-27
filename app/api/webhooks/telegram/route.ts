import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { sendTelegramMessage, processIncomingMessage } from '@/lib/channels/telegram'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = body?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text
    const senderName = message.from?.first_name || 'User'

    // Find workspace by matching telegram bot token from the webhook URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const tokenHash = pathParts[pathParts.length - 1] === 'route' ? url.searchParams.get('token') : null

    // Find all connectors of type 'telegram'
    const connectors = await prisma.connector.findMany({
      where: { type: 'telegram', isEnabled: true },
    })

    let matchedConnector = null
    let botToken = ''

    for (const connector of connectors) {
      try {
        const config = JSON.parse(decrypt(connector.encryptedConfig))
        if (config.botToken) {
          botToken = config.botToken
          matchedConnector = connector
          break
        }
      } catch {
        continue
      }
    }

    if (!matchedConnector || !botToken) {
      return NextResponse.json({ ok: true })
    }

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(botToken, chatId, '👋 Welcome to *Authority13*!\n\nI\'m your AI workforce assistant. Send me any task or question and I\'ll help you out.\n\nExamples:\n• Create a marketing plan for my product\n• Analyze these sales numbers\n• Draft an email to my team')
      return NextResponse.json({ ok: true })
    }

    // Handle /help command
    if (text === '/help') {
      await sendTelegramMessage(botToken, chatId, '🤖 *Authority13 Commands*\n\n/start - Welcome message\n/help - Show this help\n\nOr just send any message and I\'ll assist you!')
      return NextResponse.json({ ok: true })
    }

    // Process with AI
    await sendTelegramMessage(botToken, chatId, '⏳ Working on it...')

    const response = await processIncomingMessage(matchedConnector.workspaceId, chatId.toString(), text, senderName)

    await sendTelegramMessage(botToken, chatId, response)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
