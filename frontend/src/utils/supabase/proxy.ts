import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'

  // If placeholders or dummy values are in place, bypass redirect to allow local development & UI exploration
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT')
  )

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  const localAuthCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb-demo-auth') || request.cookies.get('uzhavan-session')

  if (localAuthCookie) {
    user = { id: 'local-farmer-user', email: 'farmer@uzhavan.local' }
  } else if (isConfigured) {
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      user = null
    }
  }

  const { pathname } = request.nextUrl

  // Protected route check
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
  const isPublicRoute = pathname.startsWith('/api') || pathname.startsWith('/audio') || pathname.startsWith('/_next') || pathname.includes('.')

  if (!user && !isAuthRoute && !isPublicRoute) {
    // Only redirect if explicitly unauthenticated and remote Supabase is active
    if (isConfigured && !localAuthCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (user && pathname === '/login') {
    // Authenticated user trying to access login, redirect to home
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
