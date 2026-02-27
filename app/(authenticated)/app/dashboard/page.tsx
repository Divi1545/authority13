'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Clock, Zap, Plug, Users, FileText, RefreshCw } from 'lucide-react'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  pendingTasks: number
  successRate: number
  recentTasks: Array<{ id: string; title: string; status: string; createdAt: string; objective: string }>
  connectors: number
  agents: number
  auditEvents: number
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  planning: 'bg-blue-100 text-blue-800',
  executing: 'bg-purple-100 text-purple-800',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      // failed
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Failed to load dashboard</p>
          <Button onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: Zap, color: 'text-blue-600' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Failed', value: stats.failedTasks, icon: XCircle, color: 'text-red-600' },
    { label: 'In Progress', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: Zap, color: 'text-purple-600' },
    { label: 'Channels', value: stats.connectors, icon: Plug, color: 'text-indigo-600' },
    { label: 'Agents', value: stats.agents, icon: Users, color: 'text-teal-600' },
    { label: 'Audit Events', value: stats.auditEvents, icon: FileText, color: 'text-orange-600' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your AI workforce performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b bg-neutral-50">
          <h2 className="font-semibold">Recent Tasks</h2>
        </div>
        {stats.recentTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tasks yet. Go to Mission Control to create your first task.
          </div>
        ) : (
          <div className="divide-y">
            {stats.recentTasks.map((task) => (
              <div key={task.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{task.objective}</p>
                </div>
                <Badge className={STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800'}>
                  {task.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
