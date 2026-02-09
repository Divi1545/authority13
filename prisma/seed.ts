import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@authority13.ai' },
    update: {},
    create: {
      email: 'admin@authority13.ai',
      name: 'Super Admin',
      passwordHash: await hash('admin1234', 12),
      isSuperAdmin: true,
    },
  })

  console.log('Created super admin:', superAdmin.email)

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@authority13.ai' },
    update: {},
    create: {
      email: 'demo@authority13.ai',
      name: 'Demo User',
      passwordHash: await hash('demo1234', 12),
      isSuperAdmin: false,
    },
  })

  console.log('Created demo user:', demoUser.email)

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      members: {
        create: {
          userId: demoUser.id,
          role: 'admin',
        },
      },
    },
  })

  console.log('Created demo workspace:', demoWorkspace.name)

  // Create agents for demo workspace
  const agentTypes = [
    { name: 'Commander', type: 'commander' },
    { name: 'Growth Agent', type: 'growth' },
    { name: 'Ops Agent', type: 'ops' },
    { name: 'Support Agent', type: 'support' },
    { name: 'Analyst Agent', type: 'analyst' },
  ]

  for (const agentType of agentTypes) {
    await prisma.agent.upsert({
      where: {
        workspaceId_type: {
          workspaceId: demoWorkspace.id,
          type: agentType.type,
        },
      },
      update: {},
      create: {
        workspaceId: demoWorkspace.id,
        name: agentType.name,
        type: agentType.type,
        systemPromptVersion: '1.0',
        policyJson: JSON.stringify({}),
        isEnabled: true,
      },
    })
  }

  console.log('Created agents')

  // Create sample task
  const sampleTask = await prisma.task.create({
    data: {
      workspaceId: demoWorkspace.id,
      createdByUserId: demoUser.id,
      title: 'Draft outreach to 10 leads',
      objective:
        'Create personalized outreach emails for 10 potential leads in our database. Each email should be professional, reference their company, and propose a meeting.',
      status: 'pending',
      priority: 'medium',
      requiresApproval: true,
    },
  })

  console.log('Created sample task:', sampleTask.title)

  // Create sample meeting session
  const sampleMeeting = await prisma.meetingSession.create({
    data: {
      workspaceId: demoWorkspace.id,
      title: 'Weekly Strategy Review',
      status: 'completed',
      transcriptText: `User: Let's review our outreach performance this week.

Commander: Analyzing outreach metrics. We sent 45 emails this week with a 22% open rate and 8% response rate.

User: Can we improve those numbers?

Commander: Based on the data, I recommend:
1. A/B testing subject lines
2. Personalizing the first paragraph more
3. Including a clear call-to-action

User: Sounds good. Create a task to implement those improvements.

Commander: Task created: "Optimize email outreach strategy".`,
      notesJson: JSON.stringify({
        notes: [
          '45 emails sent this week',
          '22% open rate, 8% response rate',
          'Need to improve personalization',
          'Test different subject lines',
        ],
      }),
      decisionsJson: JSON.stringify({
        decisions: ['Create task to optimize email outreach', 'Implement A/B testing'],
      }),
    },
  })

  console.log('Created sample meeting:', sampleMeeting.title)

  // Create audit event
  await prisma.auditEvent.create({
    data: {
      workspaceId: demoWorkspace.id,
      type: 'workspace.created',
      payloadJson: JSON.stringify({
        message: 'Demo workspace initialized with sample data',
      }),
      actorUserId: demoUser.id,
    },
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
