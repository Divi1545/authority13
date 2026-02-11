'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: string
  isEnabled: boolean
  systemPromptVersion: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()

      const res = await fetch(`/api/agents?workspaceId=${wsData.workspace.id}`)
      const data = await res.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agents</h1>
        <p className="text-muted-foreground">Your AI workforce</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents configured yet</p>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription className="capitalize">{agent.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant={agent.isEnabled ? 'default' : 'secondary'}>
                  {agent.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Prompt version: {agent.systemPromptVersion}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
