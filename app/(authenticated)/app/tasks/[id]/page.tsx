'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Clock, ArrowLeft, RotateCcw, Wrench, DollarSign, Zap } from 'lucide-react'

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' },
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
  planning: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Zap, label: 'Planning' },
  executing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Loader2, label: 'Executing' },
}

const AGENT_COLORS: Record<string, string> = {
  growth: 'bg-emerald-100 text-emerald-800',
  ops: 'bg-blue-100 text-blue-800',
  support: 'bg-purple-100 text-purple-800',
  analyst: 'bg-amber-100 text-amber-800',
  commander: 'bg-indigo-100 text-indigo-800',
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTask()
  }, [params.id])

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${params.id}`)
      const data = await res.json()
      setTask(data.task)
    } catch {
      // failed
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">Task not found</p>
        <Button variant="outline" onClick={() => router.push('/app/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon

  let plan: any = null
  if (task.plans?.length > 0) {
    try { plan = JSON.parse(task.plans[0].planJson) } catch { /* skip */ }
  }

  const latestRun = task.runs?.[0]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/app/tasks')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{task.objective}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Created {new Date(task.createdAt).toLocaleString()}</span>
            {task.updatedAt && <span>Updated {new Date(task.updatedAt).toLocaleString()}</span>}
          </div>
        </div>
      </div>

      {/* Run stats */}
      {latestRun && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{((latestRun.promptTokens || 0) + (latestRun.completionTokens || 0)).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tokens</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-lg font-bold">${(latestRun.costEstimateUsd || 0).toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Cost</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-lg font-bold">
                  {latestRun.endedAt
                    ? `${((new Date(latestRun.endedAt).getTime() - new Date(latestRun.startedAt).getTime()) / 1000).toFixed(1)}s`
                    : 'Running'}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{latestRun.steps?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Steps</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Execution Plan */}
      {plan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Execution Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.plan?.subtasks ? (
              <div className="space-y-3">
                {(plan.plan?.subtasks || plan.subtasks || []).map((subtask: any, i: number) => (
                  <div key={subtask.id || i} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5">
                      {subtask.status === 'done' || task.status === 'completed' ? (
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
                        {subtask.agent && (
                          <Badge className={`text-[11px] ${AGENT_COLORS[subtask.agent] || 'bg-gray-100 text-gray-800'}`}>
                            {subtask.agent}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{subtask.description}</p>
                      {subtask.tools?.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {subtask.tools.map((t: string) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs bg-neutral-50 p-4 rounded overflow-auto">{JSON.stringify(plan, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Run History */}
      {task.runs?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Run History ({task.runs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {task.runs.map((run: any) => (
              <div key={run.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{run.status}</Badge>
                    {run.provider && <span className="text-xs text-muted-foreground">{run.provider}/{run.model}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</span>
                </div>
                {(run.promptTokens > 0 || run.costEstimateUsd > 0) && (
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{(run.promptTokens + run.completionTokens).toLocaleString()} tokens</span>
                    <span>${run.costEstimateUsd?.toFixed(4) || '0.0000'}</span>
                  </div>
                )}
                {run.steps?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{run.steps.length} step(s)</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Retry button for failed tasks */}
      {task.status === 'failed' && (
        <div className="flex justify-center">
          <Button onClick={() => router.push('/app')}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry in Mission Control
          </Button>
        </div>
      )}
    </div>
  )
}
