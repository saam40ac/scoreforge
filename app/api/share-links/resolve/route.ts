import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/share-links/resolve?alias=xxx
// Risolve un alias share link → redirect al portfolio con tracking
export async function GET(req: NextRequest) {
  const alias = req.nextUrl.searchParams.get('alias')
  if (!alias) return NextResponse.redirect(new URL('/', req.url))

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Trova il share link
  const { data: link } = await supabase
    .from('share_links')
    .select('id, portfolio_id, active, portfolios(slug)')
    .eq('alias', alias)
    .single()

  if (!link || !link.active) {
    // Link non trovato o disattivato
    return NextResponse.redirect(new URL('/landing.html', req.url))
  }

  // Incrementa il contatore views
  await supabase.rpc('increment_share_link_view', { link_id: link.id })

  // Redirect al portfolio con parametro share_link per tracking analytics
  const slug = (link.portfolios as any)?.slug
  if (!slug) return NextResponse.redirect(new URL('/', req.url))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoreforge.it'
  const dest   = `${appUrl.replace(/\/+$/, '')}/${slug}?sl=${link.id}`

  return NextResponse.redirect(new URL(dest))
}
