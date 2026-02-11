'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Sparkles, Wand2 } from 'lucide-react'

interface CommanderChatProps {
  onTaskCreated?: () => void
}

export function CommanderChat({ onTaskCreated }: CommanderChatProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content:
        "Ready when you are. Tell me your goal and I'll break it into executable tasks, route the right employees, and keep humans in the loop.",
    },
  ])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'Task created successfully!' },
      ])
      onTaskCreated?.()
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    'Create a 7-day launch plan for our new feature.',
    'Review open approvals and summarize what needs human action.',
    'Generate a growth experiment backlog and assign owners.',
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`p-3 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground border-primary/40'
                  : 'bg-secondary/70 border-border/60'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-secondary/70 border-border/60">
              <p className="text-sm flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Thinking...
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className="border-t border-border/70 bg-background/80 backdrop-blur p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setMessage(action)}
              className="justify-start"
            >
              <Wand2 className="w-3 h-3 mr-1.5" />
              <span className="truncate max-w-[260px]">{action}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Describe what you want built, automated, or analyzed..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="resize-none min-h-[72px] max-h-40"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="h-auto self-stretch px-4"
          >
            <Send className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to run, Shift+Enter for newline.
        </p>
      </div>
    </div>
  )
}
