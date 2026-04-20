'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const supabase     = createClient()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [ready,    setReady]    = useState(false)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    async function init() {
      const token_hash = searchParams.get('token_hash')
      const type       = searchParams.get('type') as any

      if (token_hash && type) {
        // Nuovo flusso: token nell'URL — scambia subito con verifyOtp
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (error) {
          setError('Il link è scaduto o non è valido. Richiedi un nuovo reset.')
          setReady(false)
        } else {
          setReady(true)
        }
        return
      }

      // Vecchio flusso fallback: aspetta evento PASSWORD_RECOVERY
      const { data } = await supabase.auth.getSession()
      if (data.session) { setReady(true); return }
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') setReady(true)
      })
      return () => subscription.unsubscribe()
    }
    init()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Le password non coincidono.'); return }
    if (password.length < 8)  { setError('Minimo 8 caratteri.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    // Issue 5 fix: vai al login (non alla dashboard)
    setDone(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  const iS: React.CSSProperties = {
    width: '100%', background: '#111118', border: '1px solid #2a2830',
    borderRadius: '8px', padding: '11px 14px', color: '#f0ebe0',
    fontSize: '14px', outline: 'none', fontFamily: "'Outfit', sans-serif",
    transition: 'border-color .2s',
  }

  if (!ready && !error) return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>Verifica del link in corso…</div>
    </div>
  )

  if (!ready && error) return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚠️</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300, color: '#f0ebe0', marginBottom: '12px', textAlign: 'center' }}>Link non valido o scaduto</h2>
      <p style={{ fontSize: '14px', color: '#5a5548', textAlign: 'center', marginBottom: '28px', maxWidth: '360px', lineHeight: 1.7 }}>{error}</p>
      <Link href="/forgot-password" style={{ padding: '12px 28px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
        Richiedi un nuovo link
      </Link>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ fontSize: '40px', marginBottom: '20px' }}>✓</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300, color: '#f0ebe0', marginBottom: '10px' }}>Password aggiornata!</h2>
      <p style={{ fontSize: '13px', color: '#5a5548' }}>Reindirizzamento al login…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/landing.html">
            <svg width="120" height="26" viewBox="0 0 120 26">
              <path d="M17,2 Q24,1.5 24,8 Q24,14 17,14" fill="none" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M11,14 Q4,14 4,19.5 Q4,25 11,24" fill="none" stroke="#c8a45a" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="11" y1="14" x2="17" y2="14" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
              <text x="32" y="11" fontFamily="'Cormorant Garamond',serif" fontSize="13" fontWeight="300" fill="#f0ebe0" letterSpacing="1.5">SCORE</text>
              <line x1="32" y1="14.5" x2="108" y2="14.5" stroke="#2a2830" strokeWidth="0.4"/>
              <text x="32" y="24" fontFamily="'Outfit',sans-serif" fontSize="7.5" fontWeight="500" fill="#c8a45a" letterSpacing="4">FORGE</text>
            </svg>
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#f0ebe0', marginBottom: '8px', textAlign: 'center' }}>Nuova password</h1>
        <p style={{ fontSize: '13px', color: '#5a5548', textAlign: 'center', marginBottom: '28px' }}>Scegli una nuova password sicura.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#5a5548', textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'DM Mono, monospace', display: 'block', marginBottom: '6px' }}>Nuova password</label>
            <input type="password" required style={iS} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 8 caratteri"
              onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#5a5548', textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'DM Mono, monospace', display: 'block', marginBottom: '6px' }}>Conferma password</label>
            <input type="password" required style={iS} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ripeti la password"
              onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
          </div>
          {error && <div style={{ background: '#c94b4b18', border: '1px solid #c94b4b44', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c94b4b' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: "'Outfit', sans-serif" }}>
            {loading ? 'Salvataggio…' : 'Imposta nuova password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <ResetForm />
    </Suspense>
  )
}
