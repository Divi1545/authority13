import OpenAI from 'openai'
import { AIProvider, Message, ChatOptions } from '../types'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      messages: messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    })

    return response.choices[0]?.message?.content || ''
  }
}
