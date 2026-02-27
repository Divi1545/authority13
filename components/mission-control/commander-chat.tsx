'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Wand2,
  KeyRound,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  growth: { label: 'Growth Agent', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ops: { label: 'Ops Agent', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  support: { label: 'Support Agent', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  analyst: { label: 'Analyst Agent', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

interface Subtask {
  id: string
  agent: string
  title: string
  description: string
  status: 'pending' | 'running' | 'done'
}

interface SubtaskResult {
  index: number
  result: string
}

interface CommanderChatProps {
  onTaskCreated?: () => void
}

export function CommanderChat({ onTaskCreated }: CommanderChatProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  const [statusMessage, setStatusMessage] = useState('')
  const [plan, setPlan] = useState<{ objective: string; subtasks: Subtask[] } | null>(null)
  const [subtaskResults, setSubtaskResults] = useState<Record<number, string>>({})
  const [expandedResults, setExpandedResults] = useState<Record<number, boolean>>({})
  const [completeSummary, setCompleteSummary] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [history, setHistory] = useState<Array<{ role: string; content: string; plan?: any; results?: any[] }>>([])

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const wsRes = await fetch('/api/workspaces/current')
        const wsData = await wsRes.json()
        if (!wsData?.workspace?.id) return
        const keysRes = await fetch(`/api/settings/api-keys?workspaceId=${wsData.workspace.id}`)
        const keysData = await keysRes.json()
        const keys = keysData?.keys || []
        const llmProviders = ['openai', 'anthropic', 'google', 'deepseek', 'mistral', 'cohere', 'groq', 'perplexity', 'together', 'fireworks', 'xai']
        setHasApiKey(keys.some((k: any) => llmProviders.includes(k.provider)))
      } catch {
        setHasApiKey(false)
      }
    }
    checkApiKeys()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [statusMessage, plan, subtaskResults, completeSummary, errorMessage, history])

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const resetExecution = () => {
    setStatusMessage('')
    setPlan(null)
    setSubtaskResults({})
    setExpandedResults({})
    setCompleteSummary('')
    setErrorMessage('')
  }

  const handleSend = async () => {
    if (!message.trim() || hasApiKey === null || loading) return

    if (hasApiKey === false) {
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: "Connect an API key (like OpenAI) in Settings → Integrations first. Once connected, I'll execute your tasks." },
      ])
      setMessage('')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage = message
    setMessage('')
    setHistory((prev) => [...prev, { role: 'user', content: userMessage }])
    resetExecution()
    setLoading(true)
    setStatusMessage('Sending to Commander...')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error || `Request failed (${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            handleStreamEvent(data)
          } catch {
            // skip malformed
          }
        }
      }

      if (buffer.startsWith('data: ')) {
        try {
          handleStreamEvent(JSON.parse(buffer.slice(6)))
        } catch { /* skip */ }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMessage(err?.message || 'Something went wrong')
        setStatusMessage('')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleStreamEvent = (data: any) => {
    switch (data.event) {
      case 'status':
        setStatusMessage(data.message || '')
        break
      case 'plan':
        setPlan(data.plan)
        setStatusMessage('Plan ready. Executing subtasks...')
        break
      case 'subtask_start':
        setPlan((prev) => {
          if (!prev) return prev
          const updated = [...prev.subtasks]
          if (updated[data.index]) updated[data.index] = { ...updated[data.index], status: 'running' }
          return { ...prev, subtasks: updated }
        })
        setStatusMessage(`${AGENT_LABELS[data.subtask?.agent]?.label || 'Agent'} working on: ${data.subtask?.title}`)
        break
      case 'subtask_done':
        setPlan((prev) => {
          if (!prev) return prev
          const updated = [...prev.subtasks]
          if (updated[data.index]) updated[data.index] = { ...updated[data.index], status: 'done' }
          return { ...prev, subtasks: updated }
        })
        setSubtaskResults((prev) => ({ ...prev, [data.index]: data.result || 'Done' }))
        break
      case 'complete':
        setCompleteSummary(data.summary || 'All tasks completed.')
        setStatusMessage('')
        setHistory((prev) => [
          ...prev,
          { role: 'assistant', content: data.summary, plan: plan, results: data.results },
        ])
        onTaskCreated?.()
        break
      case 'error':
        setErrorMessage(data.message || 'Execution failed')
        setStatusMessage('')
        break
    }
  }

  const toggleResult = (index: number) => {
    setExpandedResults((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const quickActions = [
    'Create a 7-day launch plan for our new feature.',
    'Generate a growth experiment backlog and assign owners.',
    'Build a customer onboarding email sequence.',
  ]

  return (
    <div className="flex h-full flex-col">
      {hasApiKey === false && (
        <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Connect an API key to get started</p>
              <p className="text-xs text-amber-700 mt-1">
                Your AI agents need an LLM provider (like OpenAI) to work. Add your API key and you'll be charged directly by the provider.
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/app/settings">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    Connect API Key
                  </Button>
                </Link>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
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
        {/* Chat history */}
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`p-3 max-w-[90%] ${msg.role === 'user' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </Card>
          </div>
        ))}

        {/* Live execution area */}
        {(loading || plan || errorMessage || completeSummary) && (
          <div className="space-y-3">
            {/* Status bar */}
            {statusMessage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                {statusMessage}
              </div>
            )}

            {/* Plan + subtask cards */}
            {plan && (
              <Card className="border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Execution Plan</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {plan.subtasks.filter((s) => s.status === 'done').length}/{plan.subtasks.length} done
                  </Badge>
                </div>
                <div className="divide-y divide-neutral-100">
                  {plan.subtasks.map((subtask, i) => {
                    const agentInfo = AGENT_LABELS[subtask.agent] || { label: subtask.agent, color: 'bg-gray-100 text-gray-800 border-gray-200' }
                    const result = subtaskResults[i]
                    const isExpanded = expandedResults[i]

                    return (
                      <div key={subtask.id || i} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {subtask.status === 'done' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : subtask.status === 'running' ? (
                              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{subtask.title}</span>
                              <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${agentInfo.color}`}>
                                {agentInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{subtask.description}</p>

                            {result && (
                              <button
                                onClick={() => toggleResult(i)}
                                className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                {isExpanded ? 'Hide result' : 'Show result'}
                              </button>
                            )}
                            {result && isExpanded && (
                              <div className="mt-2 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700 whitespace-pre-wrap border border-neutral-200">
                                {result}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* Completion */}
            {completeSummary && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {completeSummary}
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-white p-4 space-y-3">
        {!loading && !plan && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button key={action} variant="outline" size="sm" onClick={() => setMessage(action)} className="justify-start">
                <Wand2 className="w-3 h-3 mr-1.5" />
                <span className="truncate max-w-[260px]">{action}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder={hasApiKey === false ? 'Connect an API key first...' : 'Describe what you want built, automated, or analyzed...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="resize-none min-h-[60px] max-h-40"
            rows={2}
          />
          <Button onClick={handleSend} disabled={loading || !message.trim() || hasApiKey === null} className="h-auto self-stretch px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Enter to run · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
