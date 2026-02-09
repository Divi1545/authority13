'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResultsTableProps {
  results: any[]
  executionMs?: number
}

export function ResultsTable({ results, executionMs }: ResultsTableProps) {
  if (!results || results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No results to display</p>
      </Card>
    )
  }

  const columns = Object.keys(results[0])

  return (
    <div className="space-y-2">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{results.length} rows</Badge>
          {executionMs !== undefined && (
            <Badge variant="secondary">{executionMs}ms</Badge>
          )}
        </div>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-sm font-medium"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-sm">
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        {results.length >= 1000 && (
          <div className="border-t bg-muted/20 px-4 py-2 text-center text-xs text-muted-foreground">
            Results limited to 1000 rows. Use LIMIT in your query for specific pagination.
          </div>
        )}
      </Card>
    </div>
  )
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
