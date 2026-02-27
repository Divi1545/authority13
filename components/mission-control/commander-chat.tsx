'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Wand2, KeyRound, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

// Keywords that suggest user wants to connect external services → prompt for API keys
const CONNECT_INTENT_KEYWORDS = [
  'connect', 'dashboard', 'api key', 'api keys', 'secret', 'integrate', 'integration',
  'webhook', 'stripe', 'slack', 'notion', 'airtable', 'hubspot', 'salesforce',
  'oauth', 'credentials', 'authenticate', 'authorize',
]

function detectConnectIntent(text: string): boolean {
  const lower = text.toLowerCase()
  return CONNECT_INTENT_KEYWORDS.some((kw) => lower.includes(kw))
}

interface CommanderChatProps {
  onTaskCreated?: () => void
  onRunStarted?: (runId: string, taskId: string) => void
}

export function CommanderChat({ onTaskCreated, onRunStarted }: CommanderChatProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content:
        "Ready when you are. Tell me your goal and I'll break it into executable tasks, route the right employees, and keep humans in the loop.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [progressSteps, setProgressSteps] = useState<string[]>([])
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

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

  // Auto-scroll when messages or progress steps change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, progressSteps])

  // Cleanup SSE and polling on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const pollForRunAndConnectSSE = (taskId: string) => {
    const maxAttempts = 60 // ~90 seconds
    let attempts = 0

    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/tasks/${taskId}`)
        const data = await res.json()
        const task = data?.task
        const activeRunId = task?.activeRunId
        const runs = task?.runs || []
        const runId = activeRunId || runs[0]?.id

        if (runId) {
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          setProgressSteps((prev) => [...prev, 'Worker picked up. Connecting to live stream...'])
          onRunStarted?.(runId, taskId)
          connectToSSE(runId)
        }
      } catch {
        // ignore
      }
      if (attempts >= maxAttempts && pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
        setProgressSteps((prev) => [...prev, 'Still queued. Check Task Breakdown tab for status.'])
        setLoading(false)
      }
    }, 1500)
  }

  const connectToSSE = (runId: string) => {
    eventSourceRef.current?.close()
    const es = new EventSource(`/api/stream/${runId}`)
    eventSourceRef.current = es

    es.addEventListener('run.started', () => {
      setProgressSteps((prev) => [...prev, 'Run started. Planning...'])
    })

    es.addEventListener('plan.created', () => {
      setProgressSteps((prev) => [...prev, 'Plan created. Building...'])
    })

    es.addEventListener('subtask.started', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || '{}')
        const title = data?.subtask?.title || 'Subtask'
        setProgressSteps((prev) => [...prev, `Implementing: ${title}`])
      } catch {
        setProgressSteps((prev) => [...prev, 'Implementing subtask...'])
      }
    })

    es.addEventListener('subtask.completed', () => {
      setProgressSteps((prev) => [...prev, 'Subtask completed.'])
    })

    es.addEventListener('log', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || '{}')
        const msg = data?.message || ''
        if (msg) setProgressSteps((prev) => [...prev, msg])
      } catch {
        // ignore
      }
    })

    es.addEventListener('run.completed', () => {
      setProgressSteps((prev) => [...prev, 'All done!'])
      cleanup()
      onTaskCreated?.()
    })

    const cleanup = () => {
      if (!eventSourceRef.current) return
      setLoading(false)
      es.close()
      eventSourceRef.current = null
    }

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return
      setProgressSteps((prev) => [...prev, 'Connection closed.'])
      cleanup()
      onTaskCreated?.()
    }
  }

  const handleSend = async () => {
    if (!message.trim() || hasApiKey === null) return

    if (hasApiKey === false) {
      const wantsToConnect = detectConnectIntent(message)
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        {
          role: 'assistant',
          content: wantsToConnect
            ? "To connect to external services or dashboards, I need your API keys first. Go to **Settings → Secrets** (or the Secrets tab in the right panel) and add your API keys (e.g. OpenAI, Anthropic, or the service you want to connect). Once connected, tell me again what you'd like to build or integrate."
            : "I'd love to help, but I need an AI model to work with. Please connect an API key (like OpenAI or Anthropic) in **Settings → Integrations** or the **Secrets** tab first. Once connected, I'll be ready to execute!",
        },
      ])
      setMessage('')
      return
    }

    // Clean up any in-flight SSE/poll from a previous task
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    const userMessage = message
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setProgressSteps(['Creating task...'])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create task')

      const taskId = data.taskId
      setProgressSteps((prev) => [...prev, 'Task queued. Waiting for worker...'])

      // Poll for run, then connect SSE
      pollForRunAndConnectSSE(taskId)

      // Show initial assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Task created. I'm working on it — watch the progress below and the Live Console for real-time updates.`,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
      setLoading(false)
      setProgressSteps([])
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
            <Card className="p-3 bg-neutral-50 border-neutral-200 max-w-[85%]">
              <p className="text-sm flex items-center gap-2 mb-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Working...
              </p>
              {progressSteps.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {progressSteps.map((step, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              )}
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
            disabled={loading || !message.trim() || hasApiKey === null}
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
