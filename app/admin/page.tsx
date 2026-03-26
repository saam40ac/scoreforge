import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, FileText, BarChart2, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function SuperAdminOverview() {
  const supabase = await createClient()

  // KPI principali in parallelo
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: suspendedUsers },
    { count: totalPortfolios },
    { count: publishedPortfolios },
    { count: totalTracks },
    { data: planCounts },
    { data: recentEvents },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('portfolios').select('*', { count: 'exact', head: true }),
    supabase.from('portfolios').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('tracks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('plan').then(async ({ data }) => {
      const counts: Record<string, number> = {}
      data?.forEach(p => { counts[p.plan || 'free'] = (counts[p.plan || 'free'] || 0) + 1 })
      return { data: counts }
    }),
    supabase.from('analytics_events').select('event_type, created_at, portfolio_id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('profiles').select('id, name, public_email, plan, status, created_at')
      .order('created_at', { ascending: false }).limit(8),
  ])

  const views24h  = recentEvents?.filter(e => e.event_type === 'view').length  || 0
  const plays24h  = recentEvents?.filter(e => e.event_type === 'play').length  || 0

  const kpi = [
    { label: 'Utenti totali',        value: totalUsers     || 0, sub: `${suspendedUsers || 0} sospesi`,  icon: Users,      href: '/admin/users',     color: '#378add' },
    { label: 'Portfolio pubblicati', value: publishedPortfolios || 0, sub: `di ${totalPortfolios || 0} totali`, icon: FileText, href: '/admin/content', color: '#1d9e75' },
    { label: 'Views ultime 24h',     value: views24h,           sub: `${plays24h} ascolti`,              icon: BarChart2,  href: '/admin/analytics', color: '#7f77dd' },
    { label: 'Tracce totali',        value: totalTracks    || 0, sub: 'su tutta la piattaforma',         icon: TrendingUp, href: '/admin/analytics', color: '#c8a45a' },
  ]

  const plans = planCounts as Record<string,number> || {}

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 300, color: '#f0ebe0', marginBottom: '4px' }}>
          Super Admin
        </h1>
        <p style={{ fontSize: '13px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
          Supervisione globale · {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {kpi.map(k => (
          <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '18px 20px', transition: 'border-color .15s', cursor: 'pointer' }}
              onMouseEnter={(e: any) => e.currentTarget.style.borderColor = k.color + '60'}
              onMouseLeave={(e: any) => e.currentTarget.style.borderColor = '#1e1e2e'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <k.icon size={15} color={k.color} />
                <span style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em' }}>{k.label}</span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: '#5a5548', marginTop: '6px' }}>{k.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Piani + Ultimi utenti */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '20px' }}>

        {/* Distribuzione piani */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>
            Distribuzione piani
          </div>
          {[
            { name: 'free',       label: 'Free',       color: '#5a5548' },
            { name: 'pro',        label: 'Pro',         color: '#c8a45a' },
            { name: 'studio',     label: 'Studio',      color: '#e2c47e' },
            { name: 'enterprise', label: 'Enterprise',  color: '#f5e4b8' },
          ].map(p => {
            const count = plans[p.name] || 0
            const pct   = totalUsers ? Math.round((count / (totalUsers || 1)) * 100) : 0
            return (
              <div key={p.name} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: p.color }}>{p.label}</span>
                  <span style={{ color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '4px', background: '#1e1e2e', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: '2px', transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Ultimi utenti registrati */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Ultimi utenti registrati
            </div>
            <Link href="/admin/users" style={{ fontSize: '11px', color: '#c8a45a', textDecoration: 'none' }}>Vedi tutti →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <tbody>
              {(recentUsers || []).map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1a1a28' }}>
                  <td style={{ padding: '8px 0', color: '#f0ebe0' }}>{u.name || '—'}</td>
                  <td style={{ padding: '8px', color: '#5a5548', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{u.public_email || '—'}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontFamily: 'DM Mono, monospace',
                      background: u.plan === 'pro' ? '#c8a45a18' : u.plan === 'studio' ? '#e2c47e18' : '#5a554818',
                      color:      u.plan === 'pro' ? '#c8a45a'   : u.plan === 'studio' ? '#e2c47e'   : '#5a5548',
                      border: `1px solid ${u.plan === 'pro' ? '#c8a45a44' : u.plan === 'studio' ? '#e2c47e44' : '#5a554844'}`,
                    }}>{u.plan || 'free'}</span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    {u.status === 'suspended'
                      ? <AlertTriangle size={13} color="#c94b4b" />
                      : <CheckCircle size={13} color="#4bb87a" />
                    }
                  </td>
                  <td style={{ padding: '8px', color: '#5a5548', fontSize: '11px', fontFamily: 'DM Mono, monospace' }}>
                    {new Date(u.created_at).toLocaleDateString('it-IT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '14px' }}>
          Azioni rapide
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/users?action=new',    label: '+ Nuovo utente',      color: '#c8a45a' },
            { href: '/admin/content?filter=flagged', label: '⚑ Contenuti segnalati', color: '#c94b4b' },
            { href: '/admin/plans',               label: '✎ Gestisci piani',    color: '#7f77dd' },
            { href: '/admin/analytics',           label: '↗ Analytics globali', color: '#1d9e75' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{
              padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
              textDecoration: 'none', color: a.color,
              background: a.color + '12', border: `1px solid ${a.color}30`,
              transition: 'all .15s',
            }}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
