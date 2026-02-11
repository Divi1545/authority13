import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'

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

    const agents = await prisma.agent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Get agents error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
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

    const { workspaceId, name, type } = await req.json()
    if (!workspaceId || !name || !type) {
      return NextResponse.json(
        { error: 'workspaceId, name, and type are required' },
        { status: 400 }
      )
    }

    await requireWorkspaceAccess((session.user as any).id, workspaceId, 'admin')

    const normalizedType = String(type).toLowerCase().trim()
    const normalizedName = String(name).trim()
    if (!normalizedName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const allowedTypes = ['commander', 'growth', 'ops', 'support', 'analyst']
    if (!allowedTypes.includes(normalizedType)) {
      return NextResponse.json(
        { error: `Invalid type. Use one of: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const agent = await prisma.agent.upsert({
      where: {
        workspaceId_type: {
          workspaceId,
          type: normalizedType,
        },
      },
      create: {
        workspaceId,
        name: normalizedName,
        type: normalizedType,
      },
      update: {
        name: normalizedName,
        isEnabled: true,
      },
    })

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error('Create/update agent error:', error)
    return NextResponse.json(
      { error: 'Failed to create or update agent' },
      { status: 500 }
    )
  }
}
