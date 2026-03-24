import PortfolioEditor from '@/components/admin/PortfolioEditor'
import { createClient } from '@/lib/supabase/server'

export default async function NewPortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('short_bio, long_bio')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 lg:p-8">
      <PortfolioEditor
        portfolio={null}
        userId={user!.id}
        profileBio={[profile?.short_bio, profile?.long_bio].filter(Boolean).join('\n\n')}
      />
    </div>
  )
}
