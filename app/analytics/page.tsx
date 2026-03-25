import { createClient } from '@/lib/supabase/server'
import AnalyticsClient from '@/components/admin/AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Portfolios dell'utente
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id, title, slug, status, accent_color')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })

  // Ultimi 30 giorni di eventi aggregati per giorno
  const { data: dailyEvents } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, portfolio_id, track_id, duration_pct, country, user_agent_short, session_id')
    .in('portfolio_id', (portfolios ?? []).map(p => p.id))
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(2000)

  // Statistiche tracce
  const { data: trackStats } = await supabase
    .from('track_stats')
    .select('*')
    .in('portfolio_id', (portfolios ?? []).map(p => p.id))
    .order('total_plays', { ascending: false })
    .limit(50)

  // Share links
  const { data: shareLinks } = await supabase
    .from('share_links')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  // Nomi tracce per join lato client
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title, genre, portfolio_id')
    .in('portfolio_id', (portfolios ?? []).map(p => p.id))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="font-serif text-3xl font-light">Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sf-text3)' }}>
          Ultimi 30 giorni · aggiornato in tempo reale
        </p>
      </div>
      <AnalyticsClient
        portfolios={portfolios ?? []}
        events={dailyEvents ?? []}
        trackStats={trackStats ?? []}
        shareLinks={shareLinks ?? []}
        tracks={tracks ?? []}
        userId={user!.id}
      />
    </div>
  )
}
