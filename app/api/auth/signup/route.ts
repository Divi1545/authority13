import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json()

    // Validate input
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Create user and workspace
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
        // Create default agents
        agents: {
          create: [
            {
              name: 'Commander',
              type: 'commander',
              systemPromptVersion: '1.0',
              policyJson: JSON.stringify({}),
              isEnabled: true,
            },
            {
              name: 'Growth Agent',
              type: 'growth',
              systemPromptVersion: '1.0',
              policyJson: JSON.stringify({}),
              isEnabled: true,
            },
            {
              name: 'Ops Agent',
              type: 'ops',
              systemPromptVersion: '1.0',
              policyJson: JSON.stringify({}),
              isEnabled: true,
            },
            {
              name: 'Support Agent',
              type: 'support',
              systemPromptVersion: '1.0',
              policyJson: JSON.stringify({}),
              isEnabled: true,
            },
            {
              name: 'Analyst Agent',
              type: 'analyst',
              systemPromptVersion: '1.0',
              policyJson: JSON.stringify({}),
              isEnabled: true,
            },
          ],
        },
      },
    })

    // Create audit event
    await createAuditEvent({
      workspaceId: workspace.id,
      type: AuditEventTypes.WORKSPACE_CREATED,
      payload: { workspaceName, userEmail: email },
      actorUserId: user.id,
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
