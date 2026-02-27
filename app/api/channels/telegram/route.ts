import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/encryption'
import { setTelegramWebhook, deleteTelegramWebhook, getTelegramBotInfo } from '@/lib/channels/telegram'
import { telegramConnectSchema, validateBody } from '@/lib/validation'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const connector = await prisma.connector.findFirst({
    where: { workspaceId: membership.workspaceId, type: 'telegram' },
  })

  if (!connector) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: true,
    enabled: connector.isEnabled,
    name: connector.name,
    createdAt: connector.createdAt,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const body = await req.json()
  const validation = validateBody(telegramConnectSchema, body)
  if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 })
  const { botToken } = validation.data

  try {
    const botInfo = await getTelegramBotInfo(botToken)
    if (!botInfo.ok) return NextResponse.json({ error: 'Invalid bot token' }, { status: 400 })

    const botName = botInfo.result.first_name || 'Telegram Bot'

    const webhookUrl = `${process.env.NEXTAUTH_URL || 'https://authority13.vercel.app'}/api/webhooks/telegram?token=${membership.workspaceId}`
    const webhookResult = await setTelegramWebhook(botToken, webhookUrl)
    if (!webhookResult.ok) {
      return NextResponse.json({ error: `Webhook setup failed: ${webhookResult.description}` }, { status: 500 })
    }

    const encryptedConfig = encrypt(JSON.stringify({ botToken, botName, chatId: null }))

    const existing = await prisma.connector.findFirst({
      where: { workspaceId: membership.workspaceId, type: 'telegram' },
    })

    if (existing) {
      await prisma.connector.update({
        where: { id: existing.id },
        data: { name: botName, encryptedConfig, isEnabled: true },
      })
    } else {
      await prisma.connector.create({
        data: {
          workspaceId: membership.workspaceId,
          type: 'telegram',
          name: botName,
          encryptedConfig,
          isEnabled: true,
        },
      })
    }

    return NextResponse.json({ success: true, botName })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const connector = await prisma.connector.findFirst({
    where: { workspaceId: membership.workspaceId, type: 'telegram' },
  })
  if (!connector) return NextResponse.json({ error: 'Not connected' }, { status: 404 })

  try {
    const config = JSON.parse(decrypt(connector.encryptedConfig))
    if (config.botToken) await deleteTelegramWebhook(config.botToken)
  } catch { /* ok */ }

  await prisma.connector.delete({ where: { id: connector.id } })

  return NextResponse.json({ success: true })
}
