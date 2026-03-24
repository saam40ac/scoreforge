import { createClient } from '@/lib/supabase/server'
import BioForm from '@/components/admin/BioForm'

export default async function BioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light">Biografia</h1>
        <p className="text-sm text-[#5a5548] mt-1">Il tuo profilo artistico — visibile nelle landing page</p>
      </div>
      <div className="max-w-2xl">
        <BioForm profile={profile} userId={user!.id} />
      </div>
    </div>
  )
}
