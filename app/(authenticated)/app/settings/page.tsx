'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ALL_PROVIDERS,
  PROVIDER_CATEGORIES,
  type ProviderCategory,
  type ProviderConfig,
} from '@/lib/providers'
import { Check, ExternalLink, Search, X } from 'lucide-react'

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Provider connection
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | 'all'>('all')

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

  const connectedProviderIds = apiKeys.map((k) => k.provider)

  const handleConnect = (provider: ProviderConfig) => {
    setSelectedProvider(provider)
    setFieldValues({})
  }

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProvider || !workspace) return

    setSaving(true)
    try {
      // For providers with multiple fields, we store the primary API key field
      // and encode additional fields as JSON in the key
      const primaryKey = fieldValues.apiKey || fieldValues[selectedProvider.fields[0]?.key] || ''
      const additionalFields: Record<string, string> = {}
      selectedProvider.fields.forEach((field) => {
        if (field.key !== 'apiKey' && fieldValues[field.key]) {
          additionalFields[field.key] = fieldValues[field.key]
        }
      })

      const keyToStore =
        Object.keys(additionalFields).length > 0
          ? JSON.stringify({ key: primaryKey, ...additionalFields })
          : primaryKey

      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          provider: selectedProvider.id,
          apiKey: keyToStore,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Failed to save')
      }

      setSelectedProvider(null)
      setFieldValues({})
      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const filteredProviders = ALL_PROVIDERS.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const groupedProviders: Record<string, ProviderConfig[]> = {}
  filteredProviders.forEach((p) => {
    if (!groupedProviders[p.category]) groupedProviders[p.category] = []
    groupedProviders[p.category].push(p)
  })

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading settings...</div>
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage workspace configuration</p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">Integrations</TabsTrigger>
          <TabsTrigger value="spend">Spend Limits</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace Settings</CardTitle>
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
          {/* Connection Modal */}
          {selectedProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <Card className="w-full max-w-lg mx-4 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{selectedProvider.name}</CardTitle>
                      <CardDescription>{selectedProvider.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedProvider(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProvider} className="space-y-4">
                    {selectedProvider.fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>
                          {field.label}
                          {!field.required && (
                            <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                          )}
                        </Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={fieldValues[field.key] || ''}
                          onChange={(e) =>
                            setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          required={field.required}
                          className="mt-1"
                        />
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground">
                      Keys are encrypted with AES-256-GCM and never exposed in UI or logs.
                    </p>

                    <div className="flex items-center gap-3">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Connecting...' : 'Connect'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedProvider(null)}
                      >
                        Cancel
                      </Button>
                      {selectedProvider.docsUrl && (
                        <a
                          href={selectedProvider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Docs
                        </a>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            {/* Connected count */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  {connectedProviderIds.length} of {ALL_PROVIDERS.length} services connected
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </Button>
                {(Object.keys(PROVIDER_CATEGORIES) as ProviderCategory[]).map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {PROVIDER_CATEGORIES[cat].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Provider Cards by Category */}
            {Object.entries(groupedProviders).map(([category, providers]) => (
              <div key={category}>
                <div className="mb-3">
                  <h4 className="font-medium text-sm">
                    {PROVIDER_CATEGORIES[category as ProviderCategory]?.label || category}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {PROVIDER_CATEGORIES[category as ProviderCategory]?.description}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {providers.map((provider) => {
                    const isConnected = connectedProviderIds.includes(provider.id)
                    return (
                      <div
                        key={provider.id}
                        className={`rounded-xl border p-4 transition-colors cursor-pointer hover:border-neutral-300 ${
                          isConnected
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-border bg-white'
                        }`}
                        onClick={() => handleConnect(provider)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-sm">{provider.name}</h5>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {provider.description}
                            </p>
                          </div>
                          {isConnected ? (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Connect
                            </Badge>
                          )}
                        </div>
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {provider.website.replace('https://', '')}
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredProviders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No providers match your search.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spend Limits</CardTitle>
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
                    Coming soon
                  </p>
                </div>
                <div>
                  <Label>Monthly Limit (USD)</Label>
                  <Input type="number" placeholder="1000" disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
              <CardDescription>Manage workspace members and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
