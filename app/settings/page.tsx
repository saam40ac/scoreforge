import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/admin/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Impostazioni</h1>
        <p className="text-sm text-[#5a5548] mt-1">Gestisci il tuo account e le preferenze</p>
      </div>
      <div className="max-w-xl">
        <SettingsClient email={user?.email ?? ''} userId={user!.id} />
      </div>
    </div>
  )
}
