'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Sparkles, Wand2, KeyRound, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CommanderChatProps {
  onTaskCreated?: () => void
}

export function CommanderChat({ onTaskCreated }: CommanderChatProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content:
        "Ready when you are. Tell me your goal and I'll break it into executable tasks, route the right employees, and keep humans in the loop.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  // Check if user has connected at least one LLM API key
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const wsRes = await fetch('/api/workspaces/current')
        const wsData = await wsRes.json()
        if (!wsData?.workspace?.id) return

        const keysRes = await fetch(`/api/settings/api-keys?workspaceId=${wsData.workspace.id}`)
        const keysData = await keysRes.json()
        const keys = keysData?.keys || []

        // Check for any LLM provider key
        const llmProviders = ['openai', 'anthropic', 'google', 'deepseek', 'mistral', 'cohere', 'groq', 'perplexity', 'together', 'fireworks', 'qwen', 'zhipu', 'moonshot', 'minimax', 'xai']
        const hasLlmKey = keys.some((k: any) => llmProviders.includes(k.provider))
        setHasApiKey(hasLlmKey)
      } catch {
        setHasApiKey(false)
      }
    }
    checkApiKeys()
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return

    // If no API key, prompt to connect
    if (hasApiKey === false) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        {
          role: 'assistant',
          content: "I'd love to help, but I need an AI model to work with. Please connect an API key (like OpenAI or Anthropic) in Settings → Integrations first. Once connected, I'll be ready to execute!",
        },
      ])
      setMessage('')
      return
    }

    const userMessage = message
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'Task created successfully!' },
      ])
      onTaskCreated?.()
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    'Create a 7-day launch plan for our new feature.',
    'Review open approvals and summarize what needs human action.',
    'Generate a growth experiment backlog and assign owners.',
  ]

  return (
    <div className="flex h-full flex-col">
      {/* API Key Onboarding Banner */}
      {hasApiKey === false && (
        <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Connect an API key to get started</p>
              <p className="text-xs text-amber-700 mt-1">
                Your AI agents need an LLM provider (like OpenAI or Anthropic) to work. Connect your API key and you'll be charged directly by the provider.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/app/settings">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    Connect API Key
                  </Button>
                </Link>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Get OpenAI Key
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`p-3 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-neutral-900 text-white border-neutral-800'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-neutral-50 border-neutral-200">
              <p className="text-sm flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Thinking...
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setMessage(action)}
              className="justify-start"
            >
              <Wand2 className="w-3 h-3 mr-1.5" />
              <span className="truncate max-w-[260px]">{action}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder={
              hasApiKey === false
                ? 'Connect an API key first to start using the commander...'
                : 'Describe what you want built, automated, or analyzed...'
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="resize-none min-h-[72px] max-h-40"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="h-auto self-stretch px-4"
          >
            <Send className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to run, Shift+Enter for newline.
        </p>
      </div>
    </div>
  )
}
