'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Credenziali non valide. Riprova.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090f] relative overflow-hidden">
      {/* Bagliore di sfondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[#c8a45a]/[0.04]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/[0.03]" />
      </div>

      <div className="w-full max-w-sm px-5 animate-fadein relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c8a45a] to-[#e2c47e] flex items-center justify-center font-serif text-xl font-semibold text-[#09090f]">
              S
            </div>
            <span className="font-serif text-4xl text-[#e2c47e] font-light">ScoreForge</span>
          </div>
          <p className="text-[10px] text-[#5a5548] tracking-[0.2em] uppercase font-mono">
            Composer Portfolio Platform
          </p>
        </div>

        {/* Card login */}
        <div className="card">
          <h1 className="font-serif text-2xl font-light text-center mb-1">Accedi</h1>
          <p className="text-xs text-[#5a5548] text-center mb-7">Area riservata — inserisci le credenziali</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="field-input"
                placeholder="artista@esempio.it"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold w-full justify-center mt-2 disabled:opacity-60"
            >
              {loading ? 'Accesso in corso…' : 'Entra nella piattaforma'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#2a2830] text-center">
            <a
              href="#"
              className="text-xs text-[#5a5548] hover:text-[#c8a45a] transition-colors"
              onClick={e => {
                e.preventDefault()
                toast.info('Controlla la tua email per il link di reset.')
              }}
            >
              Password dimenticata?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
