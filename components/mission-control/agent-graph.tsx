'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AgentNode {
  id: string
  name: string
  status: 'active' | 'executing' | 'waiting' | 'idle'
  color: string
  x: number
  y: number
}

interface AgentGraphProps {
  activeAgents?: string[]
}

export function AgentGraph({ activeAgents = [] }: AgentGraphProps) {
  const agents: AgentNode[] = [
    { id: 'commander', name: 'Commander', status: activeAgents.includes('commander') ? 'active' : 'idle', color: '#6366f1', x: 50, y: 15 },
    { id: 'growth', name: 'Growth', status: activeAgents.includes('growth') ? 'executing' : 'idle', color: '#10b981', x: 15, y: 55 },
    { id: 'ops', name: 'Ops', status: activeAgents.includes('ops') ? 'executing' : 'idle', color: '#3b82f6', x: 38, y: 55 },
    { id: 'support', name: 'Support', status: activeAgents.includes('support') ? 'executing' : 'idle', color: '#8b5cf6', x: 62, y: 55 },
    { id: 'analyst', name: 'Analyst', status: activeAgents.includes('analyst') ? 'executing' : 'idle', color: '#f59e0b', x: 85, y: 55 },
  ]

  const connections = [
    { from: 'commander', to: 'growth' },
    { from: 'commander', to: 'ops' },
    { from: 'commander', to: 'support' },
    { from: 'commander', to: 'analyst' },
  ]

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    executing: 'bg-blue-500 animate-pulse',
    waiting: 'bg-yellow-500',
    idle: 'bg-gray-400',
  }

  const statusLabels: Record<string, string> = {
    active: 'Active',
    executing: 'Working',
    waiting: 'Waiting',
    idle: 'Idle',
  }

  return (
    <div className="relative h-full min-h-[200px] bg-neutral-50 rounded-lg p-4 border">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, idx) => {
          const from = agents.find((a) => a.id === conn.from)
          const to = agents.find((a) => a.id === conn.to)
          if (!from || !to) return null

          const isActive = from.status !== 'idle' && to.status !== 'idle'

          return (
            <line
              key={idx}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={isActive ? '#6366f1' : '#d4d4d8'}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={isActive ? undefined : '4 4'}
              opacity={isActive ? 0.8 : 0.5}
            />
          )
        })}
      </svg>

      {agents.map((agent) => (
        <div
          key={agent.id}
          className="absolute z-10"
          style={{ left: `${agent.x}%`, top: `${agent.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <Card className="p-3 min-w-[90px] text-center bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]}`} />
              <span className="text-xs font-semibold" style={{ color: agent.color }}>{agent.name}</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {statusLabels[agent.status]}
            </Badge>
          </Card>
        </div>
      ))}
    </div>
  )
}
