'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

export function ExecutionTimeline() {
  const steps = [
    {
      id: 1,
      type: 'plan',
      title: 'Task Plan Created',
      description: 'Commander generated execution plan',
      status: 'completed',
      timestamp: '2 min ago',
    },
    {
      id: 2,
      type: 'tool_call',
      title: 'Search Database',
      description: 'Growth Agent: Searching leads table',
      status: 'completed',
      timestamp: '1 min ago',
    },
    {
      id: 3,
      type: 'tool_call',
      title: 'Generate Email Content',
      description: 'Growth Agent: Drafting outreach variants',
      status: 'executing',
      timestamp: 'Just now',
    },
    {
      id: 4,
      type: 'approval',
      title: 'Approval Required',
      description: 'Send 10 emails to leads',
      status: 'pending',
      timestamp: 'Waiting',
    },
  ]

  const statusIcons = {
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    executing: <Clock className="w-5 h-5 text-blue-500 animate-spin" />,
    pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    idle: <Circle className="w-5 h-5 text-gray-500" />,
  }

  return (
    <div className="space-y-4">
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No active tasks. Start a conversation with Commander to begin.
        </p>
      ) : (
        steps.map((step, idx) => (
          <Card key={step.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {statusIcons[step.status as keyof typeof statusIcons]}
                  <div>
                    <CardTitle className="text-sm">{step.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={step.status === 'pending' ? 'destructive' : 'outline'}>
                  {step.timestamp}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  )
}
