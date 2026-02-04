'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send, Mic, Zap } from 'lucide-react'

export function CommanderChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m the Commander. Tell me what you need done, and I\'ll coordinate the right agents to get it done.',
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
    'Weekly Briefing',
    'Draft Outreach',
    'Check Ops',
  ]

  return (
    <div className="flex flex-col flex-1">
      {/* Chat History */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`p-3 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-secondary">
              <p className="text-sm">Thinking...</p>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-4">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => setMessage(action)}
            >
              <Zap className="w-3 h-3 mr-1" />
              {action}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Tell Commander what you need done..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="resize-none"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <Button size="icon" onClick={handleSend} disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          Start Agent Call
        </Button>
      </div>
    </div>
  )
}
