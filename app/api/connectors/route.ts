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

    const connectors = await prisma.connector.findMany({
      where: { workspaceId },
      select: {
        id: true,
        type: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ connectors })
  } catch (error) {
    console.error('Get connectors error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connectors' },
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

    const { workspaceId, type, config } = await req.json()

    await requireWorkspaceAccess((session.user as any).id, workspaceId, 'admin')

    const encryptedConfig = encrypt(JSON.stringify(config))

    const connector = await prisma.connector.create({
      data: {
        workspaceId,
        type,
        encryptedConfig,
        isEnabled: true,
      },
    })

    await createAuditEvent({
      workspaceId,
      type: AuditEventTypes.CONNECTOR_ADDED,
      payload: { connectorId: connector.id, connectorType: type },
      actorUserId: (session.user as any).id,
    })

    return NextResponse.json({ connector })
  } catch (error) {
    console.error('Create connector error:', error)
    return NextResponse.json(
      { error: 'Failed to create connector' },
      { status: 500 }
    )
  }
}
