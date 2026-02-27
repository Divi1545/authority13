'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Brain, Search } from 'lucide-react'

interface MemoryEntry {
  id: string
  agentType: string
  content: string
  metadata: Record<string, any>
  createdAt: string
}

const AGENT_COLORS: Record<string, string> = {
  growth: 'bg-emerald-100 text-emerald-800',
  ops: 'bg-blue-100 text-blue-800',
  support: 'bg-purple-100 text-purple-800',
  analyst: 'bg-amber-100 text-amber-800',
  agent: 'bg-gray-100 text-gray-800',
  commander: 'bg-indigo-100 text-indigo-800',
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async (query?: string) => {
    setLoading(true)
    try {
      const url = query ? `/api/memory?q=${encodeURIComponent(query)}` : '/api/memory'
      const res = await fetch(url)
      const data = await res.json()
      setMemories(data.memories || [])
    } catch {
      // failed
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = () => {
    load(search.trim() || undefined)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Agent Memory
        </h1>
        <p className="text-muted-foreground mt-1">
          Persistent memory store for your AI agents. Agents save important context, decisions, and insights here for future reference.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : memories.length === 0 ? (
        <Card className="p-8 text-center">
          <Brain className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No memories yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Agents will save important context here as they work on tasks.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => (
            <Card key={memory.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={AGENT_COLORS[memory.agentType] || 'bg-gray-100 text-gray-800'}>
                      {memory.agentType}
                    </Badge>
                    {memory.metadata?.category && (
                      <Badge variant="outline" className="text-xs">{memory.metadata.category}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(memory.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{memory.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
