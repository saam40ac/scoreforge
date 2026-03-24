import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('profiles')
    .select('name, public_email')
    .eq('id', user.id)
    .maybeSingle()

  const profile = data as { name: string; public_email: string } | null

  return (
    <AdminShell
      userName={profile?.name || user.email?.split('@')[0] || 'Artista'}
      userEmail={profile?.public_email || user.email || ''}
    >
      {children}
    </AdminShell>
  )
}
