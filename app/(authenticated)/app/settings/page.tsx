'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // API Key form state
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()
      setWorkspace(wsData.workspace)

      const keysRes = await fetch(`/api/settings/api-keys?workspaceId=${wsData.workspace.id}`)
      const keysData = await keysRes.json()
      setApiKeys(keysData.keys || [])
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          provider,
          apiKey,
        }),
      })

      setApiKey('')
      await fetchData()
      alert('API key saved successfully!')
    } catch (error) {
      alert('Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading settings...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage workspace configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys (BYOK)</TabsTrigger>
          <TabsTrigger value="spend">Spend Limits</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Basic workspace information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Workspace Name</Label>
                <Input value={workspace?.name || ''} disabled />
              </div>
              <div>
                <Label>Workspace Slug</Label>
                <Input value={workspace?.slug || ''} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Provider Keys (BYOK)</CardTitle>
                <CardDescription>
                  Bring Your Own API keys. Your keys stay encrypted and are never exposed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Configured Keys:</h4>
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                        >
                          <div>
                            <div className="font-semibold capitalize">{key.provider}</div>
                            <div className="text-xs text-muted-foreground">
                              Added {new Date(key.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge>Configured</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <form onSubmit={handleSaveApiKey} className="space-y-4">
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <select
                        id="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Keys are encrypted at rest and never exposed in UI or logs
                      </p>
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save API Key'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About BYOK</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  BYOK (Bring Your Own Key) means you provide your own AI provider API keys.
                </p>
                <p>
                  You're billed directly by the provider for model usage. Authority13 charges only the platform subscription fee.
                </p>
                <p>
                  Your keys are encrypted with AES-256-GCM and never leave your workspace context.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spend">
          <Card>
            <CardHeader>
              <CardTitle>Spend Limits</CardTitle>
              <CardDescription>
                Set daily and monthly spending caps for AI model usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Daily Limit (USD)</Label>
                  <Input type="number" placeholder="100" disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon: Set daily spending limits
                  </p>
                </div>
                <div>
                  <Label>Monthly Limit (USD)</Label>
                  <Input type="number" placeholder="1000" disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon: Set monthly spending limits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage workspace members and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team management coming soon. For now, workspace is single-user.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
