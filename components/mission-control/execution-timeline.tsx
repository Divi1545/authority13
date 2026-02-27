'use client'

import { useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

interface RunStep {
  id: string
  index: number
  type: string
  contentJson: string
}

interface ExecutionTimelineProps {
  runId?: string | null
  taskId?: string | null
}

export function ExecutionTimeline({ runId, taskId }: ExecutionTimelineProps) {
  const [steps, setSteps] = useState<Array<{
    id: string
    type: string
    title: string
    description: string
    status: 'completed' | 'executing' | 'pending' | 'idle'
    timestamp: string
  }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!runId && !taskId) {
      setSteps([])
      return
    }

    let isFirstFetch = true
    const fetchSteps = async () => {
      if (isFirstFetch) setLoading(true)
      try {
        if (runId) {
          const res = await fetch(`/api/runs/${runId}`)
          const data = await res.json()
          const run = data?.run
          const rawSteps: RunStep[] = run?.steps || []
          const mapped = rawSteps.map((s, idx) => {
            let content: any = {}
            try {
              content = JSON.parse(s.contentJson || '{}')
            } catch {
              // ignore
            }
            const plan = content?.plan
            const subtask = content?.subtask
            let title = 'Step'
            let description = ''
            if (s.type === 'plan' && plan) {
              title = 'Task Plan Created'
              description = `Commander: ${plan.subtasks?.length || 0} subtask(s)`
            } else if (subtask) {
              title = subtask.title || 'Subtask'
              description = `${subtask.agent || 'Agent'}: ${subtask.description || ''}`
            }
            return {
              id: s.id,
              type: s.type,
              title,
              description,
              status: 'completed' as const,
              timestamp: 'Done',
            }
          })
          setSteps(mapped)
        } else if (taskId) {
          const res = await fetch(`/api/tasks/${taskId}`)
          const data = await res.json()
          const task = data?.task
          const runs = task?.runs || []
          const activeRun = runs.find((r: any) => r.id === task?.activeRunId) || runs[0]
          if (activeRun?.id) {
            const runRes = await fetch(`/api/runs/${activeRun.id}`)
            const runData = await runRes.json()
            const rawSteps: RunStep[] = runData?.run?.steps || []
            const mapped = rawSteps.map((s) => {
              let content: any = {}
              try {
                content = JSON.parse(s.contentJson || '{}')
              } catch {
                // ignore
              }
              const plan = content?.plan
              const subtask = content?.subtask
              let title = 'Step'
              let description = ''
              if (s.type === 'plan' && plan) {
                title = 'Task Plan Created'
                description = `Commander: ${plan.subtasks?.length || 0} subtask(s)`
              } else if (subtask) {
                title = subtask.title || 'Subtask'
                description = `${subtask.agent || 'Agent'}: ${subtask.description || ''}`
              }
              return {
                id: s.id,
                type: s.type,
                title,
                description,
                status: 'completed' as const,
                timestamp: 'Done',
              }
            })
            setSteps(mapped)
          } else {
            setSteps([])
          }
        }
      } catch {
        setSteps([])
      } finally {
        setLoading(false)
      }
    }

    fetchSteps().then(() => { isFirstFetch = false })

    const interval = setInterval(fetchSteps, 3000)
    return () => clearInterval(interval)
  }, [runId, taskId])

  const statusIcons = {
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    executing: <Clock className="w-5 h-5 text-blue-500 animate-spin" />,
    pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    idle: <Circle className="w-5 h-5 text-gray-500" />,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No active tasks. Start a conversation with Commander to begin.
        </p>
      ) : (
        steps.map((step) => (
          <Card key={step.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {statusIcons[step.status]}
                  <div>
                    <CardTitle className="text-sm">{step.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={step.status === 'pending' ? 'destructive' : 'outline'}>
                  {step.timestamp}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  )
}
