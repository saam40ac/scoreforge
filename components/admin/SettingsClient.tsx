'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const PLAN_META: Record<string, { label: string; color: string; desc: string }> = {
  free:       { label: 'Free',       color: '#5a5548', desc: '1 portfolio · 10 tracce · 500 MB' },
  pro:        { label: 'Pro',        color: '#c8a45a', desc: '5 portfolio · 100 tracce · 5 GB' },
  studio:     { label: 'Studio',     color: '#e2c47e', desc: '20 portfolio · 500 tracce · 20 GB' },
  enterprise: { label: 'Enterprise', color: '#f5e4b8', desc: 'Portfolio illimitati · Storage illimitato' },
}

export default function SettingsClient({ email, userId, plan }: { email: string; userId: string; plan: string }) {
  const planInfo = PLAN_META[plan] ?? PLAN_META['free']
  const supabase = createClient()
  const router   = useRouter()
  const [newPass,    setNewPass]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving,     setSaving]     = useState(false)

  async function changePassword() {
    if (newPass !== confirmPass) { toast.error('Le password non coincidono.'); return }
    if (newPass.length < 8)     { toast.error('Minimo 8 caratteri.'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setSaving(false)
    error ? toast.error('Errore cambio password.') : toast.success('Password aggiornata!')
    setNewPass(''); setConfirmPass('')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const Row = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-[#2a2830] last:border-0">
      <div className="flex-1 mr-4">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-[#5a5548] mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="text-sm font-medium mb-1">Account</div>
        <Row label="Email" desc={email}>
          <span className="text-xs font-mono text-[#5a5548]">{email}</span>
        </Row>
        <Row label="Piano attivo" desc={`ScoreForge · ${planInfo.desc}`}>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono"
            style={{ background: planInfo.color + '18', color: planInfo.color, border: `1px solid ${planInfo.color}44` }}>
            {planInfo.label}
          </span>
        </Row>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-4">Cambia password</div>
        <div className="space-y-3">
          <div>
            <label className="field-label">Nuova password</label>
            <input type="password" className="field-input" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimo 8 caratteri" />
          </div>
          <div>
            <label className="field-label">Conferma password</label>
            <input type="password" className="field-input" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Ripeti la password" />
          </div>
          <button onClick={changePassword} disabled={saving || !newPass} className="btn btn-outline btn-sm disabled:opacity-50">
            {saving ? 'Aggiorno…' : 'Aggiorna password'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-1">Sessione</div>
        <div className="py-3.5">
          <p className="text-sm text-[#a09888] mb-3">Disconnetti il tuo account da questo dispositivo.</p>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Disconnetti</button>
        </div>
      </div>

      <div className="card border-[#c94b4b]/20">
        <div className="text-sm font-medium text-[#c94b4b] mb-1">Zona pericolosa</div>
        <div className="py-3.5">
          <p className="text-sm text-[#a09888] mb-3">
            Elimina definitivamente il tuo account e tutti i dati. Questa azione è irreversibile.
          </p>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => toast.error('Contatta il supporto per eliminare l\'account.')}
          >
            Elimina account
          </button>
        </div>
      </div>
    </div>
  )
}
