'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/admin/stat-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  PlayCircle, 
  DollarSign, 
  Activity,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Stats {
  totalUsers: number
  totalWorkspaces: number
  totalTasks: number
  totalRuns: number
  activeRuns: number
  totalApprovals: number
  pendingApprovals: number
  totalCostUsd: number
}

interface TaskStatus {
  status: string
  count: number
}

interface Activity {
  id: string
  type: string
  workspace: string
  actor: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [tasksByStatus, setTasksByStatus] = useState<TaskStatus[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        setStats(data.stats)
        setTasksByStatus(data.tasksByStatus)
        setRecentActivity(data.recentActivity)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Authority13 platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Workspaces"
          value={stats.totalWorkspaces}
          icon={Briefcase}
          description="Active workspaces"
        />
        <StatCard
          title="Tasks"
          value={stats.totalTasks}
          icon={CheckSquare}
          description={`${stats.activeRuns} active runs`}
        />
        <StatCard
          title="Total Cost"
          value={`$${stats.totalCostUsd.toFixed(2)}`}
          icon={DollarSign}
          description="API usage cost"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Runs"
          value={stats.totalRuns}
          icon={PlayCircle}
          description={`${stats.activeRuns} currently active`}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={TrendingUp}
          description={`${stats.totalApprovals} total`}
        />
        <StatCard
          title="Active Runs"
          value={stats.activeRuns}
          icon={Activity}
          description="In progress now"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Breakdown */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Tasks by Status</h3>
          <div className="space-y-3">
            {tasksByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.status}</Badge>
                </div>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
            {tasksByStatus.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="font-medium">{activity.type}</div>
                  <div className="text-muted-foreground">
                    {activity.workspace} • {activity.actor}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
