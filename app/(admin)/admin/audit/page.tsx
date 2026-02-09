'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AuditEvent {
  id: string
  type: string
  workspace: {
    name: string
    slug: string
  }
  actor: {
    type: 'user' | 'agent'
    email?: string
    name?: string
    agentType?: string
  } | null
  payload: any
  createdAt: string
}

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        ...(typeFilter && { type: typeFilter }),
      })
      const res = await fetch(`/api/admin/audit?${params}`)
      const data = await res.json()
      setEvents(data.events)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch audit events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [page, typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Audit Log</h1>
          <p className="text-muted-foreground">
            Cross-workspace audit events
          </p>
        </div>
        <Button onClick={fetchEvents} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by event type..."
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Audit Events */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
          </div>
        </div>
      ) : (
        <>
          <Card className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {event.workspace.name}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      {event.actor ? (
                        event.actor.type === 'user' ? (
                          <span>
                            by <span className="font-medium">{event.actor.email}</span>
                          </span>
                        ) : (
                          <span>
                            by agent <span className="font-medium">{event.actor.name}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">System event</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No audit events found
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
