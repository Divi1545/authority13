import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRecentMemories, searchMemory } from '@/lib/memory/store'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const url = new URL(req.url)
  const query = url.searchParams.get('q')

  const memories = query
    ? await searchMemory(membership.workspaceId, query, 20)
    : await getRecentMemories(membership.workspaceId, 20)

  return NextResponse.json({ memories })
}
