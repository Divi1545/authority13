'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, RefreshCw, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface UserDetail {
  id: string
  email: string
  name: string | null
  isSuperAdmin: boolean
  createdAt: string
  workspaces: Array<{
    name: string
    slug: string
    role: string
    joinedAt: string
  }>
  stats: {
    tasksCreated: number
    approvalDecisions: number
    chatMessages: number
    auditEvents: number
    totalCostUsd: number
  }
  recentTasks: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    workspace: { name: string }
  }>
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSuperAdmin = async () => {
    if (!user) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuperAdmin: !user.isSuperAdmin }),
      })
      if (res.ok) {
        await fetchUser()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name || 'Unnamed User'}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        {user.isSuperAdmin && (
          <Badge className="bg-purple-600">
            <Shield className="mr-1 h-3 w-3" />
            Super Admin
          </Badge>
        )}
      </div>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Actions</h3>
        <div className="flex gap-2">
          <Button
            onClick={toggleSuperAdmin}
            disabled={updating}
            variant={user.isSuperAdmin ? 'destructive' : 'default'}
          >
            {updating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {user.isSuperAdmin ? 'Remove Super Admin' : 'Make Super Admin'}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Tasks Created</div>
          <div className="mt-1 text-2xl font-bold">{user.stats.tasksCreated}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Approval Decisions</div>
          <div className="mt-1 text-2xl font-bold">{user.stats.approvalDecisions}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Chat Messages</div>
          <div className="mt-1 text-2xl font-bold">{user.stats.chatMessages}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="mt-1 text-2xl font-bold">
            ${user.stats.totalCostUsd.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Workspaces */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Workspaces</h3>
        <div className="space-y-3">
          {user.workspaces.map((ws) => (
            <div key={ws.slug} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{ws.name}</div>
                <div className="text-sm text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(ws.joinedAt), { addSuffix: true })}
                </div>
              </div>
              <Badge>{ws.role}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Tasks */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Tasks</h3>
        <div className="space-y-3">
          {user.recentTasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">
                  {task.workspace.name} •{' '}
                  {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </div>
              </div>
              <Badge variant="outline">{task.status}</Badge>
            </div>
          ))}
          {user.recentTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
