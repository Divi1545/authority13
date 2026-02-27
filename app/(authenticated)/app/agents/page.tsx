'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Wrench, Brain, MessageCircle } from 'lucide-react'
import { AgentGraph } from '@/components/mission-control/agent-graph'

interface Agent {
  id: string
  name: string
  type: string
  isEnabled: boolean
  systemPromptVersion: string
}

const AGENT_META: Record<string, { color: string; description: string; tools: string[] }> = {
  commander: {
    color: '#6366f1',
    description: 'Analyzes objectives, creates plans, and coordinates specialist agents.',
    tools: ['Planning', 'Delegation', 'Synthesis'],
  },
  growth: {
    color: '#10b981',
    description: 'Marketing, content creation, lead generation, and growth strategies.',
    tools: ['web_search', 'send_email', 'generate_file', 'web_scrape'],
  },
  ops: {
    color: '#3b82f6',
    description: 'Operations, process optimization, scheduling, and workflows.',
    tools: ['call_webhook', 'generate_file', 'analyze_data', 'web_search'],
  },
  support: {
    color: '#8b5cf6',
    description: 'Customer service, user communication, and support workflows.',
    tools: ['send_email', 'web_search', 'generate_file', 'memory_search'],
  },
  analyst: {
    color: '#f59e0b',
    description: 'Data analysis, reporting, metrics, insights, and research.',
    tools: ['analyze_data', 'web_search', 'web_scrape', 'generate_file'],
  },
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
    } catch {
      // failed
    } finally {
      setLoading(false)
    }
  }

  const enabledAgents = agents.filter((a) => a.isEnabled).map((a) => a.type)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground mt-1">Your autonomous AI workforce with real tool capabilities</p>
      </div>

      {/* Agent Graph */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-neutral-50 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Agent Network</span>
          <Badge variant="outline" className="ml-auto text-xs">{enabledAgents.length} active</Badge>
        </div>
        <div className="h-[250px] p-4">
          <AgentGraph activeAgents={enabledAgents} />
        </div>
      </Card>

      {/* Agent Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.length === 0 && !loading ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents configured yet. They will be created when you run your first task.</p>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => {
            const meta = AGENT_META[agent.type] || { color: '#666', description: 'Specialist agent', tools: [] }
            return (
              <Card key={agent.id} className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: meta.color }} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <Badge variant={agent.isEnabled ? 'default' : 'secondary'} className="text-xs">
                      {agent.isEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{meta.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                      <Wrench className="w-3 h-3" />
                      Tools
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {meta.tools.map((tool) => (
                        <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>v{agent.systemPromptVersion}</span>
                    <span className="capitalize">{agent.type}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}

        {/* Built-in agents that might not be in DB yet */}
        {agents.length === 0 && !loading && (
          Object.entries(AGENT_META).map(([type, meta]) => (
            <Card key={type} className="overflow-hidden opacity-60">
              <div className="h-1" style={{ backgroundColor: meta.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{type}</CardTitle>
                  <Badge variant="outline" className="text-xs">Built-in</Badge>
                </div>
                <CardDescription className="text-xs">{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Wrench className="w-3 h-3" />
                  Tools
                </div>
                <div className="flex flex-wrap gap-1">
                  {meta.tools.map((tool) => (
                    <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
