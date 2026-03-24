import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Copy, Code } from 'lucide-react'
import LandingPage from '@/components/landing/LandingPage'
import type { PortfolioWithContent, Project, Track, Profile } from '@/lib/supabase/types'
import EmbedCopyButton from '@/components/admin/EmbedCopyButton'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*, projects(*), tracks(*)')
    .eq('id', id)
    .eq('owner_id', user!.id)
    .single()

  if (!portfolio) notFound()

  const pf = portfolio as unknown as PortfolioWithContent
  pf.projects = ((pf.projects ?? []) as Project[]).sort((a, b) => a.sort_order - b.sort_order)
  pf.tracks   = ((pf.tracks   ?? []) as Track[]).sort((a, b) => a.sort_order - b.sort_order)

  const { data: profileData } = await supabase
    .from('profiles')
    .select('name, public_email, website, short_bio, avatar_url')
    .eq('id', user!.id)
    .maybeSingle()

  const profile = (profileData ?? { name: '', public_email: '', website: '', short_bio: '', avatar_url: null }) as Pick<Profile, 'name' | 'public_email' | 'website' | 'short_bio' | 'avatar_url'>

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || ''
  const publicUrl = `${appUrl}/${pf.slug}`
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="700" frameborder="0" allow="autoplay" style="border-radius:12px;overflow:hidden;"></iframe>`

  return (
    <div className="p-4 lg:p-6">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/portfolios/${id}/edit`} className="btn btn-ghost btn-sm">
          <ChevronLeft size={14} /> Modifica
        </Link>
        <div className="flex-1 bg-[#17171f] border border-[#2a2830] rounded-lg px-3 py-1.5 font-mono text-xs text-[#5a5548] truncate">
          {publicUrl}
        </div>
        <span className={`text-[9.5px] font-mono px-2.5 py-1 rounded border ${
          pf.status === 'published' ? 'badge-published' : pf.status === 'private' ? 'badge-private' : 'badge-draft'
        }`}>
          {pf.status}
        </span>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm hidden sm:flex">
          Apri ↗
        </a>
      </div>

      {/* Sezione Embed — solo nel backend */}
      <div className="card card-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Code size={15} className="text-[#c8a45a]" />
          <span className="text-sm font-medium">Codice Embed</span>
          <span className="text-xs text-[#5a5548] font-mono ml-1">per Systeme.io, WordPress e qualsiasi sito</span>
        </div>
        <div className="bg-[#09090f] border border-[#2a2830] rounded-lg px-4 py-3 mb-3 overflow-x-auto">
          <pre className="font-mono text-[11px] text-[#5a5548] whitespace-pre-wrap break-all">{embedCode}</pre>
        </div>
        <div className="flex gap-2 items-center">
          <EmbedCopyButton embedCode={embedCode} />
          <span className="text-xs text-[#5a5548]">💡 Su Systeme.io: aggiungi un blocco <strong className="text-[#a09888]">HTML</strong> e incolla il codice</span>
        </div>
      </div>

      {/* Frame browser simulato */}
      <div className="border border-[#2a2830] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111118] border-b border-[#2a2830]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 mx-3 bg-[#09090f] border border-[#2a2830] rounded px-3 py-0.5 text-[10.5px] text-[#5a5548] font-mono truncate">
            {publicUrl}
          </div>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">
          <LandingPage portfolio={pf} profile={profile} preview />
        </div>
      </div>

    </div>
  )
}
