import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'
import type { PortfolioWithContent } from '@/lib/supabase/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('portfolios')
    .select('title, description, accent_color, noindex')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Portfolio non trovato' }

  return {
    title: `${data.title} — ScoreForge`,
    description: data.description ?? undefined,
    robots: data.noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: data.title,
      description: data.description ?? undefined,
      type: 'website',
    },
  }
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Carica portfolio pubblico con relazioni
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*, projects(*), tracks(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!portfolio) notFound()

  // Incrementa view count (fire and forget)
  supabase.from('portfolios').update({ view_count: portfolio.view_count + 1 }).eq('id', portfolio.id).then(() => {})

  // Ordina
  portfolio.projects = portfolio.projects?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []
  portfolio.tracks   = portfolio.tracks?.sort((a: {sort_order:number}, b: {sort_order:number}) => a.sort_order - b.sort_order) ?? []

  return <LandingPage portfolio={portfolio as PortfolioWithContent} />
}
