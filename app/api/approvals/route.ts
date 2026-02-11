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
    const status = searchParams.get('status') || 'pending'

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    await requireWorkspaceAccess((session.user as any).id, workspaceId)

    const approvals = await prisma.approvalRequest.findMany({
      where: {
        workspaceId,
        status,
      },
      include: {
        task: true,
        run: true,
        requestedByAgent: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}
