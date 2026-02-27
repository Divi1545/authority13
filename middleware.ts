import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit } from '@/lib/rate-limit'

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown'
}

function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)

  // Webhook routes skip auth but still get rate-limited
  if (pathname.startsWith('/api/webhooks/')) {
    const rl = checkRateLimit(`wh:${ip}`, 30, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.resetAt)
    return NextResponse.next()
  }

  // Public routes
  const publicRoutes = ['/', '/pricing', '/about', '/signin', '/signup']
  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isAuthRoute = pathname.startsWith('/api/auth')
  const isHealthRoute = pathname === '/api/health'

  if (isPublicRoute || isHealthRoute) return NextResponse.next()

  // Rate limit auth routes (signup/signin abuse prevention)
  if (isAuthRoute) {
    if (pathname.includes('signup')) {
      const rl = checkRateLimit(`signup:${ip}`, 5, 60_000)
      if (!rl.allowed) return rateLimitResponse(rl.resetAt)
    }
    return NextResponse.next()
  }

  // Rate limit all API routes
  if (pathname.startsWith('/api')) {
    const rl = checkRateLimit(`api:${ip}`, 60, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.resetAt)

    // Stricter limit on chat (expensive LLM calls)
    if (pathname === '/api/chat') {
      const chatRl = checkRateLimit(`chat:${ip}`, 10, 60_000)
      if (!chatRl.allowed) return rateLimitResponse(chatRl.resetAt)
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Authenticated app/API routes
  if (pathname.startsWith('/app') || pathname.startsWith('/api')) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
      }
      const url = new URL('/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Super admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
      }
      const url = new URL('/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (!(token as any).isSuperAdmin) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden: Super admin access required', code: 'FORBIDDEN' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
