import { createClient } from '@/lib/supabase/server'
import AdminUsersClient from '@/components/superadmin/AdminUsersClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, public_email, professional_title, city, role, status, plan, plan_expires_at, notes, created_at, avatar_url')
    .order('created_at', { ascending: false })

  const { data: portfoliosByUser } = await supabase
    .from('portfolios')
    .select('owner_id, status')

  // Conta portfolio per utente
  const portfolioCounts: Record<string, number> = {}
  portfoliosByUser?.forEach(p => {
    portfolioCounts[p.owner_id] = (portfolioCounts[p.owner_id] || 0) + 1
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 300, color: '#f0ebe0', marginBottom: '4px' }}>
          Gestione Utenti
        </h1>
        <p style={{ fontSize: '12px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
          {users?.length || 0} utenti registrati
        </p>
      </div>
      <AdminUsersClient users={users || []} portfolioCounts={portfolioCounts} />
    </div>
  )
}
