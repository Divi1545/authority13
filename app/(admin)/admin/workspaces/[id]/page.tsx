'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Users, Bot, Plug } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface WorkspaceDetail {
  id: string
  name: string
  slug: string
  createdAt: string
  members: Array<{
    id: string
    email: string
    name: string | null
    role: string
    joinedAt: string
  }>
  agents: Array<{
    id: string
    name: string
    type: string
    isEnabled: boolean
  }>
  connectors: Array<{
    id: string
    type: string
    isEnabled: boolean
    createdAt: string
  }>
  stats: {
    totalTasks: number
    pendingApprovals: number
    auditEvents: number
    chatThreads: number
    meetingSessions: number
    totalCostUsd: number
    totalTokens: number
  }
  tasksByStatus: Array<{
    status: string
    count: number
  }>
  recentTasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
    createdBy: { email: string }
  }>
}

export default function AdminWorkspaceDetailPage() {
  const params = useParams()
  const workspaceId = params.id as string

  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorkspace = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}`)
      const data = await res.json()
      setWorkspace(data.workspace)
    } catch (error) {
      console.error('Failed to fetch workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [workspaceId])

  if (loading || !workspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/workspaces">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground">/{workspace.slug}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Tasks</div>
          <div className="mt-1 text-2xl font-bold">{workspace.stats.totalTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending Approvals</div>
          <div className="mt-1 text-2xl font-bold">
            {workspace.stats.pendingApprovals}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Tokens</div>
          <div className="mt-1 text-2xl font-bold">
            {workspace.stats.totalTokens.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="mt-1 text-2xl font-bold">
            ${workspace.stats.totalCostUsd.toFixed(2)}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Members</h3>
          </div>
          <div className="space-y-3">
            {workspace.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{member.name || 'Unnamed'}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
                <Badge>{member.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Agents */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Agents</h3>
          </div>
          <div className="space-y-3">
            {workspace.agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">{agent.type}</div>
                </div>
                <Badge variant={agent.isEnabled ? 'default' : 'secondary'}>
                  {agent.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Task Status Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Tasks by Status</h3>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {workspace.tasksByStatus.map((item) => (
            <div key={item.status} className="rounded-lg border p-3">
              <Badge variant="outline" className="mb-1">
                {item.status}
              </Badge>
              <div className="text-2xl font-bold">{item.count}</div>
            </div>
          ))}
          {workspace.tasksByStatus.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          )}
        </div>
      </Card>

      {/* Connectors */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Connectors</h3>
        </div>
        <div className="space-y-3">
          {workspace.connectors.map((connector) => (
            <div key={connector.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{connector.type}</div>
                <div className="text-sm text-muted-foreground">
                  Added {formatDistanceToNow(new Date(connector.createdAt), { addSuffix: true })}
                </div>
              </div>
              <Badge variant={connector.isEnabled ? 'default' : 'secondary'}>
                {connector.isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
          {workspace.connectors.length === 0 && (
            <p className="text-sm text-muted-foreground">No connectors configured</p>
          )}
        </div>
      </Card>

      {/* Recent Tasks */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Tasks</h3>
        <div className="space-y-3">
          {workspace.recentTasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">
                  by {task.createdBy.email} •{' '}
                  {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{task.status}</Badge>
                <Badge
                  variant={
                    task.priority === 'high'
                      ? 'destructive'
                      : task.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
          {workspace.recentTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
