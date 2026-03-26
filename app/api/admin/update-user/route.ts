import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: caller } = await supabaseAuth
    .from('profiles').select('role').eq('id', user.id).single()
  if (!caller || caller.role !== 'super_admin') {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  const { userId, updates } = await req.json()
  if (!userId || !updates) {
    return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminClient
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
