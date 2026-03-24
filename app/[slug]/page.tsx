import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'
import type { PortfolioWithContent, Portfolio, Project, Track } from '@/lib/supabase/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('portfolios')
    .select('title, description, noindex')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!data) return { title: 'Portfolio non trovato' }

  const title       = (data as unknown as Portfolio).title
  const description = (data as unknown as Portfolio).description
  const noindex     = (data as unknown as Portfolio).noindex

  return {
    title: `${title} — ScoreForge`,
    description: description ?? undefined,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description: description ?? undefined,
      type: 'website',
    },
  }
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('portfolios')
    .select('*, projects(*), tracks(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!data) notFound()

  const portfolio = data as unknown as PortfolioWithContent

  // Incrementa view count (fire and forget)
  supabase
    .from('portfolios')
    .update({ view_count: (portfolio.view_count ?? 0) + 1 })
    .eq('id', portfolio.id)
    .then(() => {})

  // Ordina per sort_order
  portfolio.projects = ((portfolio.projects ?? []) as Project[]).sort(
    (a, b) => a.sort_order - b.sort_order
  )
  portfolio.tracks = ((portfolio.tracks ?? []) as Track[]).sort(
    (a, b) => a.sort_order - b.sort_order
  )

  return <LandingPage portfolio={portfolio} />
}
