'use client'

import { useEffect, useMemo, useState } from 'react'
import { CommanderChat } from '@/components/mission-control/commander-chat'
import { AgentGraph } from '@/components/mission-control/agent-graph'
import { ExecutionTimeline } from '@/components/mission-control/execution-timeline'
import { VibeConsole } from '@/components/mission-control/vibe-console'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Activity,
  Bot,
  Cable,
  KeyRound,
  ListChecks,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

interface Workspace {
  id: string
  name: string
  slug: string
}

interface Task {
  id: string
  title: string
  objective: string
  status: string
  priority: string
  createdAt: string
  createdBy?: { name?: string }
}

interface AuditEvent {
  id: string
  type: string
  payloadJson: string
  createdAt: string
  actorUser?: { id?: string; name?: string }
  actorAgent?: { id?: string; name?: string }
}

interface Connector {
  id: string
  type: string
  isEnabled: boolean
  createdAt: string
}

interface ApiKeyInfo {
  id: string
  provider: string
  createdAt: string
}

interface Agent {
  id: string
  name: string
  type: string
  isEnabled: boolean
  systemPromptVersion: string
}

export default function MissionControlPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [role, setRole] = useState<string>('viewer')
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([])
  const [agents, setAgents] = useState<Agent[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [agentType, setAgentType] = useState('growth')
  const [agentName, setAgentName] = useState('')
  const [savingAgent, setSavingAgent] = useState(false)

  const [connectorType, setConnectorType] = useState('webhook')
  const [connectorConfig, setConnectorConfig] = useState(
    '{\n  "url": "https://your-n8n-or-webhook-endpoint"\n}'
  )
  const [savingConnector, setSavingConnector] = useState(false)

  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [savingApiKey, setSavingApiKey] = useState(false)
  const [auditFilter, setAuditFilter] = useState('')

  const loadWorkspaceData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()
      if (!wsRes.ok || !wsData?.workspace?.id) {
        throw new Error(wsData?.error || 'Failed to load workspace')
      }

      const currentWorkspace = wsData.workspace as Workspace
      setWorkspace(currentWorkspace)
      setRole(wsData.role || 'viewer')

      const [tasksRes, auditRes, connectorRes, keysRes, agentsRes] = await Promise.all([
        fetch(`/api/tasks?workspaceId=${currentWorkspace.id}`),
        fetch(`/api/audit?workspaceId=${currentWorkspace.id}`),
        fetch(`/api/connectors?workspaceId=${currentWorkspace.id}`),
        fetch(`/api/settings/api-keys?workspaceId=${currentWorkspace.id}`),
        fetch(`/api/agents?workspaceId=${currentWorkspace.id}`),
      ])

      const [tasksData, auditData, connectorData, keysData, agentsData] =
        await Promise.all([
          tasksRes.json(),
          auditRes.json(),
          connectorRes.json(),
          keysRes.json(),
          agentsRes.json(),
        ])

      setTasks(Array.isArray(tasksData?.tasks) ? tasksData.tasks : [])
      setEvents(Array.isArray(auditData?.events) ? auditData.events : [])
      setConnectors(Array.isArray(connectorData?.connectors) ? connectorData.connectors : [])
      setApiKeys(Array.isArray(keysData?.keys) ? keysData.keys : [])
      setAgents(Array.isArray(agentsData?.agents) ? agentsData.agents : [])
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load workspace dashboard'
      )
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadWorkspaceData()
  }, [])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1
    })
    return counts
  }, [tasks])

  const humanEvents = useMemo(
    () => events.filter((event) => Boolean(event.actorUser?.name)),
    [events]
  )

  const filteredEvents = useMemo(() => {
    if (!auditFilter.trim()) return events
    const term = auditFilter.toLowerCase()
    return events.filter((event) => {
      const actor = event.actorUser?.name || event.actorAgent?.name || ''
      return (
        event.type.toLowerCase().includes(term) ||
        event.payloadJson.toLowerCase().includes(term) ||
        actor.toLowerCase().includes(term)
      )
    })
  }, [events, auditFilter])

  const canManageSettings = role === 'admin'

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !agentName.trim()) return

    setSavingAgent(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          name: agentName.trim(),
          type: agentType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save employee')
      }
      setAgentName('')
      await loadWorkspaceData(true)
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : 'Failed to save employee')
    } finally {
      setSavingAgent(false)
    }
  }

  const handleSaveConnector = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return

    setSavingConnector(true)
    try {
      const parsedConfig = JSON.parse(connectorConfig)
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          type: connectorType,
          config: parsedConfig,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save connector')
      }
      await loadWorkspaceData(true)
    } catch (connectorError) {
      if (connectorError instanceof SyntaxError) {
        alert('Connector config must be valid JSON.')
      } else {
        alert(connectorError instanceof Error ? connectorError.message : 'Failed to save connector')
      }
    } finally {
      setSavingConnector(false)
    }
  }

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !apiKey.trim()) return

    setSavingApiKey(true)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          provider,
          apiKey: apiKey.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save API key')
      }
      setApiKey('')
      await loadWorkspaceData(true)
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : 'Failed to save API key')
    } finally {
      setSavingApiKey(false)
    }
  }

  const parsePayload = (payloadJson: string) => {
    try {
      return JSON.stringify(JSON.parse(payloadJson), null, 2)
    } catch {
      return payloadJson
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading playground...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Unable to load playground</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => loadWorkspaceData()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-5 py-3 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Playground</p>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {workspace?.name}
              <Badge variant="outline" className="capitalize">
                {role}
              </Badge>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{tasks.length} tasks</Badge>
            <Badge variant="secondary">{statusCounts.needs_approval || 0} approvals</Badge>
            <Badge variant="secondary">{humanEvents.length} human actions</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadWorkspaceData(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Refreshing
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row">
        <section className="xl:w-[36%] xl:min-w-[360px] xl:max-w-[540px] border-b xl:border-b-0 xl:border-r border-border">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-white">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Prompt Commander
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ask, break down, execute, and iterate in one loop.
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <CommanderChat onTaskCreated={() => loadWorkspaceData(true)} />
            </div>
          </div>
        </section>

        <section className="flex-1 min-h-0 p-4 md:p-5 overflow-y-auto">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">
                <Activity className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                Task Breakdown
              </TabsTrigger>
              <TabsTrigger value="audit">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Audit & Human
              </TabsTrigger>
              <TabsTrigger value="employees">
                <Bot className="h-3.5 w-3.5 mr-1.5" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="connectors">
                <Cable className="h-3.5 w-3.5 mr-1.5" />
                Connectors
              </TabsTrigger>
              <TabsTrigger value="secrets">
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                Secrets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Tasks</CardDescription>
                    <CardTitle className="text-2xl">{tasks.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>In Flight</CardDescription>
                    <CardTitle className="text-2xl">
                      {(statusCounts.executing || 0) + (statusCounts.planning || 0)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Needs Approval</CardDescription>
                    <CardTitle className="text-2xl">{statusCounts.needs_approval || 0}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid xl:grid-cols-2 gap-4">
                <Card className="xl:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Employee Assembly</CardTitle>
                    <CardDescription>
                      Live map of commander and specialist employees.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <AgentGraph />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Execution Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[320px] overflow-y-auto">
                    <ExecutionTimeline />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Live Console</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <VibeConsole />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Task Breakdown</CardTitle>
                  <CardDescription>
                    Specific tasks generated by prompts, listed top-down for rapid tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tasks yet. Start in the left prompt pane.
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="rounded-lg border border-border/70 p-3">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="font-medium">{task.title}</p>
                          <Badge variant="outline">{task.priority}</Badge>
                          <Badge variant={task.status === 'needs_approval' ? 'destructive' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.objective}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(task.createdAt).toLocaleString()} •{' '}
                          {task.createdBy?.name || 'Unknown author'}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Human Actions</CardTitle>
                  <CardDescription>
                    Actions performed by workspace users across task lifecycle.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {humanEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No human actions recorded yet.</p>
                  ) : (
                    humanEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="rounded-lg border border-border/70 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {event.actorUser?.name || 'Unknown user'} performed this action.
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Full Audit Trail</CardTitle>
                  <CardDescription>
                    Filter by actor, event type, or payload details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Filter audit log..."
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    className="max-w-md"
                  />
                  <div className="space-y-2 max-h-[420px] overflow-y-auto">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border border-border/70 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {event.actorUser?.name || event.actorAgent?.name || 'System'}
                          </span>
                        </div>
                        <pre className="text-xs mt-2 bg-muted/50 p-2 rounded-md overflow-x-auto">
                          {parsePayload(event.payloadJson)}
                        </pre>
                      </div>
                    ))}
                    {filteredEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground">No audit records found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Employees / Agents</CardTitle>
                  <CardDescription>
                    Create or update your core specialist employees.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
                    {agents.map((agent) => (
                      <div key={agent.id} className="rounded-lg border border-border/70 p-3">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={agent.isEnabled ? 'secondary' : 'outline'}>
                            {agent.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            v{agent.systemPromptVersion}
                          </span>
                        </div>
                      </div>
                    ))}
                    {agents.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No employees yet. Create one below.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleCreateAgent} className="grid md:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label htmlFor="agentType">Employee Type</Label>
                      <select
                        id="agentType"
                        value={agentType}
                        onChange={(e) => setAgentType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="commander">Commander</option>
                        <option value="growth">Growth</option>
                        <option value="ops">Ops</option>
                        <option value="support">Support</option>
                        <option value="analyst">Analyst</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="agentName">Display Name</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g. Growth Strategist"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={savingAgent || !canManageSettings}>
                      {savingAgent ? 'Saving...' : 'Create / Update Employee'}
                    </Button>
                  </form>
                  {!canManageSettings && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Admin role required to manage employees.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connectors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connectors & Webhooks</CardTitle>
                  <CardDescription>
                    Central place to connect n8n, webhooks, email, and integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {connectors.map((connector) => (
                      <div key={connector.id} className="rounded-lg border border-border/70 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">{connector.type}</p>
                          <Badge variant={connector.isEnabled ? 'secondary' : 'outline'}>
                            {connector.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(connector.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {connectors.length === 0 && (
                      <p className="text-sm text-muted-foreground">No connectors configured yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleSaveConnector} className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="connectorType">Connector Type</Label>
                        <select
                          id="connectorType"
                          value={connectorType}
                          onChange={(e) => setConnectorType(e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="webhook">Webhook / n8n</option>
                          <option value="smtp">SMTP Email</option>
                          <option value="calendar">Calendar</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="connectorConfig">JSON Config</Label>
                      <Textarea
                        id="connectorConfig"
                        value={connectorConfig}
                        onChange={(e) => setConnectorConfig(e.target.value)}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    </div>
                    <Button type="submit" disabled={savingConnector || !canManageSettings}>
                      {savingConnector ? 'Saving...' : 'Save Connector'}
                    </Button>
                    {!canManageSettings && (
                      <p className="text-xs text-muted-foreground">
                        Admin role required to manage connectors.
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secrets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Secrets & API Keys</CardTitle>
                  <CardDescription>
                    BYOK management in the same playground flow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {apiKeys.map((keyInfo) => (
                      <div key={keyInfo.id} className="rounded-lg border border-border/70 p-3">
                        <p className="font-medium capitalize">{keyInfo.provider}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(keyInfo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {apiKeys.length === 0 && (
                      <p className="text-sm text-muted-foreground">No API keys configured yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleSaveApiKey} className="grid md:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <select
                        id="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <optgroup label="LLM Providers">
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="google">Google AI</option>
                          <option value="deepseek">DeepSeek</option>
                          <option value="mistral">Mistral AI</option>
                          <option value="cohere">Cohere</option>
                          <option value="groq">Groq</option>
                          <option value="perplexity">Perplexity</option>
                          <option value="together">Together AI</option>
                          <option value="xai">xAI (Grok)</option>
                        </optgroup>
                        <optgroup label="Image Generation">
                          <option value="stability">Stability AI</option>
                          <option value="replicate">Replicate</option>
                          <option value="fal">Fal.ai</option>
                          <option value="leonardo">Leonardo AI</option>
                        </optgroup>
                        <optgroup label="Voice AI">
                          <option value="vapi">VAPI</option>
                          <option value="elevenlabs">ElevenLabs</option>
                          <option value="deepgram">Deepgram</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="twilio">Twilio</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="slack">Slack</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={savingApiKey || !canManageSettings}>
                      {savingApiKey ? 'Saving...' : 'Save Key'}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    For all 80+ integrations, visit{' '}
                    <a href="/app/settings" className="underline hover:text-foreground">Settings → Integrations</a>
                  </p>
                  {!canManageSettings && (
                    <p className="text-xs text-muted-foreground">
                      Admin role required to manage API keys.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  )
}
