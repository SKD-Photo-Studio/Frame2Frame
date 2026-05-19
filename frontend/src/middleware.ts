import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy_publishable_key'

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (err) {
    console.error('Middleware auth check error:', err)
  }

  // Maintenance Mode Check
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance'
  const isPublicAsset = request.nextUrl.pathname.match(/\.(.*)$/) || request.nextUrl.pathname.startsWith('/_next')
  
  const isLiveMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  const isLocalMaintenance = process.env.NEXT_PUBLIC_LOCAL_MAINTENANCE_MODE === 'true'
  const isLocal = process.env.NODE_ENV === 'development'
  
  const activeMaintenance = isLocal ? isLocalMaintenance : isLiveMaintenance

  if (activeMaintenance && !isMaintenancePage && !isPublicAsset) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  // Protect internal routes
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth') 
  const isPublicApi = request.nextUrl.pathname === '/api/tenant' || request.nextUrl.pathname === '/api/tenant/logo'
  const isBulkRoute = request.nextUrl.pathname.startsWith('/api/bulk')
  const apiKey = request.headers.get('x-api-key')
  const isAuthorizedApiKey = apiKey && apiKey === process.env.F2F_STUDIO_LIVE_SYNC_SECRET

  if (!user && !isLoginPage && !isAuthRoute && !isPublicApi && !isPublicAsset && !(isBulkRoute && isAuthorizedApiKey)) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('returnTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
