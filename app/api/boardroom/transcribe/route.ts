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
    where: { workspaceId: membership.workspaceId, provider: 'openai' },
  })
  if (!apiKeySecret) {
    return NextResponse.json({ error: 'OpenAI API key required for transcription. Add one in Settings > Integrations.' }, { status: 400 })
  }

  let apiKey: string
  try {
    const raw = decrypt(apiKeySecret.encryptedKey)
    const parsed = (() => { try { return JSON.parse(raw) } catch { return null } })()
    apiKey = parsed?.key || raw
  } catch {
    return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })

    const client = new OpenAI({ apiKey })

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    })

    return NextResponse.json({ transcript: transcription })
  } catch (err: any) {
    console.error('[boardroom/transcribe] Error:', err.message)
    return NextResponse.json({ error: `Transcription failed: ${err.message}` }, { status: 500 })
  }
}
