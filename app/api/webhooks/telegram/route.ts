import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { sendTelegramMessage, processIncomingMessage } from '@/lib/channels/telegram'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const tokenParam = url.searchParams.get('token')

    if (!tokenParam || tokenParam.length < 10) {
      return NextResponse.json({ ok: true })
    }

    const body = await req.json()
    const message = body?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    // Authenticate: token param must match a workspace ID with a telegram connector
    const connector = await prisma.connector.findFirst({
      where: { workspaceId: tokenParam, type: 'telegram', isEnabled: true },
    })

    if (!connector) {
      return NextResponse.json({ ok: true })
    }

    let botToken: string
    try {
      const config = JSON.parse(decrypt(connector.encryptedConfig))
      botToken = config.botToken
      if (!botToken) return NextResponse.json({ ok: true })
    } catch {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text
    const senderName = message.from?.first_name || 'User'

    if (text === '/start') {
      await sendTelegramMessage(botToken, chatId, 'Welcome to *Authority13*!\n\nI\'m your AI workforce assistant. Send me any task or question.\n\nExamples:\n- Create a marketing plan\n- Analyze these numbers\n- Draft an email to my team')
      return NextResponse.json({ ok: true })
    }

    if (text === '/help') {
      await sendTelegramMessage(botToken, chatId, '*Authority13 Commands*\n\n/start - Welcome message\n/help - Show this help\n\nOr just send any message!')
      return NextResponse.json({ ok: true })
    }

    if (text.length > 2000) {
      await sendTelegramMessage(botToken, chatId, 'Message too long. Please keep it under 2000 characters.')
      return NextResponse.json({ ok: true })
    }

    await sendTelegramMessage(botToken, chatId, 'Working on it...')
    const response = await processIncomingMessage(connector.workspaceId, chatId.toString(), text, senderName)
    await sendTelegramMessage(botToken, chatId, response)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[telegram-webhook] Error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: true })
  }
}
