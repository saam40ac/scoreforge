import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PortfolioEditor from '@/components/admin/PortfolioEditor'
import type { PortfolioWithContent, Project, Track } from '@/lib/supabase/types'

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Carica ENTRAMBE le bio dal profilo
  const { data: profile } = await supabase
    .from('profiles')
    .select('short_bio, long_bio')
    .eq('id', user!.id)
    .single()

  const p = profile as { short_bio?: string; long_bio?: string } | null

  return (
    <div className="p-6 lg:p-8">
      <PortfolioEditor
        portfolio={pf}
        userId={user!.id}
        profileBio={p?.short_bio || ''}
        profileShortBio={p?.short_bio || ''}
        profileLongBio={p?.long_bio  || ''}
      />
    </div>
  )
}
