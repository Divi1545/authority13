import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'
import { encrypt, maskSecret } from '@/lib/encryption'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    await requireWorkspaceAccess((session.user as any).id, workspaceId)

    const keys = await prisma.apiKeySecret.findMany({
      where: { workspaceId },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, provider, apiKey } = await req.json()

    await requireWorkspaceAccess((session.user as any).id, workspaceId, 'admin')

    if (!['openai', 'anthropic', 'google'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const encryptedKey = encrypt(apiKey)

    // Upsert API key
    const key = await prisma.apiKeySecret.upsert({
      where: {
        workspaceId_provider: {
          workspaceId,
          provider,
        },
      },
      create: {
        workspaceId,
        provider,
        encryptedKey,
      },
      update: {
        encryptedKey,
      },
    })

    await createAuditEvent({
      workspaceId,
      type: AuditEventTypes.API_KEY_ADDED,
      payload: { provider, masked: maskSecret(apiKey) },
      actorUserId: (session.user as any).id,
    })

    return NextResponse.json({
      success: true,
      key: {
        id: key.id,
        provider: key.provider,
      },
    })
  } catch (error) {
    console.error('Save API key error:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    )
  }
}
