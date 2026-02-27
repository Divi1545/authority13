import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const COMMANDER_SYSTEM_PROMPT = `You are the Commander Agent of Authority13, an AI Workforce Operating System.

When the user gives you an objective, you MUST respond with a structured execution plan in this EXACT JSON format — no markdown, no explanation, just raw JSON:

{
  "plan": {
    "objective": "What the user wants",
    "subtasks": [
      {
        "id": "S1",
        "agent": "growth",
        "title": "Clear action title",
        "description": "What this agent will do",
        "status": "pending"
      }
    ]
  }
}

Agent types: growth (marketing, content, outreach), ops (operations, scheduling, processes), support (customer service, communication), analyst (data, reports, insights).

Keep plans to 3-6 subtasks. Be specific and actionable.`

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  growth: `You are the Growth Agent. Execute the given task related to marketing, content creation, lead generation, or outreach. Provide a detailed, actionable result. Be specific with copy, strategies, and deliverables.`,
  ops: `You are the Ops Agent. Execute the given task related to operations, scheduling, process optimization, or internal workflows. Provide concrete steps, timelines, and process documentation.`,
  support: `You are the Support Agent. Execute the given task related to customer service, user communication, ticket handling, or support documentation. Provide templates, scripts, and workflows.`,
  analyst: `You are the Analyst Agent. Execute the given task related to data analysis, reporting, metrics, or insights. Provide structured analysis, recommendations, and frameworks.`,
}

function createStreamEvent(event: string, data: any): string {
  return `data: ${JSON.stringify({ event, ...data })}\n\n`
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { message } = await req.json()

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: (session.user as any).id },
      include: { workspace: true },
    })

    if (!membership) {
      return new Response(JSON.stringify({ error: 'No workspace found' }), { status: 404 })
    }

    const apiKeySecret = await prisma.apiKeySecret.findFirst({
      where: {
        workspaceId: membership.workspaceId,
        provider: { in: ['openai', 'deepseek', 'groq'] },
      },
    })

    if (!apiKeySecret) {
      return new Response(
        JSON.stringify({ error: 'No API key configured. Add one in Settings → Integrations.' }),
        { status: 400 }
      )
    }

    let apiKey: string
    try {
      const raw = decrypt(apiKeySecret.encryptedKey)
      const parsed = (() => { try { return JSON.parse(raw) } catch { return null } })()
      apiKey = parsed?.key || raw
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to decrypt API key' }), { status: 500 })
    }

    const task = await prisma.task.create({
      data: {
        workspaceId: membership.workspaceId,
        createdByUserId: (session.user as any).id,
        title: message.substring(0, 100),
        objective: message,
        status: 'planning',
      },
    })

    await createAuditEvent({
      workspaceId: membership.workspaceId,
      type: AuditEventTypes.TASK_CREATED,
      payload: { taskId: task.id, title: task.title },
      actorUserId: (session.user as any).id,
    })

    const isDeepseek = apiKeySecret.provider === 'deepseek'
    const isGroq = apiKeySecret.provider === 'groq'
    const client = new OpenAI({
      apiKey,
      ...(isDeepseek && { baseURL: 'https://api.deepseek.com' }),
      ...(isGroq && { baseURL: 'https://api.groq.com/openai/v1' }),
    })
    const model = isDeepseek ? 'deepseek-chat' : isGroq ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini'

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(encoder.encode(createStreamEvent(event, data)))
        }

        try {
          send('status', { message: 'Commander is analyzing your objective...' })

          const planResponse = await client.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: COMMANDER_SYSTEM_PROMPT },
              { role: 'user', content: `Create an execution plan for: ${message}` },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          })

          const planText = planResponse.choices[0]?.message?.content || ''
          let plan: any
          try {
            let jsonStr = planText.trim()
            if (jsonStr.startsWith('```')) {
              jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
            }
            const parsed = JSON.parse(jsonStr)
            plan = parsed.plan || parsed
          } catch {
            plan = {
              objective: message,
              subtasks: [
                { id: 'S1', agent: 'analyst', title: 'Analyze request', description: planText.slice(0, 200), status: 'pending' },
              ],
            }
          }

          send('plan', { plan })

          const subtasks = plan.subtasks || []
          const results: any[] = []

          for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i]
            send('subtask_start', { index: i, subtask: { ...subtask, status: 'running' } })

            const agentPrompt = AGENT_SYSTEM_PROMPTS[subtask.agent] || AGENT_SYSTEM_PROMPTS.analyst

            const subtaskResponse = await client.chat.completions.create({
              model,
              messages: [
                { role: 'system', content: agentPrompt },
                { role: 'user', content: `Execute this task:\n\nTitle: ${subtask.title}\nDescription: ${subtask.description}\n\nOriginal objective: ${message}\n\nProvide a detailed, actionable result.` },
              ],
              temperature: 0.7,
              max_tokens: 1500,
            })

            const result = subtaskResponse.choices[0]?.message?.content || 'Completed.'
            results.push({ subtaskId: subtask.id, result })

            send('subtask_done', {
              index: i,
              subtask: { ...subtask, status: 'done' },
              result: result.slice(0, 500),
            })
          }

          await prisma.task.update({
            where: { id: task.id },
            data: { status: 'completed' },
          })

          send('complete', {
            taskId: task.id,
            summary: `Completed ${subtasks.length} subtask(s) for: ${plan.objective || message}`,
            results,
          })
        } catch (err: any) {
          send('error', { message: err?.message || 'Execution failed' })
          await prisma.task.update({
            where: { id: task.id },
            data: { status: 'failed' },
          }).catch(() => {})
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Failed to process' }), { status: 500 })
  }
}
