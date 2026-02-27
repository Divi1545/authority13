import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { createAuditEvent, AuditEventTypes } from '@/lib/audit'
import { getTool, formatToolsForLLM, type ToolContext } from '@/lib/tools'
import { AGENT_CONFIGS } from '@/lib/agents/types'
import { chatMessageSchema, validateBody } from '@/lib/validation'
import { estimateCost, checkSpendLimit } from '@/lib/cost-estimator'
import { getMemoryContext, saveMemory } from '@/lib/memory/store'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

function sse(event: string, data: any): string {
  return `data: ${JSON.stringify({ event, ...data })}\n\n`
}

const LLM_TIMEOUT = 90_000

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

Keep plans to 3-6 subtasks. Assign the right specialist agent and suggest which tools to use. Be specific and actionable.`

function buildAgentPrompt(agentType: string, toolsList: string, memoryContext: string): string {
  const config = AGENT_CONFIGS[agentType] || AGENT_CONFIGS.analyst
  return `${config.systemPrompt}

You have access to these tools. To use a tool, respond with a JSON block:
\`\`\`tool
{"tool": "tool_name", "params": {"param1": "value1"}}
\`\`\`

After using tools, synthesize the results into a clear deliverable.

Available tools:
${toolsList}

If no tool is needed, just provide your expert output directly.${memoryContext}`
}

