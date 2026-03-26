import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const secret    = process.env.SYSTEME_WEBHOOK_SECRET
  const sigHeader = req.headers.get('x-systeme-signature') || req.headers.get('x-webhook-signature')

  if (secret && sigHeader) {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (sigHeader !== expected && `sha256=${expected}` !== sigHeader) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: any
  try { payload = JSON.parse(body) } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const contactEmail = payload.contact?.email || payload.email || payload.customer?.email
  if (!contactEmail) return NextResponse.json({ ok: true, note: 'no_email' })

  const productName = (payload.product?.name || payload.order?.product_name || '').toLowerCase()
  let plan = 'pro'
  if (productName.includes('studio'))     plan = 'studio'
  if (productName.includes('enterprise')) plan = 'enterprise'

  const isAnnual  = productName.includes('annual') || productName.includes('annuale')
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + (isAnnual ? 12 : 1))

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUsers } = await adminClient.auth.admin.listUsers()
  const authUser = authUsers?.users?.find((u: any) => u.email === contactEmail)
  if (!authUser) return NextResponse.json({ ok: true, note: 'user_not_found' })

  await adminClient.from('profiles').update({
    plan, plan_expires_at: expiresAt.toISOString(), status: 'active'
  }).eq('id', authUser.id)

  await adminClient.from('admin_audit_log').insert({
    admin_id: authUser.id,
    action: 'plan.activated_via_webhook',
    target_type: 'user', target_id: authUser.id,
    details: { plan, expires_at: expiresAt.toISOString() },
  })

  return NextResponse.json({ ok: true, plan, email: contactEmail })
}
