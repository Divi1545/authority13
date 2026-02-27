import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { teamInviteSchema, validateBody } from '@/lib/validation'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: membership.workspaceId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.createdAt,
    })),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })
  if (membership.role !== 'admin' && membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
  }

  const body = await req.json()
  const validation = validateBody(teamInviteSchema, body)
  if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 })
  const { email, role } = validation.data

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 })
  }

  const existing = await prisma.workspaceMember.findFirst({
    where: { workspaceId: membership.workspaceId, userId: targetUser.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'User is already a workspace member' }, { status: 409 })
  }

  await prisma.workspaceMember.create({
    data: { workspaceId: membership.workspaceId, userId: targetUser.id, role },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })
  if (membership.role !== 'admin' && membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 })
  }

  const { memberId, role } = await req.json()
  await prisma.workspaceMember.update({ where: { id: memberId }, data: { role } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: (session.user as any).id },
  })
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 })
  if (membership.role !== 'admin' && membership.role !== 'owner') {
    return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
  }

  const url = new URL(req.url)
  const memberId = url.searchParams.get('memberId')
  if (!memberId) return NextResponse.json({ error: 'Missing memberId' }, { status: 400 })

  if (memberId === membership.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } })
  return NextResponse.json({ success: true })
}
