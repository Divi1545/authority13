'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Shield } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  isSuperAdmin: boolean
  createdAt: string
  workspaces: Array<{
    name: string
    slug: string
    role: string
  }>
  stats: {
    tasksCreated: number
    approvalDecisions: number
  }
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">User</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Workspaces</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Activity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{user.name || 'Unnamed'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {user.workspaces.slice(0, 2).map((ws, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ws.name}
                    </Badge>
                  ))}
                  {user.workspaces.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.workspaces.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  <div>{user.stats.tasksCreated} tasks</div>
                  <div className="text-muted-foreground">
                    {user.stats.approvalDecisions} approvals
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {user.isSuperAdmin ? (
                  <Badge className="bg-purple-600 hover:bg-purple-700">
                    <Shield className="mr-1 h-3 w-3" />
                    Super Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/users/${user.id}`}>
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
