import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavbar from '@/components/superadmin/AdminNavbar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, public_email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') redirect('/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07070d', fontFamily: "'Outfit', sans-serif" }}>
      <AdminNavbar userName={profile.name || user.email || ''} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
