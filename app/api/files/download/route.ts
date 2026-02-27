import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { filename, content, format } = await req.json()
    if (!filename || !content) {
      return NextResponse.json({ error: 'Missing filename or content' }, { status: 400 })
    }

    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      json: 'application/json',
      markdown: 'text/markdown',
      html: 'text/html',
      text: 'text/plain',
    }

    const mime = mimeTypes[format] || 'text/plain'

    return new Response(content, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 })
  }
}
