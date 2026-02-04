'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Square } from 'lucide-react'

export default function BoardroomPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const handleStartRecording = () => {
    setIsRecording(true)
    // In production: use MediaRecorder API
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setTranscript(transcript + '\nUser: [Audio recording would be transcribed here]')
    // In production: upload to /api/boardroom/upload for STT
  }

  return (
    <div className="h-screen flex">
      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Boardroom</h1>
          <p className="text-muted-foreground">
            Voice briefings with your AI workforce
          </p>
        </div>

        {/* Commander Avatar */}
        <div className="relative mb-12">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ${
              isRecording ? 'animate-pulse' : ''
            }`}
          >
            <div className="text-6xl text-white">🎙️</div>
          </div>
          <Badge
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            variant={isRecording ? 'destructive' : 'secondary'}
          >
            {isRecording ? 'Listening...' : 'Ready'}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isRecording ? (
            <Button size="lg" onClick={handleStartRecording}>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={handleStopRecording}>
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-8 max-w-md text-center">
          Push-to-talk MVP: Record short audio segments that are transcribed via OpenAI Whisper.
          Commander responds with text (TTS coming in V2).
        </p>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 border-l p-6 space-y-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            {transcript ? (
              <div className="text-sm whitespace-pre-wrap">{transcript}</div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start recording to see transcript here...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agenda</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-1">
              <li>• Welcome & status check</li>
              <li>• Task review</li>
              <li>• New objectives</li>
              <li>• Action items</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Action items will appear here during the meeting
            </p>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full">
          Create Task from Discussion
        </Button>
      </div>
    </div>
  )
}
