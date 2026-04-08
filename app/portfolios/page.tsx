import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Eye, Trash2, FolderOpen, Share2 } from 'lucide-react'
import DeletePortfolioButton from '@/components/admin/DeletePortfolioButton'

// Bug 32: Pulsante copia link condivisione (client component)
import CopyLinkButton from '@/components/admin/CopyLinkButton'

export default async function PortfoliosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*, projects(id), tracks(id)')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Portfolio</h1>
          <p className="text-sm text-[#5a5548] mt-1">{portfolios?.length ?? 0} portfolio totali</p>
        </div>
        <Link href="/portfolios/new" className="btn btn-gold">
          <Plus size={15} /> Nuovo Portfolio
        </Link>
      </div>

      {!portfolios?.length ? (
        <div className="card text-center py-20">
          <FolderOpen size={44} className="mx-auto mb-4 text-[#5a5548]" />
          <p className="font-serif text-2xl text-[#a09888] mb-2">Nessun portfolio</p>
          <p className="text-sm text-[#5a5548] mb-6">Crea il tuo primo portfolio per iniziare a presentarti</p>
          <Link href="/portfolios/new" className="btn btn-gold btn-lg">
            <Plus size={16} /> Crea il primo portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {portfolios.map(p => (
            <div key={p.id} className="card card-sm flex flex-col hover:border-[#c8a45a]/40 transition-colors group">
              {/* Cover colorata */}
              <div
                className="h-28 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${p.accent_color}18, ${p.accent_color}40)` }}
              >
                <span className="font-serif text-6xl font-semibold opacity-20" style={{ color: p.accent_color }}>
                  {p.title.charAt(0)}
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090f]/60" />
                <span className={`absolute top-2.5 right-2.5 text-[9.5px] font-mono px-2 py-0.5 rounded border ${
                  p.status === 'published' ? 'badge-published' : p.status === 'private' ? 'badge-private' : 'badge-draft'
                }`}>
                  {p.status}
                </span>
                <span className="absolute bottom-2.5 left-3 font-serif text-base text-[#f0ebe0] drop-shadow truncate right-3">
                  {p.title}
                </span>
              </div>

              {/* Meta */}
              <div className="text-[11px] text-[#5a5548] font-mono mb-1">{p.target || '—'}</div>
              <div className="flex gap-3 text-[11px] text-[#5a5548] font-mono mb-4">
                <span>{p.view_count} views</span>
                <span>·</span>
                <span>{(p.tracks as {id:string}[])?.length ?? 0} tracce</span>
                <span>·</span>
                <span>{(p.projects as {id:string}[])?.length ?? 0} progetti</span>
              </div>

              {/* Azioni */}
              <div className="flex gap-2 mt-auto">
                <Link href={`/portfolios/${p.id}/edit`} className="btn btn-gold btn-sm flex-1 justify-center">
                  <Pencil size={12} /> Modifica
                </Link>
                <Link href={`/portfolios/${p.id}/preview`} className="btn btn-outline btn-sm" title="Anteprima">
                  <Eye size={12} />
                </Link>
                {p.status === 'published' && p.slug && (
                  <CopyLinkButton
                    url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoreforge.it'}/${p.slug}`}
                  />
                )}
                <DeletePortfolioButton id={p.id} title={p.title} />
              </div>
            </div>
          ))}

          {/* Card aggiungi */}
          <Link
            href="/portfolios/new"
            className="card card-sm border-dashed flex flex-col items-center justify-center min-h-[220px] gap-3 text-[#5a5548] hover:border-[#c8a45a]/40 hover:text-[#c8a45a] transition-colors cursor-pointer"
          >
            <Plus size={28} className="opacity-40" />
            <span className="text-sm">Nuovo Portfolio</span>
          </Link>
        </div>
      )}
    </div>
  )
}
