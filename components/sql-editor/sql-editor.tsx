'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Download, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'sql-formatter'

interface SqlEditorProps {
  workspaceId: string
  onQueryExecute?: (results: any) => void
}

export function SqlEditor({ workspaceId, onQueryExecute }: SqlEditorProps) {
  const [query, setQuery] = useState('')
  const [executing, setExecuting] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  // Load last query from localStorage
  useEffect(() => {
    const savedQuery = localStorage.getItem('sql-editor-query')
    if (savedQuery) {
      setQuery(savedQuery)
    }
  }, [])

  // Save query to localStorage on change
  const handleQueryChange = (value: string | undefined) => {
    const newQuery = value || ''
    setQuery(newQuery)
    localStorage.setItem('sql-editor-query', newQuery)
  }

  // Format query
  const handleFormat = () => {
    try {
      const formatted = format(query, {
        language: 'postgresql',
        keywordCase: 'upper',
      })
      setQuery(formatted)
    } catch (error) {
      console.error('Format error:', error)
    }
  }

  // Execute query
  const handleExecute = async () => {
    if (!query.trim()) return

    setExecuting(true)
    setLastResult(null)

    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, workspaceId }),
      })

      const data = await res.json()

      if (res.ok) {
        setLastResult({
          success: true,
          results: data.results,
          executionMs: data.executionMs,
          resultCount: data.resultCount,
          queryType: data.queryType,
        })
        onQueryExecute?.(data)
      } else {
        setLastResult({
          success: false,
          error: data.error,
        })
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        error: error.message || 'Failed to execute query',
      })
    } finally {
      setExecuting(false)
    }
  }

  // Handle keyboard shortcut (Ctrl+Enter)
  const handleEditorMount = (editor: any) => {
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [2048 | 3], // Ctrl+Enter
      run: () => handleExecute(),
    })
  }

  // Save query to saved queries
  const handleSave = () => {
    const savedQueries = JSON.parse(localStorage.getItem('sql-saved-queries') || '[]')
    const timestamp = new Date().toISOString()
    savedQueries.unshift({
      query,
      timestamp,
      name: query.substring(0, 50) + '...',
    })
    localStorage.setItem('sql-saved-queries', JSON.stringify(savedQueries.slice(0, 20)))
    alert('Query saved!')
  }

  // Export results
  const handleExport = (format: 'csv' | 'json') => {
    if (!lastResult?.success || !lastResult.results) return

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(lastResult.results, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `query-results-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // CSV export
      const results = lastResult.results
      if (!results.length) return

      const headers = Object.keys(results[0]).join(',')
      const rows = results.map((row: any) =>
        Object.values(row)
          .map((v: any) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      const csv = [headers, ...rows].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `query-results-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Action Bar */}
      <Card className="mb-4 flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Button onClick={handleFormat} variant="outline" size="sm">
            Format
          </Button>
          <Button
            onClick={handleExecute}
            disabled={executing || !query.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {executing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Query
          </Button>
          <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
        </div>
        <div className="flex items-center gap-2">
          {lastResult && (
            <>
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                size="sm"
                disabled={!lastResult.success}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport('json')}
                variant="outline"
                size="sm"
                disabled={!lastResult.success}
              >
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
            </>
          )}
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </Card>

      {/* Editor */}
      <Card className="flex-1 overflow-hidden p-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={query}
          onChange={handleQueryChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Card>

      {/* Status Bar */}
      {lastResult && (
        <Card className="mt-4 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Success: {lastResult.resultCount} rows returned
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({lastResult.executionMs}ms)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Error: {lastResult.error}
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
