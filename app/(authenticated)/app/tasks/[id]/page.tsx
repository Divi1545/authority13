'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TaskDetailPage() {
  const params = useParams()
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
    } catch (error) {
      console.error('Failed to fetch task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading task...</div>
  }

  if (!task) {
    return <div className="p-8">Task not found</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <Badge>{task.status}</Badge>
        </div>
        <p className="text-muted-foreground">{task.objective}</p>
      </div>

      {task.plans && task.plans.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-secondary/30 p-4 rounded overflow-auto">
              {JSON.stringify(JSON.parse(task.plans[0].planJson), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {task.runs && task.runs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>{task.runs.length} run(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {task.runs.map((run: any) => (
                <Card key={run.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Run {run.id.substring(0, 8)}</CardTitle>
                        <CardDescription>
                          {new Date(run.startedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge>{run.status}</Badge>
                    </div>
                  </CardHeader>
                  {run.steps && run.steps.length > 0 && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {run.steps.length} step(s) completed
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
