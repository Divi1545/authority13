import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/pricing', '/about', '/signin', '/signup']
  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isAuthRoute = pathname.startsWith('/api/auth')

  // Allow public routes and auth routes
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next()
  }

  // Check if user is authenticated for app routes
  if (pathname.startsWith('/app') || pathname.startsWith('/api')) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = new URL('/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Check super admin access for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = new URL('/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Check if user is super admin
    if (!(token as any).isSuperAdmin) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden: Super admin access required' }, { status: 403 })
      }
      // Redirect non-super-admins away from admin pages
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
