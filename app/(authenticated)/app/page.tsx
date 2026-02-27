'use client'

import { useEffect, useState } from 'react'
import { CommanderChat } from '@/components/mission-control/commander-chat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  slug: string
}

export default function MissionControlPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [role, setRole] = useState<string>('viewer')
  const [taskCount, setTaskCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkspaceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()
      if (!wsRes.ok || !wsData?.workspace?.id) {
        throw new Error(wsData?.error || 'Failed to load workspace')
      }
      setWorkspace(wsData.workspace)
      setRole(wsData.role || 'viewer')

      const tasksRes = await fetch(`/api/tasks?workspaceId=${wsData.workspace.id}`)
      const tasksData = await tasksRes.json()
      setTaskCount(Array.isArray(tasksData?.tasks) ? tasksData.tasks.length : 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWorkspaceData() }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadWorkspaceData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Minimal header */}
      <div className="border-b border-border px-5 py-2.5 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold">{workspace?.name}</h1>
          <Badge variant="outline" className="capitalize text-xs">{role}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{taskCount} tasks</Badge>
        </div>
      </div>

      {/* Full-screen commander */}
      <div className="flex-1 min-h-0">
        <CommanderChat onTaskCreated={loadWorkspaceData} />
      </div>
    </div>
  )
}
