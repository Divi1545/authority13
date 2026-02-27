'use client'

import { useEffect, useState, useRef } from 'react'
import { Badge } from '@/components/ui/badge'

interface LogEntry {
  id: string
  timestamp: string
  agent: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

function eventToLog(eventType: string, data: any): Omit<LogEntry, 'id'> {
  const timestamp = new Date().toISOString()
  let agent = 'System'
  let message = ''
  let type: LogEntry['type'] = 'info'

  switch (eventType) {
    case 'connected':
      agent = 'Stream'
      message = 'Connected to live run.'
      type = 'success'
      break
    case 'run.started':
      agent = 'Worker'
      message = 'Run started. Planning...'
      type = 'info'
      break
    case 'plan.created':
      agent = 'Commander'
      message = 'Plan created. Building subtasks...'
      type = 'success'
      break
    case 'subtask.started':
      agent = data?.subtask?.agent || 'Agent'
      message = `Starting: ${data?.subtask?.title || 'Subtask'}`
      type = 'info'
      break
    case 'subtask.completed':
      agent = data?.subtask?.agent || 'Agent'
      message = `Completed: ${data?.subtask?.title || 'Subtask'}`
      type = 'success'
      break
    case 'log':
      agent = 'Agent'
      message = data?.message || ''
      type = 'info'
      break
    case 'run.completed':
      agent = 'Worker'
      message = 'Run completed successfully.'
      type = 'success'
      break
    case 'run.error':
      agent = 'System'
      message = data?.error || 'Unknown error'
      type = 'error'
      break
    default:
      message = `${eventType}: ${JSON.stringify(data || {}).slice(0, 80)}`
  }

  return { timestamp, agent, message, type }
}

interface VibeConsoleProps {
  runId?: string | null
}

export function VibeConsole({ runId }: VibeConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      agent: 'Commander',
      message: 'System initialized. Ready for tasks. Start a task to see live logs.',
      type: 'info',
    },
  ])
  const eventSourceRef = useRef<EventSource | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to latest log
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    if (!runId) return

    eventSourceRef.current?.close()
    const es = new EventSource(`/api/stream/${runId}`)
    eventSourceRef.current = es

    const handleEvent = (eventType: string) => (e: MessageEvent) => {
      try {
        const data = e.data ? JSON.parse(e.data) : {}
        const log = eventToLog(eventType, data)
        setLogs((prev) => [
          ...prev,
          { ...log, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
        ])
      } catch {
        // ignore
      }
    }

    es.addEventListener('connected', handleEvent('connected'))
    es.addEventListener('run.started', handleEvent('run.started'))
    es.addEventListener('plan.created', handleEvent('plan.created'))
    es.addEventListener('subtask.started', handleEvent('subtask.started'))
    es.addEventListener('subtask.completed', handleEvent('subtask.completed'))
    es.addEventListener('log', handleEvent('log'))
    es.addEventListener('run.completed', handleEvent('run.completed'))
    es.addEventListener('run.error', handleEvent('run.error'))

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [runId])

  const typeColors = {
    info: 'bg-blue-500/10 text-blue-500',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    error: 'bg-red-500/10 text-red-500',
  }

  return (
    <div ref={scrollRef} className="font-mono text-xs space-y-1 bg-black/50 p-4 rounded-lg h-full overflow-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <Badge variant="outline" className="shrink-0">
            {log.agent}
          </Badge>
          <span className={typeColors[log.type]}>{log.message}</span>
        </div>
      ))}
    </div>
  )
}
