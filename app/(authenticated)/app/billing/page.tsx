'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, DollarSign, Zap, BarChart3, Calendar } from 'lucide-react'

interface UsageData {
  totalTasks: number
  totalRuns: number
  totalTokens: number
  totalCost: number
  dailyUsage: Array<{ date: string; tokens: number; cost: number; runs: number }>
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/billing/usage')
      const data = await res.json()
      setUsage(data)
    } catch { /* */ }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">Monitor your AI workforce usage and costs</p>
      </div>

      {/* Plan Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">BYOK Plan</h3>
              <Badge>Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Bring Your Own Keys — you pay your LLM provider directly</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${(usage?.totalCost || 0).toFixed(4)}</p>
            <p className="text-xs text-muted-foreground">estimated total cost</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Total Runs</span>
            </div>
            <p className="text-2xl font-bold">{usage?.totalRuns || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold">{(usage?.totalTokens || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Est. Cost</span>
            </div>
            <p className="text-2xl font-bold">${(usage?.totalCost || 0).toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Tasks</span>
            </div>
            <p className="text-2xl font-bold">{usage?.totalTasks || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily usage table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Usage (Last 30 Days)</CardTitle>
          <CardDescription>Token consumption and cost breakdown by day</CardDescription>
        </CardHeader>
        <CardContent>
          {usage?.dailyUsage && usage.dailyUsage.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium text-right">Runs</th>
                    <th className="pb-2 font-medium text-right">Tokens</th>
                    <th className="pb-2 font-medium text-right">Cost</th>
                    <th className="pb-2 font-medium text-right">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.dailyUsage.map((day) => {
                    const maxTokens = Math.max(...usage.dailyUsage.map((d) => d.tokens))
                    const pct = maxTokens > 0 ? (day.tokens / maxTokens) * 100 : 0
                    return (
                      <tr key={day.date} className="border-b last:border-0">
                        <td className="py-2">{day.date}</td>
                        <td className="py-2 text-right">{day.runs}</td>
                        <td className="py-2 text-right font-mono text-xs">{day.tokens.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-xs">${day.cost.toFixed(4)}</td>
                        <td className="py-2 text-right w-32">
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No usage data yet. Run some tasks to see costs here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
