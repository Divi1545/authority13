'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Users, Bot, CheckSquare, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  slug: string
  createdAt: string
  stats: {
    members: number
    agents: number
    tasks: number
    recentTasks: number
    pendingApprovals: number
    totalCostUsd: number
  }
}

interface WorkspaceTableProps {
  workspaces: Workspace[]
}

export function WorkspaceTable({ workspaces }: WorkspaceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Workspace</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Members</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Activity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Total Cost</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {workspaces.map((workspace) => (
            <tr key={workspace.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-sm text-muted-foreground">/{workspace.slug}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{workspace.stats.members}</span>
                  <Bot className="ml-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{workspace.stats.agents}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1 text-sm">
                  <div>{workspace.stats.tasks} tasks total</div>
                  <div className="text-muted-foreground">
                    {workspace.stats.recentTasks} in last 30 days
                  </div>
                  {workspace.stats.pendingApprovals > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <CheckSquare className="mr-1 h-3 w-3" />
                      {workspace.stats.pendingApprovals} pending
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {workspace.stats.totalCostUsd.toFixed(2)}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/workspaces/${workspace.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
