'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  title: string
  objective: string
  status: string
  priority: string
  createdAt: string
  createdBy: { name: string }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()

      const res = await fetch(`/api/tasks?workspaceId=${wsData.workspace.id}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'secondary',
    planning: 'default',
    executing: 'default',
    needs_approval: 'destructive',
    completed: 'outline',
    failed: 'destructive',
  }

  if (loading) {
    return <div className="p-8">Loading tasks...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">All workspace tasks and executions</p>
        </div>
        <Link href="/app">
          <Button>Create New Task</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tasks yet. Go to Mission Control to create your first task!
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Link key={task.id} href={`/app/tasks/${task.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {task.objective.substring(0, 150)}
                        {task.objective.length > 150 ? '...' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={statusColors[task.status] as any}>
                        {task.status}
                      </Badge>
                      <Badge variant="outline">{task.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {task.createdBy.name}</span>
                    <span>•</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
