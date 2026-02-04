'use client'

import { CommanderChat } from '@/components/mission-control/commander-chat'
import { AgentGraph } from '@/components/mission-control/agent-graph'
import { ExecutionTimeline } from '@/components/mission-control/execution-timeline'
import { VibeConsole } from '@/components/mission-control/vibe-console'
import { Card } from '@/components/ui/card'

export default function MissionControlPage() {
  return (
    <div className="h-screen flex">
      {/* Left Panel - Commander Chat */}
      <div className="w-[35%] border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Commander</h2>
          <p className="text-sm text-muted-foreground">
            Tell me what you need done
          </p>
        </div>
        <CommanderChat />
      </div>

      {/* Right Panel - Agent Graph, Timeline, Console */}
      <div className="w-[65%] flex flex-col">
        {/* Agent Assembly Graph */}
        <div className="h-[30%] border-b p-4">
          <h3 className="text-lg font-semibold mb-2">Agent Assembly</h3>
          <AgentGraph />
        </div>

        {/* Execution Timeline */}
        <div className="h-[40%] border-b p-4 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Execution Timeline</h3>
          <ExecutionTimeline />
        </div>

        {/* Vibe Console */}
        <div className="h-[30%] p-4 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Live Console</h3>
          <VibeConsole />
        </div>
      </div>
    </div>
  )
}
