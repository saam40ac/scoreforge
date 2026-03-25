import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function parseUA(ua: string): string {
  if (!ua) return 'Unknown'
  const browser = ua.includes('Edg')     ? 'Edge'
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

    // 1. Registra evento (policy pubblica già presente)
    const { error: insertError } = await supabase.from('analytics_events').insert({
      portfolio_id,
      track_id:         track_id        || null,
      event_type,
      play_position:    play_position   ?? null,
      pause_position:   pause_position  ?? null,
      duration_pct:     duration_pct    ?? null,
      share_link_id:    share_link_id   || null,
      session_id:       session_id      || null,
      referrer:         referrer        || null,
      country, city,
      user_agent_short: parseUA(ua),
    })

    if (insertError) {
      console.error('Analytics insert error:', insertError)
    }

    // 2. Aggiorna contatori share link tramite funzioni SECURITY DEFINER
    //    (bypassano RLS — sicure perché accettano solo UUID validi)
    if (share_link_id) {
      if (event_type === 'view') {
        const { error } = await supabase.rpc('increment_share_link_view', { link_id: share_link_id })
        if (error) console.error('increment_share_link_view error:', error)
      }
      if (event_type === 'play') {
        const { error } = await supabase.rpc('increment_share_link_play', { link_id: share_link_id })
        if (error) console.error('increment_share_link_play error:', error)
      }
    }

    // 3. Aggiorna view_count portfolio (fire and forget)
    if (event_type === 'view') {
      supabase.rpc('increment_portfolio_view', { p_id: portfolio_id }).then(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Analytics route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
