import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import LandingPage from '@/components/landing/LandingPage'

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

  portfolio.projects = portfolio.projects?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []
  portfolio.tracks   = portfolio.tracks?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${portfolio.slug}`

  return (
    <div className="p-4 lg:p-6">
      {/* Topbar preview */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/portfolios/${id}/edit`} className="btn btn-ghost btn-sm">
          <ChevronLeft size={14} /> Modifica
        </Link>
        <div className="flex-1 bg-[#17171f] border border-[#2a2830] rounded-lg px-3 py-1.5 font-mono text-xs text-[#5a5548] truncate">
          {publicUrl}
        </div>
        <span className={`text-[9.5px] font-mono px-2.5 py-1 rounded border ${
          portfolio.status === 'published' ? 'badge-published' : portfolio.status === 'private' ? 'badge-private' : 'badge-draft'
        }`}>
          {portfolio.status}
        </span>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          <ExternalLink size={13} /> Apri
        </a>
      </div>

      {/* Frame preview */}
      <div className="border border-[#2a2830] rounded-2xl overflow-hidden">
        {/* Barra browser simulata */}
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

        {/* Landing page renderizzata */}
        <div className="overflow-y-auto max-h-[75vh]">
          <LandingPage portfolio={portfolio} preview />
        </div>
      </div>
    </div>
  )
}
