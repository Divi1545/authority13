import { RuntimeConfig, TaskPlan, Message } from '../types'
import { OpenAIProvider } from '../providers/openai-provider'
import { prisma } from '../../../lib/db'
import { decrypt } from '../../../lib/encryption'

export class CommanderAgent {
  private config: RuntimeConfig
  private provider: OpenAIProvider | null = null

  constructor(config: RuntimeConfig) {
    this.config = config
  }

  private async getProvider(): Promise<OpenAIProvider> {
    if (this.provider) return this.provider

    // Get OpenAI API key from workspace
    const apiKeySecret = await prisma.apiKeySecret.findFirst({
      where: {
        workspaceId: this.config.workspaceId,
        provider: 'openai',
      },
    })

    if (!apiKeySecret) {
      throw new Error('OpenAI API key not configured for this workspace')
    }

    const apiKey = decrypt(apiKeySecret.encryptedKey)
    this.provider = new OpenAIProvider(apiKey)
    return this.provider
  }

  async createPlan(objective: string): Promise<TaskPlan> {
    const provider = await this.getProvider()

    const systemPrompt = `You are the Commander Agent, responsible for creating detailed execution plans.

Your role:
- Analyze the user's objective
- Break it down into specific subtasks
- Assign each subtask to the right specialist agent (growth, ops, support, or analyst)
- Identify which actions need approval
- Return a valid JSON plan

Specialist agents:
- growth: Marketing, outreach, lead generation, content creation
- ops: Operations, scheduling, calendar, internal processes
- support: Customer service, ticket handling, user communication
- analyst: Data analysis, reports, insights, metrics

Output MUST be valid JSON matching this exact structure:
{
  "objective": "string",
  "assumptions": ["assumption1", "assumption2"],
  "constraints": ["constraint1"],
  "subtasks": [
    {
      "id": "S1",
      "agent": "growth",
      "title": "Clear action title",
      "description": "Detailed description",
      "tools_needed": ["tool1", "tool2"],
      "risk_level": "low",
      "requires_approval": false
    }
  ],
  "success_criteria": ["criterion1"],
  "next_question_for_user": null
}`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Create an execution plan for this objective:\n\n${objective}`,
      },
    ]

    const response = await provider.chat(messages, {
      temperature: 0.3,
    })

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }

      const plan: TaskPlan = JSON.parse(jsonStr)

      // Validate plan structure
      if (!plan.objective || !Array.isArray(plan.subtasks)) {
        throw new Error('Invalid plan structure')
      }

      return plan
    } catch (error) {
      console.error('Failed to parse plan:', response)
      throw new Error('Failed to generate valid task plan')
    }
  }
}
