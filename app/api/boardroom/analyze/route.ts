import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const apiKeySecret = await prisma.apiKeySecret.findFirst({
    where: { workspaceId: membership.workspaceId, provider: { in: ['openai', 'deepseek', 'groq'] } },
  })
  if (!apiKeySecret) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })

  let apiKey: string
  try {
    const raw = decrypt(apiKeySecret.encryptedKey)
    const parsed = (() => { try { return JSON.parse(raw) } catch { return null } })()
    apiKey = parsed?.key || raw
  } catch {
    return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 })
  }

  const { transcript } = await req.json()
  if (!transcript) return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })

  try {
    const isDeepseek = apiKeySecret.provider === 'deepseek'
    const isGroq = apiKeySecret.provider === 'groq'
    const client = new OpenAI({
      apiKey,
      ...(isDeepseek && { baseURL: 'https://api.deepseek.com' }),
      ...(isGroq && { baseURL: 'https://api.groq.com/openai/v1' }),
    })
    const model = isDeepseek ? 'deepseek-chat' : isGroq ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini'

    const res = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You analyze meeting transcripts and return JSON with:
1. "summary" - A 2-3 sentence summary of the discussion
2. "actionItems" - An array of specific, actionable tasks mentioned or implied

Return ONLY valid JSON: {"summary": "...", "actionItems": ["...", "..."]}`,
        },
        { role: 'user', content: `Analyze this boardroom transcript:\n\n${transcript.slice(0, 3000)}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = res.choices[0]?.message?.content || ''
    let parsed: any
    try {
      let jsonStr = content.trim()
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      parsed = JSON.parse(jsonStr)
    } catch {
      parsed = { summary: content, actionItems: [] }
    }

    return NextResponse.json({
      summary: parsed.summary || '',
      actionItems: parsed.actionItems || [],
    })
  } catch (err: any) {
    console.error('[boardroom/analyze] Error:', err.message)
    return NextResponse.json({ error: `Analysis failed: ${err.message}` }, { status: 500 })
  }
}
