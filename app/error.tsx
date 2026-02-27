'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app-error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-1">An unexpected error occurred.</p>
        {error.digest && <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/app')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
