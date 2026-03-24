import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PortfolioEditor from '@/components/admin/PortfolioEditor'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('short_bio, long_bio')
    .eq('id', user!.id)
    .single()

  // Ordina per sort_order
  portfolio.projects = portfolio.projects?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []
  portfolio.tracks   = portfolio.tracks?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []

  return (
    <div className="p-6 lg:p-8">
      <PortfolioEditor
        portfolio={portfolio}
        userId={user!.id}
        profileBio={[profile?.short_bio, profile?.long_bio].filter(Boolean).join('\n\n')}
      />
    </div>
  )
}
