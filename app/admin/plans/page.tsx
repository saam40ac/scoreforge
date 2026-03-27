import { createClient } from '@/lib/supabase/server'
import AdminPlansClient from '@/components/superadmin/AdminPlansClient'

export default async function AdminPlansPage() {
  const supabase = await createClient()

  const [r1, r2] = await Promise.all([
    supabase.from('subscription_plans').select('*').order('sort_order'),
    supabase.from('profiles').select('plan'),
  ])
  const plans = (r1.data || []) as any[]
  const planCountsRaw = (r2.data || []) as { plan: string }[]

  const counts: Record<string,number> = {}
  planCountsRaw.forEach(p => { counts[p.plan || 'free'] = (counts[p.plan || 'free'] || 0) + 1 })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#f0ebe0', marginBottom: '4px' }}>Gestione Piani</h1>
        <p style={{ fontSize: '12px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>Abbonamenti, prezzi e limiti · revenue overview</p>
      </div>
      <AdminPlansClient plans={plans || []} userCounts={counts} />
    </div>
  )
}
