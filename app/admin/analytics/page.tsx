import { createClient } from '@/lib/supabase/server'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase.from('analytics_events')
      .select('portfolio_id, event_type')
      .eq('event_type', 'view')
      .gte('created_at', since30d),
    supabase.from('analytics_events')
      .select('country')
      .gte('created_at', since30d)
      .not('country', 'is', null),
    supabase.from('analytics_events')
      .select('user_agent_short')
      .gte('created_at', since30d)
      .not('user_agent_short', 'is', null),
  ])

  const dailyEvents  = (r1.data  || []) as { event_type: string; created_at: string }[]
  const topPortfolios = (r2.data || []) as { portfolio_id: string; event_type: string }[]
  const geoData      = (r3.data  || []) as { country: string }[]
  const browserData  = (r4.data  || []) as { user_agent_short: string }[]

  // Aggregazioni server-side
  const byDay: Record<string,{views:number;plays:number}> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    byDay[d.toISOString().slice(0,10)] = { views: 0, plays: 0 }
  }
  dailyEvents?.forEach(e => {
    const k = e.created_at.slice(0,10)
    if (byDay[k]) {
      if (e.event_type === 'view') byDay[k].views++
      if (e.event_type === 'play') byDay[k].plays++
    }
  })

  const pCounts: Record<string,number> = {}
  topPortfolios?.forEach(e => { pCounts[e.portfolio_id] = (pCounts[e.portfolio_id] || 0) + 1 })
  const topPIds = Object.entries(pCounts).sort((a,b) => b[1]-a[1]).slice(0,10)

  const { data: topPDataRaw } = await supabase.from('portfolios')
    .select('id, title, slug, owner_id')
    .in('id', topPIds.map(([id]) => id))
  const topPData = (topPDataRaw || []) as { id: string; title: string; slug: string; owner_id: string }[]

  const { data: topOwnersRaw } = await supabase.from('profiles')
    .select('id, name').in('id', topPData.map(p => p.owner_id))
  const topOwners = (topOwnersRaw || []) as { id: string; name: string }[]
  const ownerMap = Object.fromEntries(topOwners.map(o => [o.id, o.name]))

  const geoCounts: Record<string,number> = {}
  geoData?.forEach(e => { if (e.country) geoCounts[e.country] = (geoCounts[e.country] || 0) + 1 })
  const topGeo = Object.entries(geoCounts).sort((a,b) => b[1]-a[1]).slice(0,10)

  const bCounts: Record<string,number> = {}
  browserData?.forEach(e => { if (e.user_agent_short) bCounts[e.user_agent_short] = (bCounts[e.user_agent_short] || 0) + 1 })
  const topBrowsers = Object.entries(bCounts).sort((a,b) => b[1]-a[1]).slice(0,8)

  const chartData = Object.entries(byDay).map(([date, v]) => ({ date: date.slice(5), ...v }))
  const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.plays)), 1)
  const totalViews = dailyEvents?.filter(e => e.event_type === 'view').length || 0
  const totalPlays = dailyEvents?.filter(e => e.event_type === 'play').length || 0
  const totalGeo   = geoData?.length || 0

  return (
    <div style={{ padding: '32px', fontFamily: "'Outfit', sans-serif", color: '#f0ebe0' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#f0ebe0', marginBottom: '4px' }}>Analytics Globali</h1>
        <p style={{ fontSize: '12px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>Ultimi 30 giorni · tutte le landing page</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Views totali',   value: totalViews, color: '#7f77dd' },
          { label: 'Ascolti totali', value: totalPlays, color: '#c8a45a' },
          { label: 'Sessioni geo',   value: totalGeo,   color: '#1d9e75' },
          { label: 'Portfolio attivi', value: topPIds.length, color: '#378add' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>{k.label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Grafico 30 giorni */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Andamento 30 giorni</div>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '80px', marginBottom: '6px' }}>
          {chartData.map((d, i) => (
            <div key={i} title={`${d.date}: ${d.views}v ${d.plays}p`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', background: '#7f77dd', opacity: .7, borderRadius: '1px 1px 0 0', height: `${Math.round((d.views/maxVal)*76)}px`, minHeight: d.views > 0 ? '2px' : '0' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#5a5548' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', background: '#7f77dd', borderRadius: '1px', display: 'inline-block' }} />Views
          </span>
        </div>
      </div>

      {/* Top portfolio + Geo + Browser */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>

        {/* Top portfolio */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '14px' }}>Top portfolio · views 30gg</div>
          {topPIds.slice(0,8).map(([id, count], i) => {
            const p = topPData?.find(x => x.id === id)
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: '#3a3648', fontFamily: 'DM Mono, monospace', width: '14px' }}>{i+1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#f0ebe0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.title || id.slice(0,8)}</div>
                  <div style={{ fontSize: '10px', color: '#5a5548' }}>{ownerMap[p?.owner_id || ''] || '—'}</div>
                </div>
                <span style={{ fontSize: '12px', color: '#c8a45a', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* Geo */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '14px' }}>Paesi visitatori</div>
          {topGeo.map(([country, count]) => (
            <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
              <span style={{ fontSize: '12px', minWidth: '28px', color: '#a09888' }}>{country}</span>
              <div style={{ flex: 1, height: '5px', background: '#1e1e2e', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((count/(topGeo[0]?.[1]||1))*100)}%`, background: '#7f77dd', opacity: .7, borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#5a5548', fontFamily: 'DM Mono, monospace', minWidth: '24px', textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Browser */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '14px' }}>Browser / OS</div>
          {topBrowsers.map(([browser, count]) => (
            <div key={browser} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
              <span style={{ fontSize: '11px', color: '#a09888', flex: 1 }}>{browser}</span>
              <span style={{ fontSize: '11px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
