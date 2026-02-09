'use client'

import { useState, useEffect } from 'react'
import { SqlEditor } from '@/components/sql-editor/sql-editor'
import { ResultsTable } from '@/components/sql-editor/results-table'
import { QueryHistory } from '@/components/sql-editor/query-history'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, AlertCircle, Shield } from 'lucide-react'

export default function SqlEditorPage() {
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [queryResults, setQueryResults] = useState<any>(null)
  const [selectedQuery, setSelectedQuery] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Fetch current workspace
  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const res = await fetch('/api/workspaces/current')
        if (res.ok) {
          const data = await res.json()
          setWorkspaceId(data.workspace.id)
          setUserRole(data.role)
        } else {
          setError('Failed to load workspace')
        }
      } catch (err) {
        setError('Failed to connect to API')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
  }, [])

  const handleQueryExecute = (results: any) => {
    setQueryResults(results)
  }

  const handleQuerySelect = (query: string) => {
    setSelectedQuery(query)
  }

  // Check if user has access
  const hasAccess = userRole === 'admin' || userRole === 'manager'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading SQL Editor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="mt-4 text-lg font-semibold">Error</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-yellow-600" />
          <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            SQL Editor is only available to workspace admins and managers.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your current role: <Badge variant="outline">{userRole}</Badge>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              SQL Editor
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Execute SQL queries against your Supabase database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole === 'admin' ? 'Full Access' : 'Read-Only'}
            </Badge>
          </div>
        </div>

        {/* Warning for managers */}
        {userRole === 'manager' && (
          <Card className="mt-4 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-900/10 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-yellow-900 dark:text-yellow-200">
                  Read-only mode:
                </span>{' '}
                <span className="text-yellow-800 dark:text-yellow-300">
                  You can only execute SELECT queries. Contact an admin for write access.
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Sidebar - Query History */}
        <div className="w-80 flex-shrink-0">
          <QueryHistory workspaceId={workspaceId} onQuerySelect={handleQuerySelect} />
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* SQL Editor */}
          <div className="flex-1">
            <SqlEditor
              workspaceId={workspaceId}
              onQueryExecute={handleQueryExecute}
              key={selectedQuery} // Re-mount when selected query changes
            />
          </div>

          {/* Results */}
          {queryResults?.success && queryResults.results && (
            <div className="h-64 overflow-auto">
              <ResultsTable
                results={queryResults.results}
                executionMs={queryResults.executionMs}
              />
            </div>
          )}
        </div>
      </div>

      {/* Query Templates */}
      <Card className="mt-6 p-4">
        <div className="text-sm">
          <span className="font-medium">Quick queries:</span>{' '}
          <button
            className="ml-2 text-primary hover:underline"
            onClick={() => setSelectedQuery('SELECT * FROM "User" LIMIT 10;')}
          >
            View Users
          </button>
          <span className="mx-2">•</span>
          <button
            className="text-primary hover:underline"
            onClick={() => setSelectedQuery('SELECT * FROM "Task" ORDER BY "createdAt" DESC LIMIT 10;')}
          >
            Recent Tasks
          </button>
          <span className="mx-2">•</span>
          <button
            className="text-primary hover:underline"
            onClick={() => setSelectedQuery('SELECT * FROM "Agent" WHERE "isEnabled" = true;')}
          >
            Active Agents
          </button>
          <span className="mx-2">•</span>
          <button
            className="text-primary hover:underline"
            onClick={() =>
              setSelectedQuery('SELECT COUNT(*) as total, status FROM "Task" GROUP BY status;')
            }
          >
            Task Stats
          </button>
        </div>
      </Card>
    </div>
  )
}
