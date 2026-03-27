import { createClient } from '@/lib/supabase/server'
import AdminContentClient from '@/components/superadmin/AdminContentClient'

export default async function AdminContentPage() {
  const supabase = await createClient()

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id, title, slug, status, theme, owner_id, view_count, created_at, updated_at, noindex')
    .order('updated_at', { ascending: false })

  const { data: ownersRaw } = await supabase
    .from('profiles')
    .select('id, name, public_email, status, plan')
  const owners = (ownersRaw || []) as { id: string; name: string; public_email: string; status: string; plan: string }[]

  const ownerMap = Object.fromEntries(owners.map(o => [o.id, o]))

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#f0ebe0', marginBottom: '4px' }}>
          Gestione Contenuti
        </h1>
        <p style={{ fontSize: '12px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
          {portfolios?.length || 0} portfolio · supervisione e moderazione
        </p>
      </div>
      <AdminContentClient portfolios={portfolios || []} ownerMap={ownerMap} />
    </div>
  )
}
