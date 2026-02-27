'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageCircle, Plus, Trash2, CheckCircle2, AlertCircle, Bot, Hash, Mail, Phone } from 'lucide-react'

interface ChannelStatus {
  connected: boolean
  enabled?: boolean
  name?: string
  createdAt?: string
}

const CHANNELS = [
  { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'bg-blue-500', description: 'Connect a Telegram bot to receive and respond to messages', available: true },
  { id: 'discord', name: 'Discord', icon: Bot, color: 'bg-indigo-500', description: 'Add your AI agents to Discord servers', available: false },
  { id: 'slack', name: 'Slack', icon: Hash, color: 'bg-green-600', description: 'Integrate with Slack workspaces', available: false },
  { id: 'whatsapp', name: 'WhatsApp', icon: Phone, color: 'bg-emerald-500', description: 'WhatsApp Business API integration', available: false },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-orange-500', description: 'Process and respond to emails', available: false },
]

export default function ChannelsPage() {
  const [statuses, setStatuses] = useState<Record<string, ChannelStatus>>({})
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [botToken, setBotToken] = useState('')
  const [showSetup, setShowSetup] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    setLoading(true)
    try {
      const telegramRes = await fetch('/api/channels/telegram')
      const telegramData = await telegramRes.json()
      setStatuses({ telegram: telegramData })
    } catch {
      // channels not loaded
    } finally {
      setLoading(false)
    }
  }

  const connectTelegram = async () => {
    if (!botToken.trim()) return
    setConnecting('telegram')
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/channels/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to connect')

      setSuccess(`Connected to ${data.botName}!`)
      setBotToken('')
      setShowSetup(null)
      loadStatuses()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setConnecting(null)
    }
  }

  const disconnectTelegram = async () => {
    setConnecting('telegram-disconnect')
    try {
      await fetch('/api/channels/telegram', { method: 'DELETE' })
      setSuccess('Telegram disconnected')
      loadStatuses()
    } catch {
      setError('Failed to disconnect')
    } finally {
      setConnecting(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Channels</h1>
        <p className="text-muted-foreground mt-1">Connect messaging platforms so your AI agents can communicate with users anywhere.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {CHANNELS.map((channel) => {
            const status = statuses[channel.id]
            const isConnected = status?.connected

            return (
              <Card key={channel.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`${channel.color} w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                    <channel.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{channel.name}</h3>
                      {isConnected ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
                      ) : channel.available ? (
                        <Badge variant="outline">Not connected</Badge>
                      ) : (
                        <Badge variant="secondary">Coming soon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>

                    {isConnected && status?.name && (
                      <p className="text-xs text-muted-foreground mt-2">Bot: {status.name}</p>
                    )}

                    {showSetup === channel.id && channel.id === 'telegram' && (
                      <div className="mt-4 space-y-3 p-4 bg-neutral-50 rounded-lg border">
                        <div>
                          <label className="text-sm font-medium">Bot Token</label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Get this from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@BotFather</a> on Telegram
                          </p>
                          <Input
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            type="password"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={connectTelegram} disabled={!botToken.trim() || connecting === 'telegram'} size="sm">
                            {connecting === 'telegram' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Connect
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setShowSetup(null); setBotToken('') }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={disconnectTelegram}
                        disabled={connecting === 'telegram-disconnect'}
                      >
                        {connecting === 'telegram-disconnect' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    ) : channel.available ? (
                      <Button size="sm" onClick={() => setShowSetup(channel.id)}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Connect
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
