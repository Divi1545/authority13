'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface AuditEvent {
  id: string
  type: string
  payloadJson: string
  createdAt: string
  actorUser?: { name: string }
  actorAgent?: { name: string }
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuditEvents()
  }, [])

  const fetchAuditEvents = async () => {
    try {
      const wsRes = await fetch('/api/workspaces/current')
      const wsData = await wsRes.json()

      const res = await fetch(`/api/audit?workspaceId=${wsData.workspace.id}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Failed to fetch audit events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) =>
    event.type.toLowerCase().includes(filter.toLowerCase()) ||
    event.payloadJson.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) {
    return <div className="p-8">Loading audit log...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Immutable record of all workspace actions
        </p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Filter by event type or content..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {filter ? 'No events match your filter' : 'No audit events yet'}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      {event.actorUser && (
                        <span className="font-semibold">
                          {event.actorUser.name}
                        </span>
                      )}
                      {event.actorAgent && (
                        <span className="font-semibold">
                          {event.actorAgent.name}
                        </span>
                      )}
                    </div>
                    <pre className="text-xs mt-2 bg-secondary/30 p-2 rounded overflow-auto">
                      {JSON.stringify(JSON.parse(event.payloadJson), null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
