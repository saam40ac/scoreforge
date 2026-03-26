import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Crea la response che passeremo avanti — i cookie Supabase vengono scritti qui
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Scrivi i cookie sia sulla request che sulla response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: chiama getUser() per aggiornare la sessione
  // Non usare getSession() — può restituire dati dal cookie non verificati
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // ── Protezione route /admin ──────────────────────────────
  if (path.startsWith('/admin')) {
    // Non autenticato → login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    // Autenticato ma dobbiamo verificare il ruolo super_admin
    // Usiamo una query diretta (il client middleware è autenticato con i cookie dell'utente)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      // Utente normale → redirect alla sua dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Super admin confermato → lascia passare con i cookie aggiornati
    return response
  }

  // ── Protezione route dashboard normale ──────────────────
  const protectedPaths = ['/dashboard', '/portfolios', '/bio', '/media', '/settings', '/analytics']
  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Redirect automatico se già loggato tenta di accedere a /login ──
  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Escludi:
     * - _next/static  (file statici)
     * - _next/image   (ottimizzazione immagini)
     * - favicon, icone
     * - pagine legali (pubbliche)
     * - API routes analytics (chiamate dalla landing pubblica non autenticata)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.svg|legal|register|home|api/analytics|api/share-links|api/webhook).*)',
  ],
}
