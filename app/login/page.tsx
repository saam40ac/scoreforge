'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      // Messaggio più chiaro per iCloud e credenziali errate
      if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
        setError('Email o password non corretti. Se usi un indirizzo @icloud.com, verifica di aver confermato l\'email alla registrazione.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Devi confermare la tua email prima di accedere. Controlla la casella di posta (e la cartella Spam).')
      } else {
        setError(error.message)
      }
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const iS: React.CSSProperties = {
    width: '100%', background: '#111118', border: '1px solid #2a2830',
    borderRadius: '8px', padding: '11px 14px', color: '#f0ebe0',
    fontSize: '14px', outline: 'none', fontFamily: "'Outfit', sans-serif",
    transition: 'border-color .2s',
  }
  const lS: React.CSSProperties = {
    fontSize: '10px', color: '#5a5548', textTransform: 'uppercase',
    letterSpacing: '.12em', fontFamily: 'DM Mono, monospace',
    display: 'block', marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/landing.html">
            <svg width="130" height="28" viewBox="0 0 130 28">
              <path d="M18,2 Q26,1.5 26,8.5 Q26,15 18,15" fill="none" stroke="#e2c47e" strokeWidth="2.4" strokeLinecap="round"/>
              <path d="M12,15 Q4,15 4,21 Q4,27 12,26" fill="none" stroke="#c8a45a" strokeWidth="2.4" strokeLinecap="round"/>
              <line x1="12" y1="15" x2="18" y2="15" stroke="#e2c47e" strokeWidth="2.4" strokeLinecap="round"/>
              <text x="34" y="12" fontFamily="'Cormorant Garamond',serif" fontSize="14" fontWeight="300" fill="#f0ebe0" letterSpacing="1.8">SCORE</text>
              <line x1="34" y1="15.5" x2="116" y2="15.5" stroke="#2a2830" strokeWidth="0.4"/>
              <text x="34" y="26" fontFamily="'Outfit',sans-serif" fontSize="8" fontWeight="500" fill="#c8a45a" letterSpacing="4.5">FORGE</text>
            </svg>
          </Link>
          <p style={{ fontSize: '11px', color: '#5a5548', fontFamily: 'DM Mono, monospace', letterSpacing: '.1em', marginTop: '10px' }}>ARTIST PORTFOLIO PLATFORM</p>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#f0ebe0', marginBottom: '28px', textAlign: 'center' }}>
          Accedi al tuo account
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lS}>Email</label>
            <input type="email" required style={iS} value={email} onChange={e => setEmail(e.target.value)} placeholder="la-tua@email.com"
              onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...lS, marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '11px', color: '#c8a45a', textDecoration: 'none' }}>
                Password dimenticata?
              </Link>
            </div>
            <input type="password" required style={iS} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
          </div>

          {error && (
            <div style={{ background: '#c94b4b18', border: '1px solid #c94b4b44', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c94b4b', lineHeight: 1.6 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', border: 'none', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: "'Outfit', sans-serif", marginTop: '4px' }}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        {/* Link registrazione */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '18px', background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '10px' }}>
          <span style={{ fontSize: '13px', color: '#5a5548' }}>Non hai ancora un account?</span>{' '}
          <Link href="/register" style={{ fontSize: '13px', color: '#c8a45a', textDecoration: 'none', fontWeight: 500 }}>
            Creane uno gratis →
          </Link>
        </div>

        {/* Legal */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/legal/privacy" style={{ fontSize: '10px', color: '#5a5548', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>Privacy</Link>
          <Link href="/legal/cookie"  style={{ fontSize: '10px', color: '#5a5548', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>Cookie</Link>
          <Link href="/legal/termini" style={{ fontSize: '10px', color: '#5a5548', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>Termini</Link>
        </div>
      </div>
    </div>
  )
}
