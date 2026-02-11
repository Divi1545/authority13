import { subscribeToEvents } from './redis'

export interface SSEEvent {
  type: string
  data: any
  timestamp: number
}

export function createSSEStream(runId: string) {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController | null = null

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
      
      // Send initial connection message
      const initEvent = formatSSE({
        type: 'connected',
        data: { runId },
        timestamp: Date.now(),
      })
      ctrl.enqueue(encoder.encode(initEvent))

      // Subscribe to Redis channel for this run
      const channel = `run:${runId}`
      
      subscribeToEvents(channel, (event: SSEEvent) => {
        const sseMessage = formatSSE(event)
        ctrl.enqueue(encoder.encode(sseMessage))
      })
    },
    cancel() {
      // Cleanup subscription
      controller = null
    },
  })

  return stream
}

function formatSSE(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`
}

export function createSSEResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
