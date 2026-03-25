/**
 * Client-side analytics tracker per ScoreForge.
 * Invia eventi alla API route /api/analytics/event.
 * Genera un session_id anonimo persistente per sessione browser.
 */

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = sessionStorage.getItem('sf_session')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('sf_session', id)
  }
  return id
}

interface TrackEventParams {
  portfolio_id: string
  track_id?:    string
  event_type:   'view' | 'play' | 'pause' | 'complete' | 'seek' | 'contact_click' | 'embed_view'
  play_position?:  number
  pause_position?: number
  duration_pct?:   number
  share_link_id?:  string
}

let _lastView = ''

export function trackEvent(params: TrackEventParams) {
  // Dedup: non inviare view multipli per la stessa landing nella stessa sessione
  if (params.event_type === 'view') {
    const key = `${params.portfolio_id}`
    if (_lastView === key) return
    _lastView = key
  }

  const payload = {
    ...params,
    session_id: getSessionId(),
    referrer:   typeof document !== 'undefined' ? document.referrer || null : null,
  }

  // Usa sendBeacon se disponibile (non blocca navigazione), fallback fetch
  const url  = '/api/analytics/event'
  const data = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }))
  } else {
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data, keepalive: true }).catch(() => {})
  }
}
