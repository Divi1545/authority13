'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app-section-error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Page Error</h2>
        <p className="text-muted-foreground max-w-md">{error.message || 'An unexpected error occurred in this section.'}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Retry</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/app')}>
          Mission Control
        </Button>
      </div>
    </div>
  )
}
