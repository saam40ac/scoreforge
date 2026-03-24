'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function DeletePortfolioButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    const { error } = await supabase.from('portfolios').delete().eq('id', id)
    if (error) {
      toast.error('Errore durante l\'eliminazione.')
    } else {
      toast.success('Portfolio eliminato.')
      router.refresh()
    }
    setConfirm(false)
  }

  if (confirm) {
    return (
      <div className="flex gap-1">
        <button onClick={() => setConfirm(false)} className="btn btn-ghost btn-sm px-2 text-xs">No</button>
        <button onClick={handleDelete} className="btn btn-danger btn-sm px-2 text-xs">Sì, elimina</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="btn btn-ghost btn-sm btn-icon"
      title={`Elimina "${title}"`}
    >
      <Trash2 size={13} />
    </button>
  )
}
