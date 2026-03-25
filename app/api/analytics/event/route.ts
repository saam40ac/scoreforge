import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function parseUA(ua: string): string {
  if (!ua) return 'Unknown'
  const browser = ua.includes('Edg') ? 'Edge'
    : ua.includes('Chrome')  ? 'Chrome'
    : ua.includes('Firefox')  ? 'Firefox'
    : ua.includes('Safari')   ? 'Safari'
    : 'Other'
  const os = ua.includes('Windows')   ? 'Windows'
    : ua.includes('Macintosh') ? 'macOS'
    : ua.includes('iPhone')    ? 'iPhone'
    : ua.includes('Android')   ? 'Android'
    : ua.includes('Linux')     ? 'Linux'
    : 'Other'
  return `${browser} / ${os}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      portfolio_id, track_id, event_type,
      play_position, pause_position, duration_pct,
      share_link_id, session_id, referrer,
    } = body

    if (!portfolio_id || !event_type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const country  = req.headers.get('x-vercel-ip-country') || null
    const city     = req.headers.get('x-vercel-ip-city')    || null
    const ua       = req.headers.get('user-agent') || ''

    // 1. Registra evento
    await supabase.from('analytics_events').insert({
      portfolio_id,
      track_id:        track_id        || null,
      event_type,
      play_position:   play_position   ?? null,
      pause_position:  pause_position  ?? null,
      duration_pct:    duration_pct    ?? null,
      share_link_id:   share_link_id   || null,
      session_id:      session_id      || null,
      referrer:        referrer        || null,
      country, city,
      user_agent_short: parseUA(ua),
    })

    // 2. Aggiorna share link (se presente)
    if (share_link_id) {
      if (event_type === 'view') {
        await supabase.rpc('increment_share_link_views', { link_id: share_link_id })
          .then(({ error }) => {
            // Fallback se rpc non esiste ancora: update diretto
            if (error) {
              supabase
                .from('share_links')
                .select('view_count')
                .eq('id', share_link_id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    supabase.from('share_links').update({
                      view_count: (data.view_count || 0) + 1,
                      last_viewed_at: new Date().toISOString(),
                    }).eq('id', share_link_id).then(() => {})
                  }
                })
            }
          })
      }
      if (event_type === 'play') {
        supabase
          .from('share_links')
          .select('play_count')
          .eq('id', share_link_id)
          .single()
          .then(({ data }) => {
            if (data) {
              supabase.from('share_links').update({
                play_count: (data.play_count || 0) + 1,
              }).eq('id', share_link_id).then(() => {})
            }
          })
      }
    }

    // 3. Aggiorna view_count sul portfolio (solo per event view)
    if (event_type === 'view') {
      supabase
        .from('portfolios')
        .select('view_count')
        .eq('id', portfolio_id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase.from('portfolios').update({
              view_count: (data.view_count || 0) + 1
            }).eq('id', portfolio_id).then(() => {})
          }
        })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Analytics error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
