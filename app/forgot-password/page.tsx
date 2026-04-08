'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const iS: React.CSSProperties = {
    width: '100%', background: '#111118', border: '1px solid #2a2830',
    borderRadius: '8px', padding: '11px 14px', color: '#f0ebe0',
    fontSize: '14px', outline: 'none', fontFamily: "'Outfit', sans-serif",
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
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

        {!sent ? (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: '#f0ebe0', marginBottom: '8px', textAlign: 'center' }}>
              Password dimenticata?
            </h1>
            <p style={{ fontSize: '13px', color: '#5a5548', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 }}>
              Inserisci la tua email e ti mandiamo il link per reimpostarla.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#5a5548', textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'DM Mono, monospace', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email" required style={iS} value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="la-tua@email.com"
                  onFocus={e => (e.target.style.borderColor = '#c8a45a')}
                  onBlur={e => (e.target.style.borderColor = '#2a2830')}
                />
              </div>

              {error && (
                <div style={{ background: '#c94b4b18', border: '1px solid #c94b4b44', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c94b4b' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: "'Outfit', sans-serif" }}>
                {loading ? 'Invio in corso…' : 'Invia link di recupero'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300, color: '#f0ebe0', marginBottom: '12px' }}>
              Email inviata!
            </h2>
            <p style={{ fontSize: '14px', color: '#a09888', lineHeight: 1.7, marginBottom: '8px' }}>
              Controlla la casella di <strong style={{ color: '#f0ebe0' }}>{email}</strong>.
            </p>
            <p style={{ fontSize: '12px', color: '#5a5548', lineHeight: 1.6 }}>
              Se usi iCloud, controlla anche la cartella <strong>Spam</strong> o verifica che l'indirizzo @icloud.com sia quello corretto con cui ti sei registrato.
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#5a5548', textDecoration: 'none' }}>
            ← Torna al login
          </Link>
        </div>
      </div>
    </div>
  )
}
