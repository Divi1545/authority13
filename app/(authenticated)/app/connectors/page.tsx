'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plug, Mail, Webhook, Calendar, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'

interface Connector {
  id: string
  type: string
  name: string
  isEnabled: boolean
  createdAt: string
}

const CONNECTOR_TYPES = [
  {
    type: 'smtp',
    name: 'SMTP Email',
    description: 'Send emails via SMTP. Required for the send_email agent tool.',
    icon: Mail,
    fields: [
      { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com', type: 'text' },
      { key: 'port', label: 'Port', placeholder: '587', type: 'text' },
      { key: 'username', label: 'Username / Email', placeholder: 'you@example.com', type: 'text' },
      { key: 'password', label: 'Password / App Password', placeholder: '', type: 'password' },
      { key: 'defaultFrom', label: 'Default From Address', placeholder: 'noreply@yourcompany.com', type: 'text' },
    ],
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Post data to external APIs. Used by the call_webhook agent tool.',
    icon: Webhook,
    fields: [
      { key: 'url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/...', type: 'text' },
      { key: 'method', label: 'HTTP Method', placeholder: 'POST', type: 'text' },
      { key: 'headers', label: 'Headers (JSON)', placeholder: '{"Authorization": "Bearer ..."}', type: 'text' },
    ],
  },
  {
    type: 'calendar',
    name: 'Calendar',
    description: 'Create and manage calendar events.',
    icon: Calendar,
    fields: [],
  },
]

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')

  useEffect(() => { fetchConnectors() }, [])

  const fetchConnectors = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()
      setWorkspaceId(wsData.workspace.id)
      const res = await fetch(`/api/connectors?workspaceId=${wsData.workspace.id}`)
      const data = await res.json()
      setConnectors(data.connectors || [])
    } catch {
      // failed
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (type: string) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, type, config: formValues }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to connect')

      setSuccess(`${type.toUpperCase()} connector added!`)
      setShowForm(null)
      setFormValues({})
      fetchConnectors()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/connectors?id=${id}`, { method: 'DELETE' })
      fetchConnectors()
    } catch {
      setError('Failed to delete connector')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connectors</h1>
        <p className="text-muted-foreground mt-1">Connect external services so your AI agents can use real tools</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="h-4 w-4" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      <div className="grid gap-4">
        {CONNECTOR_TYPES.map((ct) => {
          const existing = connectors.find((c) => c.type === ct.type)
          const Icon = ct.icon

          return (
            <Card key={ct.type}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Icon className="w-8 h-8 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{ct.name}</CardTitle>
                      {existing ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
                      ) : ct.fields.length === 0 ? (
                        <Badge variant="secondary">Coming soon</Badge>
                      ) : (
                        <Badge variant="outline">Not connected</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">{ct.description}</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {existing && (
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(existing.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {!existing && ct.fields.length > 0 && (
                      <Button size="sm" onClick={() => { setShowForm(ct.type); setFormValues({}); setError(''); setSuccess('') }}>
                        <Plug className="w-3.5 h-3.5 mr-1.5" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {showForm === ct.type && ct.fields.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-3 p-4 bg-neutral-50 rounded-lg border">
                    {ct.fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formValues[field.key] || ''}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleConnect(ct.type)} disabled={saving}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                        Save & Connect
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowForm(null)}>
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Credentials are encrypted with AES-256-GCM.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
