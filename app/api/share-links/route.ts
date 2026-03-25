import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase   = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const portfolioId = req.nextUrl.searchParams.get('portfolioId')
  const query = supabase.from('share_links').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
  if (portfolioId) query.eq('portfolio_id', portfolioId)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { portfolio_id, label, alias } = await req.json()
  const finalAlias = alias?.trim() || `link-${Date.now().toString(36)}`

  const { data, error } = await supabase.from('share_links').insert({
    portfolio_id, owner_id: user.id,
    alias: finalAlias, label,
    active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  await supabase.from('share_links').delete().eq('id', id!).eq('owner_id', user.id)
  return NextResponse.json({ ok: true })
}
