'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface QueryHistoryProps {
  workspaceId: string
  onQuerySelect?: (query: string) => void
}

interface HistoryQuery {
  id: string
  query: string
  status: string
  resultRows: number
  error: string | null
  executionMs: number
  createdAt: string
  user: {
    email: string
    name: string | null
  }
}

interface SavedQuery {
  query: string
  timestamp: string
  name: string
}

export function QueryHistory({ workspaceId, onQuerySelect }: QueryHistoryProps) {
  const [recentQueries, setRecentQueries] = useState<HistoryQuery[]>([])
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent')

  // Load recent queries from API
  const loadRecentQueries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sql/history?workspaceId=${workspaceId}&limit=20`)
      const data = await res.json()
      setRecentQueries(data.queries || [])
    } catch (error) {
      console.error('Failed to load query history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load saved queries from localStorage
  const loadSavedQueries = () => {
    const saved = JSON.parse(localStorage.getItem('sql-saved-queries') || '[]')
    setSavedQueries(saved)
  }

  useEffect(() => {
    loadRecentQueries()
    loadSavedQueries()

    // Refresh recent queries every 30 seconds
    const interval = setInterval(loadRecentQueries, 30000)
    return () => clearInterval(interval)
  }, [workspaceId])

  const handleQueryClick = (query: string) => {
    onQuerySelect?.(query)
  }

  const handleDeleteSaved = (index: number) => {
    const updated = savedQueries.filter((_, i) => i !== index)
    setSavedQueries(updated)
    localStorage.setItem('sql-saved-queries', JSON.stringify(updated))
  }

  const truncateQuery = (query: string, maxLength: number = 60) => {
    const cleaned = query.replace(/\s+/g, ' ').trim()
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('recent')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
          <Button
            variant={activeTab === 'saved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('saved')}
          >
            Saved ({savedQueries.length})
          </Button>
        </div>
        {activeTab === 'recent' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={loadRecentQueries}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {activeTab === 'recent' ? (
            // Recent Queries
            recentQueries.length > 0 ? (
              recentQueries.map((query) => (
                <div
                  key={query.id}
                  className="cursor-pointer rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  onClick={() => handleQueryClick(query.query)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs break-words">
                        {truncateQuery(query.query)}
                      </code>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        {query.status === 'success' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span>{query.resultRows} rows</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span>Error</span>
                          </>
                        )}
                        <Separator orientation="vertical" className="h-3" />
                        <span>{query.executionMs}ms</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>
                          {formatDistanceToNow(new Date(query.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No query history yet
              </div>
            )
          ) : (
            // Saved Queries
            savedQueries.length > 0 ? (
              savedQueries.map((query, index) => (
                <div
                  key={index}
                  className="group rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleQueryClick(query.query)}
                    >
                      <code className="text-xs break-words">
                        {truncateQuery(query.query)}
                      </code>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(query.timestamp), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteSaved(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No saved queries yet
              </div>
            )
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
