'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plug, Mail, Webhook, Calendar } from 'lucide-react'

interface Connector {
  id: string
  type: string
  isEnabled: boolean
  createdAt: string
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnectors()
  }, [])

  const fetchConnectors = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()

      const res = await fetch(`/api/connectors?workspaceId=${wsData.workspace.id}`)
      const data = await res.json()
      setConnectors(data.connectors || [])
    } catch (error) {
      console.error('Failed to fetch connectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectorTypes = [
    {
      type: 'smtp',
      name: 'SMTP Email',
      description: 'Send emails via SMTP',
      icon: Mail,
    },
    {
      type: 'webhook',
      name: 'Webhook',
      description: 'Post data to external APIs',
      icon: Webhook,
    },
    {
      type: 'calendar',
      name: 'Calendar',
      description: 'Create and manage events',
      icon: Calendar,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Connectors</h1>
        <p className="text-muted-foreground">
          Connect external services to enable agent tools
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {connectorTypes.map((ct) => {
          const existing = connectors.find((c) => c.type === ct.type)
          const Icon = ct.icon

          return (
            <Card key={ct.type}>
              <CardHeader>
                <Icon className="w-8 h-8 mb-2" />
                <CardTitle>{ct.name}</CardTitle>
                <CardDescription>{ct.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {existing ? (
                  <div className="space-y-2">
                    <Badge variant={existing.isEnabled ? 'default' : 'secondary'}>
                      {existing.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(existing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormType(ct.type)
                      setShowForm(true)
                    }}
                  >
                    <Plug className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Connect {formType.toUpperCase()}</CardTitle>
            <CardDescription>
              Enter configuration details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configuration form coming soon. For now, use the API directly.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(false)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
