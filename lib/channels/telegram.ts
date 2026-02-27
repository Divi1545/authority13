import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import OpenAI from 'openai'

const TELEGRAM_API = 'https://api.telegram.org/bot'

export async function sendTelegramMessage(botToken: string, chatId: string | number, text: string, parseMode = 'Markdown') {
  const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  })
  return res.json()
}

export async function setTelegramWebhook(botToken: string, webhookUrl: string) {
  const res = await fetch(`${TELEGRAM_API}${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
  })
  return res.json()
}

export async function deleteTelegramWebhook(botToken: string) {
  const res = await fetch(`${TELEGRAM_API}${botToken}/deleteWebhook`, { method: 'POST' })
  return res.json()
}

export async function getTelegramBotInfo(botToken: string) {
  const res = await fetch(`${TELEGRAM_API}${botToken}/getMe`)
  return res.json()
}

export async function processIncomingMessage(workspaceId: string, chatId: string | number, text: string, senderName: string) {
  const apiKeySecret = await prisma.apiKeySecret.findFirst({
    where: { workspaceId, provider: { in: ['openai', 'deepseek', 'groq'] } },
  })
  if (!apiKeySecret) return 'No AI provider configured. Ask your admin to add an API key.'

  let apiKey: string
  try {
    const raw = decrypt(apiKeySecret.encryptedKey)
    const parsed = (() => { try { return JSON.parse(raw) } catch { return null } })()
    apiKey = parsed?.key || raw
  } catch {
    return 'Failed to load AI configuration.'
  }

  const isDeepseek = apiKeySecret.provider === 'deepseek'
  const isGroq = apiKeySecret.provider === 'groq'
  const client = new OpenAI({
    apiKey,
    ...(isDeepseek && { baseURL: 'https://api.deepseek.com' }),
    ...(isGroq && { baseURL: 'https://api.groq.com/openai/v1' }),
  })
  const model = isDeepseek ? 'deepseek-chat' : isGroq ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini'

  try {
    const res = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are Authority13, an AI Workforce assistant available via Telegram. You help ${senderName} with tasks, answer questions, and provide actionable advice. Be concise and helpful. Use markdown formatting.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    return res.choices[0]?.message?.content || 'I processed your request but have no response.'
  } catch (err: any) {
    return `Error: ${err.message}`
  }
}
