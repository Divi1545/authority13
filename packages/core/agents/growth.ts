import { RuntimeConfig, Subtask, Message } from '../types'
import { OpenAIProvider } from '../providers/openai-provider'
import { prisma } from '../../../lib/db'
import { decrypt } from '../../../lib/encryption'
import { publishEvent } from '../../../lib/redis'

export class GrowthAgent {
  private config: RuntimeConfig
  private provider: OpenAIProvider | null = null

  constructor(config: RuntimeConfig) {
    this.config = config
  }

  private async getProvider(): Promise<OpenAIProvider> {
    if (this.provider) return this.provider

    const apiKeySecret = await prisma.apiKeySecret.findFirst({
      where: {
        workspaceId: this.config.workspaceId,
        provider: 'openai',
      },
    })

    if (!apiKeySecret) {
      throw new Error('OpenAI API key not configured')
    }

    const apiKey = decrypt(apiKeySecret.encryptedKey)
    this.provider = new OpenAIProvider(apiKey)
    return this.provider
  }

  async execute(subtask: Subtask): Promise<void> {
    const provider = await this.getProvider()

    const systemPrompt = `You are a Growth Agent specializing in marketing, outreach, lead generation, and content creation.

Execute the given subtask and provide a summary of your actions and results.

Available tools: ${subtask.tools_needed.join(', ')}

Be specific and actionable in your response.`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Execute this subtask:\n\nTitle: ${subtask.title}\nDescription: ${subtask.description}`,
      },
    ]

    const response = await provider.chat(messages, {
      temperature: 0.7,
    })

    // Log the result
    await publishEvent(`run:${this.config.runId}`, {
      type: 'log',
      data: {
        message: `Growth Agent: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`,
      },
      timestamp: Date.now(),
    })

    // Store the step
    const stepCount = await prisma.runStep.count({
      where: { runId: this.config.runId },
    })

    await prisma.runStep.create({
      data: {
        runId: this.config.runId,
        index: stepCount,
        type: 'tool_result',
        contentJson: JSON.stringify({
          agent: 'growth',
          subtask: subtask.title,
          result: response,
        }),
      },
    })
  }
}
