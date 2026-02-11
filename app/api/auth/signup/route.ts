import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'

export async function POST(req: Request) {
  const diagnostics: any = {
    step: 'init',
    timestamp: new Date().toISOString(),
  }

  try {
    const { name, email, password, workspaceName } = await req.json()
    diagnostics.step = 'parsed_request'
    diagnostics.hasName = !!name
    diagnostics.hasEmail = !!email
    diagnostics.hasPassword = !!password
    diagnostics.hasWorkspaceName = !!workspaceName

    // Validate input
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    diagnostics.step = 'checking_existing_user'
    // Check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      })
      diagnostics.step = 'user_check_complete'
      diagnostics.userExists = !!existingUser
    } catch (dbError: any) {
      diagnostics.step = 'user_check_failed'
      diagnostics.dbError = {
        message: dbError?.message,
        code: dbError?.code,
        meta: dbError?.meta,
      }
      throw new Error(`Database query failed at user check: ${dbError?.message}`)
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    diagnostics.step = 'hashing_password'
    // Hash password
    const passwordHash = await hash(password, 12)
    diagnostics.step = 'password_hashed'

    // Create user and workspace
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    diagnostics.step = 'creating_user'
    diagnostics.slug = slug

    let user
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })
      diagnostics.step = 'user_created'
      diagnostics.userId = user.id
    } catch (createUserError: any) {
      diagnostics.step = 'user_creation_failed'
      diagnostics.createUserError = {
        message: createUserError?.message,
        code: createUserError?.code,
        meta: createUserError?.meta,
      }
      throw new Error(`User creation failed: ${createUserError?.message}`)
    }

    diagnostics.step = 'creating_workspace'
    let workspace
    try {
      workspace = await prisma.workspace.create({
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
      diagnostics.step = 'workspace_created'
      diagnostics.workspaceId = workspace.id
    } catch (createWorkspaceError: any) {
      diagnostics.step = 'workspace_creation_failed'
      diagnostics.createWorkspaceError = {
        message: createWorkspaceError?.message,
        code: createWorkspaceError?.code,
        meta: createWorkspaceError?.meta,
      }
      throw new Error(`Workspace creation failed: ${createWorkspaceError?.message}`)
    }

    diagnostics.step = 'creating_audit_event'
    // Create audit event
    try {
      await createAuditEvent({
        workspaceId: workspace.id,
        type: AuditEventTypes.WORKSPACE_CREATED,
        payload: { workspaceName, userEmail: email },
        actorUserId: user.id,
      })
      diagnostics.step = 'completed'
    } catch (auditError: any) {
      // Audit failure shouldn't block signup, just log it
      diagnostics.auditWarning = auditError?.message
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    console.error('Diagnostics:', diagnostics)
    return NextResponse.json(
      {
        error: 'Failed to create account',
        debug: error?.message || String(error),
        code: error?.code,
        diagnostics,
      },
      { status: 500 }
    )
  }
}
