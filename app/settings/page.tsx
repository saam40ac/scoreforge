import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/admin/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, name')
    .eq('id', user!.id)
    .single()

  const currentPlan = (profile as any)?.plan ?? 'free'

  // Leggi i dettagli del piano dalla tabella (non hardcoded)
  const { data: planData } = await supabase
    .from('subscription_plans')
    .select('label, price_eur, max_portfolios, max_tracks, max_storage_mb')
    .eq('name', currentPlan)
    .single()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Impostazioni</h1>
        <p className="text-sm text-[#5a5548] mt-1">Gestisci il tuo account e le preferenze</p>
      </div>
      <div className="max-w-xl">
        <SettingsClient
          email={user?.email ?? ''}
          userId={user!.id}
          plan={currentPlan}
          planLabel={(planData as any)?.label ?? currentPlan}
          planDesc={planData
            ? `${(planData as any).max_portfolios} portfolio · ${(planData as any).max_tracks} tracce · ${Math.round((planData as any).max_storage_mb / 1024) >= 1 ? Math.round((planData as any).max_storage_mb / 1024) + ' GB' : (planData as any).max_storage_mb + ' MB'} storage`
            : ''}
        />
      </div>
    </div>
  )
}
