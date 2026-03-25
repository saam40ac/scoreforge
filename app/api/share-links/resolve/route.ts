import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Route pubblica: riceve ?alias=xxx e restituisce l'id dello share link
// Usata dalla landing page per tracciare chi arriva da un link specifico
export async function GET(req: NextRequest) {
  const alias = req.nextUrl.searchParams.get('alias')
  if (!alias) return NextResponse.json({ error: 'Missing alias' }, { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase
    .from('share_links')
    .select('id, portfolio_id, active')
    .eq('alias', alias)
    .eq('active', true)
    .maybeSingle()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ id: data.id, portfolio_id: data.portfolio_id })
}
