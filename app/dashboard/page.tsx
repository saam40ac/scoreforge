import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Eye, Music, FileText } from 'lucide-react'
import { portfolioUrl } from '@/lib/utils/url'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*, tracks(*)')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user!.id)
    .single()

  const published   = portfolios?.filter(p => p.status === 'published').length ?? 0
  const totalViews  = portfolios?.reduce((a, p) => a + p.view_count, 0) ?? 0
  const totalTracks = portfolios?.reduce((a, p) => a + (p.tracks?.length ?? 0), 0) ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  const firstName = profile?.name?.split(' ')[0] || 'Andrea'

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">
            {greeting}, <span className="text-[#e2c47e]">{firstName}</span>
          </h1>
          <p className="text-sm text-[#5a5548] mt-1">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/portfolios/new" className="btn btn-gold">
          <Plus size={15} /> Nuovo Portfolio
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Portfolio totali', value: portfolios?.length ?? 0,   icon: FileText, sub: `${published} pubblicati` },
          { label: 'Visualizzazioni',  value: totalViews,                icon: Eye,       sub: 'landing page pubbliche' },
          { label: 'Tracce audio',     value: totalTracks,               icon: Music,     sub: 'in tutti i portfolio' },
          { label: 'Pubblicati',       value: published,                  icon: Eye,       sub: 'accessibili online' },
        ].map(k => (
          <div key={k.label} className="card card-sm">
            <k.icon size={16} className="text-[#c8a45a] mb-3 opacity-70" />
            <div className="font-serif text-4xl text-[#e2c47e] font-light leading-none">{k.value}</div>
            <div className="text-[10px] text-[#5a5548] uppercase tracking-[0.1em] font-mono mt-2">{k.label}</div>
            <div className="text-xs text-[#5a5548] mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Portfolio recenti */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-light">Portfolio recenti</h2>
        <Link href="/portfolios" className="text-xs text-[#5a5548] hover:text-[#c8a45a] transition-colors">
          Vedi tutti →
        </Link>
      </div>

      {!portfolios?.length ? (
        <div className="card text-center py-16">
          <FileText size={40} className="mx-auto mb-4 text-[#5a5548]" />
          <p className="font-serif text-xl text-[#a09888] mb-2">Nessun portfolio ancora</p>
          <p className="text-sm text-[#5a5548] mb-6">Crea il tuo primo portfolio artistico per iniziare</p>
          <Link href="/portfolios/new" className="btn btn-gold">
            <Plus size={14} /> Crea il primo portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.slice(0, 3).map(p => (
            <div key={p.id} className="card card-sm group hover:border-[#c8a45a]/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-serif text-xl font-semibold text-[#09090f]"
                  style={{ background: p.accent_color || '#c8a45a' }}
                >
                  {p.title.charAt(0)}
                </div>
                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded border ${
                  p.status === 'published' ? 'badge-published' : p.status === 'private' ? 'badge-private' : 'badge-draft'
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="font-medium text-[13.5px] mb-1 truncate">{p.title}</div>
              <div className="text-[11px] text-[#5a5548] font-mono mb-4">
                {p.view_count} views · {p.tracks?.length ?? 0} tracce
              </div>
              <div className="flex gap-2">
                <Link href={`/portfolios/${p.id}/edit`} className="btn btn-gold btn-sm flex-1 justify-center">Modifica</Link>
                <Link href={`/portfolios/${p.id}/preview`} className="btn btn-outline btn-sm">Preview</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link pubblici */}
      {(portfolios?.filter(p => p.status === 'published').length ?? 0) > 0 && (
        <>
          <h2 className="font-serif text-xl font-light mt-8 mb-4">Link pubblici attivi</h2>
          <div className="card">
            <div className="space-y-3">
              {portfolios?.filter(p => p.status === 'published').map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-[#17171f] border border-[#2a2830] rounded-lg px-4 py-2.5">
                  <span className="flex-1 font-mono text-xs text-[#c8a45a] truncate">
                    {portfolioUrl(p.slug)}
                  </span>
                  <Link href={`/portfolios/${p.id}/preview`} className="btn btn-outline btn-sm">Anteprima</Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
