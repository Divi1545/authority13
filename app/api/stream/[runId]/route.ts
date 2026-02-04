import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSSEStream, createSSEResponse } from '@/lib/sse'
import { prisma } from '@/lib/db'
import { requireWorkspaceAccess } from '@/lib/workspace'

export async function GET(
  req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify access to this run
    const run = await prisma.run.findUnique({
      where: { id: params.runId },
      include: { task: true },
    })

    if (!run) {
      return new Response('Run not found', { status: 404 })
    }

    await requireWorkspaceAccess((session.user as any).id, run.task.workspaceId)

    // Create SSE stream
    const stream = createSSEStream(params.runId)
    return createSSEResponse(stream)
  } catch (error) {
    console.error('SSE stream error:', error)
    return new Response('Failed to create stream', { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
