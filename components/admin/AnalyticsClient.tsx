'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'

interface AnalyticsEvent {
  event_type: string
  created_at: string
  portfolio_id: string
  track_id: string | null
  duration_pct: number | null
  country: string | null
  user_agent_short: string | null
  session_id: string | null
}
interface Portfolio { id: string; title: string; slug: string; status: string; accent_color: string }
interface TrackStat  { track_id: string; portfolio_id: string; title: string; genre: string | null; total_plays: number; completions: number; avg_listen_pct: number | null }
interface ShareLink  { id: string; portfolio_id: string; alias: string; label: string | null; active: boolean; view_count: number; play_count: number; created_at: string; last_viewed_at: string | null }
interface Track      { id: string; title: string; genre: string | null; portfolio_id: string }

interface Props {
  portfolios:  Portfolio[]
  events:      AnalyticsEvent[]
  trackStats:  TrackStat[]
  shareLinks:  ShareLink[]
  tracks:      Track[]
  userId:      string
}

const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''

export default function AnalyticsClient({ portfolios, events, trackStats, shareLinks, tracks, userId }: Props) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all')
  const [newLinkLabel,  setNewLinkLabel]  = useState('')
  const [newLinkAlias,  setNewLinkAlias]  = useState('')
  const [newLinkPortfolio, setNewLinkPortfolio] = useState(portfolios[0]?.id || '')
  const [links, setLinks] = useState<ShareLink[]>(shareLinks)
  const [creatingLink, setCreatingLink] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview'|'tracks'|'links'|'realtime'>('overview')

  // Filtra eventi per portfolio selezionato
  const filteredEvents = useMemo(() =>
    selectedPortfolio === 'all' ? events : events.filter(e => e.portfolio_id === selectedPortfolio),
    [events, selectedPortfolio]
  )

  // KPI principali
  const views     = filteredEvents.filter(e => e.event_type === 'view')
  const plays     = filteredEvents.filter(e => e.event_type === 'play')
  const completes = filteredEvents.filter(e => e.event_type === 'complete')
  const contacts  = filteredEvents.filter(e => e.event_type === 'contact_click')
  const uniqueViews = new Set(views.map(e => e.session_id)).size
  const avgCompletionPct = completes.length > 0
    ? Math.round(completes.reduce((a, e) => a + (e.duration_pct ?? 100), 0) / completes.length)
    : 0

  // Dati grafico ultimi 14 giorni
  const chartData = useMemo(() => {
    const days: Record<string, { views: number; plays: number }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days[key] = { views: 0, plays: 0 }
    }
    filteredEvents.forEach(e => {
      const key = e.created_at.slice(0, 10)
      if (days[key]) {
        if (e.event_type === 'view') days[key].views++
        if (e.event_type === 'play') days[key].plays++
      }
    })
    return Object.entries(days).map(([date, v]) => ({ date: date.slice(5), ...v }))
  }, [filteredEvents])
  const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.plays)), 1)

  // Paesi top
  const countries = useMemo(() => {
    const map: Record<string, number> = {}
    views.forEach(e => { if (e.country) map[e.country] = (map[e.country] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [views])

  // Browser/OS top
  const browsers = useMemo(() => {
    const map: Record<string, number> = {}
    views.forEach(e => { if (e.user_agent_short) map[e.user_agent_short] = (map[e.user_agent_short] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [views])

  // Tracce filtrate per portfolio
  const filteredTrackStats = selectedPortfolio === 'all' ? trackStats
    : trackStats.filter(t => t.portfolio_id === selectedPortfolio)

  // Crea share link
  async function createShareLink() {
    if (!newLinkPortfolio) { toast.error('Seleziona un portfolio'); return }
    setCreatingLink(true)
    const res = await fetch('/api/share-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_id: newLinkPortfolio, label: newLinkLabel || null, alias: newLinkAlias || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setLinks(prev => [data, ...prev])
      setNewLinkLabel(''); setNewLinkAlias('')
      toast.success('Link creato!')
    } else {
      toast.error(data.error || 'Errore creazione link')
    }
    setCreatingLink(false)
  }

  async function deleteLink(id: string) {
    await fetch(`/api/share-links?id=${id}`, { method: 'DELETE' })
    setLinks(prev => prev.filter(l => l.id !== id))
    toast.success('Link eliminato.')
  }

  function copyLink(alias: string) {
    const portfolio = portfolios.find(p => links.find(l => l.alias === alias && l.portfolio_id === p.id))
    const slug = portfolio?.slug || ''
    const url  = `${APP_URL}/${slug}?ref=${alias}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiato!')
  }

  // Stili condivisi
  const cardS: React.CSSProperties = {
    background:'var(--sf-card)', border:'1px solid var(--sf-border)',
    borderRadius:'14px', padding:'16px 20px',
  }
  const labelS: React.CSSProperties = {
    fontSize:'10px', color:'var(--sf-text3)', textTransform:'uppercase',
    letterSpacing:'.1em', fontFamily:'DM Mono,monospace', marginBottom:'6px', display:'block',
  }

  return (
    <div>
      {/* Filtro portfolio + tabs */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'22px', flexWrap:'wrap', alignItems:'center' }}>
        <select
          value={selectedPortfolio}
          onChange={e => setSelectedPortfolio(e.target.value)}
          className="field-input"
          style={{ width:'auto', minWidth:'200px' }}
        >
          <option value="all">Tutti i portfolio</option>
          {portfolios.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <div style={{ display:'flex', gap:'2px', borderBottom:'1px solid var(--sf-border)', flex:1 }}>
          {(['overview','tracks','links','realtime'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding:'8px 16px', fontSize:'13.5px', background:'none', border:'none',
                borderBottom: activeTab === tab ? '2px solid var(--sf-gold)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--sf-gold2)' : 'var(--sf-text3)',
                cursor:'pointer', fontFamily:'var(--sf-sans)', whiteSpace:'nowrap', transition:'all .15s' }}>
              {tab === 'overview' ? 'Panoramica' : tab === 'tracks' ? 'Tracce' : tab === 'links' ? 'Link Tracciabili' : 'In tempo reale'}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'22px' }}>
            {[
              { label:'Visualizzazioni uniche', val: uniqueViews,       sub:'sessioni distinte' },
              { label:'Visualizzazioni totali', val: views.length,      sub:'ultimi 30 giorni' },
              { label:'Ascolti totali',          val: plays.length,      sub:'tracce avviate' },
              { label:'Completamenti',            val: completes.length,  sub:`% media: ${avgCompletionPct}%` },
              { label:'Clic contatto',            val: contacts.length,   sub:'form contatto aperto' },
            ].map(k => (
              <div key={k.label} style={{ ...cardS }}>
                <span style={labelS}>{k.label}</span>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'36px', color:'var(--sf-gold2)', fontWeight:300, lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'11px', color:'var(--sf-text3)', marginTop:'5px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Grafico 14 giorni */}
          <div style={{ ...cardS, marginBottom:'16px' }}>
            <span style={labelS}>Andamento ultimi 14 giorni</span>
            <div style={{ display:'flex', gap:'4px', alignItems:'flex-end', height:'100px', marginBottom:'8px' }}>
              {chartData.map((d, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:'2px', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:'1px', alignItems:'flex-end', height:'80px', width:'100%' }}>
                    <div title={`${d.views} views`} style={{ flex:1, background:'var(--sf-gold)', opacity:.7, borderRadius:'2px 2px 0 0',
                      height:`${Math.round((d.views / maxVal) * 80)}px`, minHeight: d.views > 0 ? '3px' : '0', transition:'height .3s' }} />
                    <div title={`${d.plays} plays`} style={{ flex:1, background:'var(--sf-green, #4bb87a)', opacity:.7, borderRadius:'2px 2px 0 0',
                      height:`${Math.round((d.plays / maxVal) * 80)}px`, minHeight: d.plays > 0 ? '3px' : '0', transition:'height .3s' }} />
                  </div>
                  {i % 2 === 0 && <div style={{ fontSize:'9px', color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', whiteSpace:'nowrap' }}>{d.date}</div>}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'16px', fontSize:'11px', color:'var(--sf-text3)' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'var(--sf-gold)', opacity:.7, display:'inline-block' }} />
                Views
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#4bb87a', opacity:.7, display:'inline-block' }} />
                Ascolti
              </span>
            </div>
          </div>

          {/* Paesi + Browser */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'14px' }}>
            <div style={cardS}>
              <span style={labelS}>Paese visitatori</span>
              {countries.length === 0 && <div style={{ fontSize:'13px', color:'var(--sf-text3)' }}>Nessun dato ancora.</div>}
              {countries.map(([country, count]) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px' }}>
                  <span style={{ fontSize:'13px', minWidth:'28px' }}>{country}</span>
                  <div style={{ flex:1, height:'6px', background:'var(--sf-border)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.round((count / views.length) * 100)}%`, background:'var(--sf-gold)', borderRadius:'3px' }} />
                  </div>
                  <span style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', color:'var(--sf-text3)', minWidth:'24px', textAlign:'right' }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={cardS}>
              <span style={labelS}>Browser / Sistema operativo</span>
              {browsers.length === 0 && <div style={{ fontSize:'13px', color:'var(--sf-text3)' }}>Nessun dato ancora.</div>}
              {browsers.map(([browser, count]) => (
                <div key={browser} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px' }}>
                  <span style={{ fontSize:'12px', flex:1, color:'var(--sf-text2)' }}>{browser}</span>
                  <div style={{ width:'80px', height:'6px', background:'var(--sf-border)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.round((count / views.length) * 100)}%`, background:'var(--sf-gold)', opacity:.8, borderRadius:'3px' }} />
                  </div>
                  <span style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', color:'var(--sf-text3)', minWidth:'24px', textAlign:'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: TRACCE ── */}
      {activeTab === 'tracks' && (
        <div style={cardS}>
          <span style={labelS}>Performance tracce audio — per ascolti totali</span>
          {filteredTrackStats.length === 0 ? (
            <div style={{ fontSize:'13px', color:'var(--sf-text3)', padding:'20px 0' }}>Nessun ascolto registrato ancora. Le statistiche appariranno dopo i primi ascolti sulla landing page pubblica.</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--sf-border)' }}>
                  {['Traccia','Genere','Ascolti','Completamenti','% ascolto medio','Portfolio'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:'10px', color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', fontWeight:400, letterSpacing:'.07em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrackStats.map(t => {
                  const pf = portfolios.find(p => p.id === t.portfolio_id)
                  const listenPct = t.avg_listen_pct ?? 0
                  return (
                    <tr key={t.track_id} style={{ borderBottom:'1px solid var(--sf-border)' }}>
                      <td style={{ padding:'10px', color:'var(--sf-text)', fontWeight:500 }}>{t.title}</td>
                      <td style={{ padding:'10px', color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', fontSize:'11px' }}>{t.genre || '—'}</td>
                      <td style={{ padding:'10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontFamily:'DM Mono,monospace', fontWeight:500, color:'var(--sf-gold2)' }}>{t.total_plays}</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px', color:'var(--sf-text2)' }}>{t.completions}</td>
                      <td style={{ padding:'10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <div style={{ width:'60px', height:'5px', background:'var(--sf-border)', borderRadius:'2px', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${listenPct}%`, background: listenPct > 70 ? '#4bb87a' : listenPct > 40 ? 'var(--sf-gold)' : '#c94b4b', borderRadius:'2px' }} />
                          </div>
                          <span style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', color:'var(--sf-text3)' }}>{listenPct}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px', fontSize:'11px', color:'var(--sf-text3)' }}>{pf?.title || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: LINK TRACCIABILI ── */}
      {activeTab === 'links' && (
        <div>
          {/* Crea nuovo link */}
          <div style={{ ...cardS, marginBottom:'16px' }}>
            <span style={labelS}>Crea link tracciabile</span>
            <p style={{ fontSize:'13px', color:'var(--sf-text3)', marginBottom:'14px', lineHeight:1.6 }}>
              Genera link univoci per ogni invio — saprai esattamente chi ha aperto il tuo portfolio e quando.
              Es. "inviato a Marco Rossi", "Festival di Venezia 2026".
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px', marginBottom:'12px' }}>
              <div>
                <label style={labelS}>Portfolio</label>
                <select className="field-input" value={newLinkPortfolio} onChange={e => setNewLinkPortfolio(e.target.value)}>
                  {portfolios.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label style={labelS}>Etichetta interna</label>
                <input className="field-input" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="es. Marco Rossi — RAI Cinema" />
              </div>
              <div>
                <label style={labelS}>Alias URL (opzionale)</label>
                <input className="field-input font-mono text-xs" value={newLinkAlias} onChange={e => setNewLinkAlias(e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''))} placeholder="es. marco-rossi" />
              </div>
            </div>
            <button onClick={createShareLink} disabled={creatingLink || !newLinkPortfolio} className="btn btn-gold btn-sm disabled:opacity-50">
              {creatingLink ? 'Creo…' : '+ Crea link tracciabile'}
            </button>
          </div>

          {/* Lista link */}
          <div style={cardS}>
            <span style={labelS}>Link attivi ({links.length})</span>
            {links.length === 0 ? (
              <div style={{ fontSize:'13px', color:'var(--sf-text3)', padding:'16px 0' }}>Nessun link ancora. Creane uno per iniziare a tracciare i tuoi invii.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {links.map(l => {
                  const pf  = portfolios.find(p => p.id === l.portfolio_id)
                  const url = `${APP_URL}/${pf?.slug || ''}?ref=${l.alias}`
                  return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'var(--sf-bg3)', border:'1px solid var(--sf-border)', borderRadius:'10px', flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:'200px' }}>
                        <div style={{ fontSize:'13px', fontWeight:500, color:'var(--sf-text)' }}>{l.label || l.alias}</div>
                        <div style={{ fontSize:'10.5px', fontFamily:'DM Mono,monospace', color:'var(--sf-gold)', marginTop:'2px' }}>{url}</div>
                        <div style={{ fontSize:'10.5px', color:'var(--sf-text3)', marginTop:'2px' }}>
                          {pf?.title || '—'} · creato {l.created_at.slice(0,10)}
                          {l.last_viewed_at && ` · ultima apertura ${l.last_viewed_at.slice(0,10)}`}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'16px', fontSize:'12px', fontFamily:'DM Mono,monospace' }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'20px', color:'var(--sf-gold2)', fontFamily:"'Cormorant Garamond',serif", fontWeight:300 }}>{l.view_count}</div>
                          <div style={{ color:'var(--sf-text3)', fontSize:'9px' }}>VIEW</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'20px', color:'var(--sf-gold2)', fontFamily:"'Cormorant Garamond',serif", fontWeight:300 }}>{l.play_count}</div>
                          <div style={{ color:'var(--sf-text3)', fontSize:'9px' }}>PLAY</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        <button onClick={() => copyLink(l.alias)} className="btn btn-outline btn-sm">Copia</button>
                        <button onClick={() => deleteLink(l.id)} className="btn btn-ghost btn-sm" style={{ color:'var(--sf-text3)' }}>🗑</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: IN TEMPO REALE ── */}
      {activeTab === 'realtime' && (
        <div style={cardS}>
          <span style={labelS}>Ultimi eventi ricevuti</span>
          <p style={{ fontSize:'13px', color:'var(--sf-text3)', marginBottom:'14px' }}>
            Gli eventi più recenti dalle landing page. Aggiorna la pagina per i dati più recenti.
          </p>
          {filteredEvents.length === 0 ? (
            <div style={{ fontSize:'13px', color:'var(--sf-text3)', padding:'16px 0' }}>Nessun evento ancora. Apri una landing page pubblica per generare dati.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {filteredEvents.slice(0, 40).map((e, i) => {
                const pf    = portfolios.find(p => p.id === e.portfolio_id)
                const track = tracks.find(t => t.id === e.track_id)
                const icons: Record<string, string> = { view:'👁', play:'▶', pause:'⏸', complete:'✓', seek:'⟳', contact_click:'✉', embed_view:'□' }
                const colors: Record<string, string> = { view:'var(--sf-text3)', play:'var(--sf-gold)', pause:'var(--sf-text3)', complete:'#4bb87a', contact_click:'#4b8bc9' }
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'7px 10px', background:'var(--sf-bg3)', border:'1px solid var(--sf-border)', borderRadius:'8px', fontSize:'12px' }}>
                    <span style={{ fontSize:'14px', flexShrink:0 }}>{icons[e.event_type] || '·'}</span>
                    <span style={{ fontFamily:'DM Mono,monospace', color: colors[e.event_type] || 'var(--sf-text3)', fontSize:'11px', flexShrink:0, minWidth:'70px' }}>{e.event_type}</span>
                    <span style={{ color:'var(--sf-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {track ? `♪ ${track.title}` : pf?.title || '—'}
                      {e.duration_pct != null && ` · ${e.duration_pct}%`}
                    </span>
                    <span style={{ color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', fontSize:'10px', flexShrink:0 }}>{e.country || '—'}</span>
                    <span style={{ color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', fontSize:'10px', flexShrink:0 }}>{e.user_agent_short || '—'}</span>
                    <span style={{ color:'var(--sf-text3)', fontFamily:'DM Mono,monospace', fontSize:'10px', flexShrink:0 }}>{new Date(e.created_at).toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' })}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
