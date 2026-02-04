'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AgentGraph() {
  const agents = [
    { id: 'commander', name: 'Commander', status: 'active', x: 50, y: 20 },
    { id: 'growth', name: 'Growth', status: 'idle', x: 20, y: 60 },
    { id: 'ops', name: 'Ops', status: 'idle', x: 50, y: 60 },
    { id: 'support', name: 'Support', status: 'idle', x: 80, y: 60 },
  ]

  const connections = [
    { from: 'commander', to: 'growth' },
    { from: 'commander', to: 'ops' },
    { from: 'commander', to: 'support' },
  ]

  const statusColors = {
    active: 'bg-green-500',
    executing: 'bg-blue-500',
    waiting: 'bg-yellow-500',
    idle: 'bg-gray-500',
  }

  return (
    <div className="relative h-full bg-secondary/30 rounded-lg p-4">
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, idx) => {
          const from = agents.find((a) => a.id === conn.from)
          const to = agents.find((a) => a.id === conn.to)
          if (!from || !to) return null

          return (
            <line
              key={idx}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-border"
            />
          )
        })}
      </svg>

      {agents.map((agent) => (
        <div
          key={agent.id}
          className="absolute"
          style={{
            left: `${agent.x}%`,
            top: `${agent.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Card className="p-4 min-w-[100px] text-center">
            <div
              className={`w-3 h-3 rounded-full ${
                statusColors[agent.status as keyof typeof statusColors]
              } mx-auto mb-2`}
            />
            <div className="text-sm font-semibold">{agent.name}</div>
            <Badge variant="outline" className="text-xs mt-1">
              {agent.status}
            </Badge>
          </Card>
        </div>
      ))}
    </div>
  )
}