async function callLLM(
  client: OpenAI,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature = 0.7
): Promise<{ content: string; promptTokens: number; completionTokens: number; totalTokens: number }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT)

  try {
    const res = await client.chat.completions.create(
      { model, messages, temperature, max_tokens: 2500 },
      { signal: controller.signal }
    )
    return {
      content: res.choices[0]?.message?.content || '',
      promptTokens: res.usage?.prompt_tokens || 0,
      completionTokens: res.usage?.completion_tokens || 0,
      totalTokens: res.usage?.total_tokens || 0,
    }
  } finally {
    clearTimeout(timeout)
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
    } catch { /* skip malformed */ }
  }
  return calls
}

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), { status: 401 })
    }

    const body = await req.json()
    const validation = validateBody(chatMessageSchema, body)
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error, code: 'VALIDATION_ERROR' }), { status: 400 })
    }
    const { message } = validation.data

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: (session.user as any).id },
      include: { workspace: true },
    })
    if (!membership) {
      return new Response(JSON.stringify({ error: 'No workspace found', code: 'NO_WORKSPACE' }), { status: 404 })
    }

    const apiKeySecret = await prisma.apiKeySecret.findFirst({
      where: { workspaceId: membership.workspaceId, provider: { in: ['openai', 'deepseek', 'groq'] } },
    })
    if (!apiKeySecret) {
      return new Response(JSON.stringify({ error: 'No API key configured. Add one in Settings > Integrations.', code: 'NO_API_KEY' }), { status: 400 })
    }

    // Check spend limits before starting
    const spendCheck = await checkSpendLimit(membership.workspaceId, 0.01)
    if (!spendCheck.allowed) {
      return new Response(JSON.stringify({ error: spendCheck.reason || 'Spend limit exceeded', code: 'SPEND_LIMIT' }), { status: 429 })
    }

    let apiKey: string
    try {
      const raw = decrypt(apiKeySecret.encryptedKey)
      const parsed = (() => { try { return JSON.parse(raw) } catch { return null } })()
      apiKey = parsed?.key || raw
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to decrypt API key', code: 'DECRYPT_ERROR' }), { status: 500 })
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

    // Create a Run record for cost tracking
    const run = await prisma.run.create({
      data: { taskId: task.id, status: 'started', provider: apiKeySecret.provider, model: 'auto' },
    })

    await createAuditEvent({
      workspaceId: membership.workspaceId,
      type: AuditEventTypes.TASK_CREATED,
      payload: { taskId: task.id, runId: run.id, title: task.title },
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

    // Load memory context
    const memoryContext = await getMemoryContext(membership.workspaceId, message)

    const encoder = new TextEncoder()
    let totalPromptTokens = 0
    let totalCompletionTokens = 0

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          try { controller.enqueue(encoder.encode(sse(event, data))) } catch { /* stream closed */ }
        }

        try {
          send('status', { message: 'Commander is analyzing your objective...', phase: 'planning' })

          const commanderPrompt = COMMANDER_SYSTEM.replace('TOOLS_LIST', toolsList) + memoryContext
          const planResult = await callLLM(client, model, [
            { role: 'system', content: commanderPrompt },
            { role: 'user', content: `Create an execution plan for: ${message}` },
          ], 0.3)
          totalPromptTokens += planResult.promptTokens
          totalCompletionTokens += planResult.completionTokens

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

          const totalTokens = totalPromptTokens + totalCompletionTokens
          send('plan', { plan, tokensUsed: totalTokens })

          const subtasks = plan.subtasks || []
          const allResults: any[] = []

          for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i]
            const agentType = subtask.agent || 'analyst'
            const agentConfig = AGENT_CONFIGS[agentType] || AGENT_CONFIGS.analyst

            send('subtask_start', {
              index: i,
              subtask: { ...subtask, status: 'running' },
              agent: { type: agentType, label: agentConfig.label, color: agentConfig.color },
            })

            const agentPrompt = buildAgentPrompt(agentType, toolsList, memoryContext)
            const agentResult = await callLLM(client, model, [
              { role: 'system', content: agentPrompt },
              { role: 'user', content: `Execute this task:\n\nTitle: ${subtask.title}\nDescription: ${subtask.description}\nOriginal objective: ${message}\n\nUse tools if helpful. Provide a detailed, actionable result.` },
            ])
            totalPromptTokens += agentResult.promptTokens
            totalCompletionTokens += agentResult.completionTokens

            const toolCalls = extractToolCalls(agentResult.content)
            const toolResults: any[] = []

            for (const tc of toolCalls) {
              const tool = getTool(tc.tool)
              if (tool) {
                send('tool_call', { index: i, tool: tc.tool, params: tc.params })
                try {
                  const result = await tool.execute(tc.params, toolContext)
                  toolResults.push({ tool: tc.tool, ...result })
                  send('tool_result', { index: i, tool: tc.tool, success: result.success, output: result.output.slice(0, 300) })
                } catch (toolErr: any) {
                  send('tool_result', { index: i, tool: tc.tool, success: false, output: `Tool error: ${toolErr.message}` })
                }
              }
            }

            let finalResult = agentResult.content
            if (toolResults.length > 0) {
              const synthesisResult = await callLLM(client, model, [
                { role: 'system', content: agentPrompt },
                { role: 'user', content: `You executed these tools:\n\n${toolResults.map((r) => `Tool: ${r.tool}\nResult: ${r.output}`).join('\n\n')}\n\nNow synthesize the results into a clear deliverable for: ${subtask.title}` },
              ])
              totalPromptTokens += synthesisResult.promptTokens
              totalCompletionTokens += synthesisResult.completionTokens
              finalResult = synthesisResult.content
            }

            finalResult = finalResult.replace(/```tool[\s\S]*?```/g, '').trim()
            allResults.push({ subtaskId: subtask.id, agent: agentType, title: subtask.title, result: finalResult, toolCalls: toolResults })

            const currentTotal = totalPromptTokens + totalCompletionTokens
            send('subtask_done', {
              index: i,
              subtask: { ...subtask, status: 'done' },
              result: finalResult.slice(0, 800),
              toolCalls: toolResults.map((r) => ({ tool: r.tool, success: r.success })),
              tokensUsed: currentTotal,
            })
          }

          // Calculate cost and update Run record
          const finalTokens = totalPromptTokens + totalCompletionTokens
          const cost = estimateCost(model, totalPromptTokens, totalCompletionTokens)

          await prisma.run.update({
            where: { id: run.id },
            data: {
              status: 'completed',
              endedAt: new Date(),
              model,
              promptTokens: totalPromptTokens,
              completionTokens: totalCompletionTokens,
              costEstimateUsd: cost,
            },
          })

          await prisma.task.update({ where: { id: task.id }, data: { status: 'completed', activeRunId: run.id } })

          // Auto-save a memory entry
          const memorySummary = `Task: ${message.slice(0, 100)}. Completed ${subtasks.length} subtask(s) with ${allResults.reduce((a, r) => a + (r.toolCalls?.length || 0), 0)} tool call(s). Cost: $${cost.toFixed(4)}.`
          await saveMemory(membership.workspaceId, 'commander', memorySummary, { taskId: task.id, category: 'result' }).catch(() => {})

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          send('complete', {
            taskId: task.id,
            summary: `Completed ${subtasks.length} task(s) with ${allResults.reduce((a, r) => a + (r.toolCalls?.length || 0), 0)} tool call(s). Tokens: ${finalTokens.toLocaleString()} | Cost: $${cost.toFixed(4)} | Time: ${elapsed}s`,
            results: allResults,
            tokensUsed: finalTokens,
            costUsd: cost,
          })
        } catch (err: any) {
          const errMsg = err?.name === 'AbortError' ? 'Request timed out. Try a simpler objective.' : (err?.message || 'Execution failed')
          send('error', { message: errMsg })
          await prisma.run.update({ where: { id: run.id }, data: { status: 'failed', endedAt: new Date(), errorJson: JSON.stringify({ message: errMsg }) } }).catch(() => {})
          await prisma.task.update({ where: { id: task.id }, data: { status: 'failed' } }).catch(() => {})
          console.error(`[chat] Task ${task.id} failed after ${((Date.now() - startTime) / 1000).toFixed(1)}s:`, errMsg)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (error: any) {
    console.error('[chat] Request error:', error?.message)
    return new Response(JSON.stringify({ error: error?.message || 'Failed to process', code: 'INTERNAL_ERROR' }), { status: 500 })
  }
}
