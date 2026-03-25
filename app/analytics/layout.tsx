import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('name, public_email').eq('id', user.id).maybeSingle()
  const p = profile as { name: string; public_email: string } | null
  return (
    <AdminShell userName={p?.name || user.email?.split('@')[0] || 'Artista'} userEmail={p?.public_email || user.email || ''}>
      {children}
    </AdminShell>
  )
}
