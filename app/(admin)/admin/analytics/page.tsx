'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Platform usage metrics and insights
        </p>
      </div>

      {/* Placeholder for future analytics */}
      <Card className="p-12">
        <div className="text-center">
          <Activity className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Analytics Coming Soon</h3>
          <p className="mt-2 text-muted-foreground">
            Detailed analytics including:
          </p>
          <div className="mx-auto mt-4 max-w-md space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Daily/weekly/monthly active users</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Task execution trends</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Agent utilization metrics</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Cost analysis & breakdowns</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">API usage patterns</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Growth & retention metrics</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Sample metric cards for future implementation */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Active Users</p>
              <p className="mt-2 text-3xl font-bold">-</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Requires implementation
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Task Success Rate</p>
              <p className="mt-2 text-3xl font-bold">-</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Requires implementation
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Cost per Task</p>
              <p className="mt-2 text-3xl font-bold">-</p>
            </div>
            <TrendingDown className="h-8 w-8 text-purple-600" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Requires implementation
          </p>
        </Card>
      </div>
    </div>
  )
}
