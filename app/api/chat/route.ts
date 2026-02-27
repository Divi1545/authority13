import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'
import { getAllTools, getTool, formatToolsForLLM, type ToolContext } from '@/lib/tools'
import { AGENT_CONFIGS, MAX_AGENT_DEPTH, MAX_CHILDREN_PER_AGENT } from '@/lib/agents/types'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

function sse(event: string, data: any): string {
  return `data: ${JSON.stringify({ event, ...data })}\n\n`
}

const COMMANDER_SYSTEM = `You are the Commander of Authority13, an AI Workforce Operating System.

When given an objective, create a structured execution plan as JSON:
{
  "plan": {
    "objective": "what the user wants",
    "subtasks": [
      {
        "id": "S1",
        "agent": "growth|ops|support|analyst",
        "title": "action title",
        "description": "what to do",
        "tools": ["tool_name"],
        "status": "pending"
      }
    ]
  }
}

Available tools that agents can use:
TOOLS_LIST

Keep plans to 3-6 subtasks. Assign the right specialist agent and suggest which tools to use. Be specific.`

function buildAgentPrompt(agentType: string, toolsList: string): string {
  const config = AGENT_CONFIGS[agentType] || AGENT_CONFIGS.analyst
  return `${config.systemPrompt}

You have access to these tools. To use a tool, respond with a JSON block:
\`\`\`tool
{"tool": "tool_name", "params": {"param1": "value1"}}
\`\`\`

After using tools, synthesize the results into a clear deliverable.

Available tools:
${toolsList}

If no tool is needed, just provide your expert output directly.`
}

async function callLLM(
  client: OpenAI,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature = 0.7
): Promise<{ content: string; tokens: number }> {
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: 2500,
  })
  return {
    content: res.choices[0]?.message?.content || '',
    tokens: (res.usage?.total_tokens || 0),
  }
}

function extractToolCalls(text: string): Array<{ tool: string; params: Record<string, any> }> {
  const calls: Array<{ tool: string; params: Record<string, any> }> = []
  const regex = /```tool\s*\n?([\s\S]*?)```/g
  let match
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      if (parsed.tool) calls.push(parsed)
    } catch { /* skip */ }
  }
  return calls
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
      where: { workspaceId: membership.workspaceId, provider: { in: ['openai', 'deepseek', 'groq'] } },
    })
    if (!apiKeySecret) {
      return new Response(JSON.stringify({ error: 'No API key configured. Add one in Settings → Integrations.' }), { status: 400 })
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

    const toolsList = formatToolsForLLM()
    const toolContext: ToolContext = { workspaceId: membership.workspaceId, apiKey, provider: apiKeySecret.provider, model }

    const encoder = new TextEncoder()
    let totalTokens = 0

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(encoder.encode(sse(event, data)))
        }

        try {
          // Phase 1: Commander creates plan
          send('status', { message: 'Commander is analyzing your objective...', phase: 'planning' })

          const commanderPrompt = COMMANDER_SYSTEM.replace('TOOLS_LIST', toolsList)
          const planResult = await callLLM(client, model, [
            { role: 'system', content: commanderPrompt },
            { role: 'user', content: `Create an execution plan for: ${message}` },
          ], 0.3)
          totalTokens += planResult.tokens

          let plan: any
          try {
            let jsonStr = planResult.content.trim()
            if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
            const parsed = JSON.parse(jsonStr)
            plan = parsed.plan || parsed
          } catch {
            plan = {
              objective: message,
              subtasks: [{ id: 'S1', agent: 'analyst', title: 'Analyze and execute request', description: planResult.content.slice(0, 300), tools: [], status: 'pending' }],
            }
          }

          send('plan', { plan, tokensUsed: totalTokens })

          // Phase 2: Execute each subtask with tools
          const subtasks = plan.subtasks || []
          const allResults: any[] = []

          for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i]
            const agentType = subtask.agent || 'analyst'
            const agentConfig = AGENT_CONFIGS[agentType] || AGENT_CONFIGS.analyst

            send('subtask_start', { index: i, subtask: { ...subtask, status: 'running' }, agent: { type: agentType, label: agentConfig.label, color: agentConfig.color } })

            const agentPrompt = buildAgentPrompt(agentType, toolsList)
            const agentResult = await callLLM(client, model, [
              { role: 'system', content: agentPrompt },
              { role: 'user', content: `Execute this task:\n\nTitle: ${subtask.title}\nDescription: ${subtask.description}\nOriginal objective: ${message}\n\nUse tools if helpful. Provide a detailed, actionable result.` },
            ])
            totalTokens += agentResult.tokens

            // Execute any tool calls the agent made
            const toolCalls = extractToolCalls(agentResult.content)
            const toolResults: any[] = []

            for (const tc of toolCalls) {
              const tool = getTool(tc.tool)
              if (tool) {
                send('tool_call', { index: i, tool: tc.tool, params: tc.params })
                const result = await tool.execute(tc.params, toolContext)
                toolResults.push({ tool: tc.tool, ...result })
                send('tool_result', { index: i, tool: tc.tool, success: result.success, output: result.output.slice(0, 300) })
              }
            }

            // If agent used tools, get a synthesis
            let finalResult = agentResult.content
            if (toolResults.length > 0) {
              const synthesisResult = await callLLM(client, model, [
                { role: 'system', content: agentPrompt },
                { role: 'user', content: `You executed these tools:\n\n${toolResults.map((r) => `Tool: ${r.tool}\nResult: ${r.output}`).join('\n\n')}\n\nNow synthesize the results into a clear deliverable for the task: ${subtask.title}` },
              ])
              totalTokens += synthesisResult.tokens
              finalResult = synthesisResult.content
            }

            // Clean tool blocks from final result
            finalResult = finalResult.replace(/```tool[\s\S]*?```/g, '').trim()

            allResults.push({ subtaskId: subtask.id, agent: agentType, title: subtask.title, result: finalResult, toolCalls: toolResults })

            send('subtask_done', {
              index: i,
              subtask: { ...subtask, status: 'done' },
              result: finalResult.slice(0, 800),
              toolCalls: toolResults.map((r) => ({ tool: r.tool, success: r.success })),
              tokensUsed: totalTokens,
            })
          }

          // Phase 3: Complete
          await prisma.task.update({ where: { id: task.id }, data: { status: 'completed' } })

          send('complete', {
            taskId: task.id,
            summary: `Completed ${subtasks.length} task(s) using ${allResults.reduce((a, r) => a + (r.toolCalls?.length || 0), 0)} tool call(s). Total tokens: ${totalTokens.toLocaleString()}`,
            results: allResults,
            tokensUsed: totalTokens,
          })
        } catch (err: any) {
          send('error', { message: err?.message || 'Execution failed' })
          await prisma.task.update({ where: { id: task.id }, data: { status: 'failed' } }).catch(() => {})
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed to process' }), { status: 500 })
  }
}
