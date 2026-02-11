import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const run = await prisma.run.findUnique({
      where: { id: params.id },
      include: {
        task: true,
        steps: {
          orderBy: { index: 'asc' },
        },
      },
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    await requireWorkspaceAccess((session.user as any).id, run.task.workspaceId)

    return NextResponse.json({ run })
  } catch (error) {
    console.error('Get run error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch run' },
      { status: 500 }
    )
  }
}
