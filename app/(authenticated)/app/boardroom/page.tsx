'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mic, Square, Radio, FileText, CheckCircle2, AlertCircle, Trash2, Download } from 'lucide-react'

interface BoardroomSession {
  id: string
  transcript: string
  actionItems: string[]
  summary: string
  createdAt: Date
}

export default function BoardroomPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [sessions, setSessions] = useState<BoardroomSession[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError('')
    setTranscript('')
    setActionItems([])
    setSummary('')
    setAudioUrl(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        await transcribeAndAnalyze(blob)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
    } catch (err: any) {
      setError(err.message === 'Permission denied'
        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
        : `Failed to start recording: ${err.message}`)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const transcribeAndAnalyze = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const res = await fetch('/api/boardroom/transcribe', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Transcription failed')

      setTranscript(data.transcript || '')

      if (data.transcript) {
        setIsTranscribing(false)
        setIsAnalyzing(true)

        const analysisRes = await fetch('/api/boardroom/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: data.transcript }),
        })
        const analysisData = await analysisRes.json()

        setActionItems(analysisData.actionItems || [])
        setSummary(analysisData.summary || '')

        setSessions((prev) => [{
          id: Date.now().toString(),
          transcript: data.transcript,
          actionItems: analysisData.actionItems || [],
          summary: analysisData.summary || '',
          createdAt: new Date(),
        }, ...prev])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsTranscribing(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" />
          AI Boardroom
        </h1>
        <p className="text-muted-foreground mt-1">Record voice briefings and get AI-generated transcripts, summaries, and action items</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Recording Controls */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            {isRecording ? (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-red-400 animate-ping opacity-30" />
                </div>
                <p className="text-sm font-medium text-red-600">Recording...</p>
                <Button variant="destructive" size="lg" onClick={stopRecording}>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Click to start recording your briefing</p>
                <Button size="lg" onClick={startRecording} disabled={isTranscribing || isAnalyzing}>
                  {isTranscribing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transcribing...</>
                  ) : isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Mic className="w-4 h-4 mr-2" />Start Recording</>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Playback */}
      {audioUrl && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls src={audioUrl} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Transcript
              </CardTitle>
              <Badge variant="outline">{transcript.split(/\s+/).length} words</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Action Items ({actionItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-neutral-50">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Sessions */}
      {sessions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Past Sessions</CardTitle>
            <CardDescription>{sessions.length} recordings this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sessions.slice(1).map((s) => (
              <div key={s.id} className="p-3 rounded-lg border">
                <p className="text-sm truncate">{s.transcript.slice(0, 100)}...</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-xs">{s.actionItems.length} action items</Badge>
                  <span className="text-xs text-muted-foreground">{s.createdAt.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
