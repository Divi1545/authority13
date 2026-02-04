'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface LogEntry {
  id: string
  timestamp: string
  agent: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export function VibeConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      agent: 'Commander',
      message: 'System initialized. Ready for tasks.',
      type: 'info',
    },
  ])

  const typeColors = {
    info: 'bg-blue-500/10 text-blue-500',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    error: 'bg-red-500/10 text-red-500',
  }

  return (
    <div className="font-mono text-xs space-y-1 bg-black/50 p-4 rounded-lg h-full overflow-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <Badge variant="outline" className="shrink-0">
            {log.agent}
          </Badge>
          <span className={typeColors[log.type]}>{log.message}</span>
        </div>
      ))}
    </div>
  )
}
