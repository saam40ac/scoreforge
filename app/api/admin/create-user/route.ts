import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: caller } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
  if (!caller || caller.role !== 'super_admin') return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })

  const { email, name, plan, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email e password richieste' }, { status: 400 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await adminClient.from('profiles').upsert({
    id: newUser.user.id, name, public_email: email, plan: plan || 'free', status: 'active',
  })

  const { data: profile } = await adminClient.from('profiles')
    .select('id, name, public_email, plan, status, role, created_at, avatar_url')
    .eq('id', newUser.user.id).single()

  return NextResponse.json({ user: profile })
}
