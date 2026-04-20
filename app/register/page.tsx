'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLAN_META: Record<string, { label: string; color: string; price: string; features: string[] }> = {
  free:   { label: 'Free',   color: '#5a5548', price: 'Gratis',   features: ['1 portfolio','10 tracce','500 MB storage','Analytics base'] },
  pro:    { label: 'Pro',    color: '#c8a45a', price: '€12/mese', features: ['5 portfolio','100 tracce','5 GB storage','Analytics avanzate','Link tracciabili'] },
  studio: { label: 'Studio', color: '#e2c47e', price: '€29/mese', features: ['20 portfolio','500 tracce','20 GB storage','Multi-artista','White label'] },
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<'plan' | 'details'>('plan')
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan && PLAN_META[plan]) {
      setSelectedPlan(plan)
      setStep('details') // se arriva con piano già scelto, vai diretto ai dettagli
    }
  }, [searchParams])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Le password non coincidono.'); return }
    if (password.length < 8)  { setError('La password deve essere di almeno 8 caratteri.'); return }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      // Crea profilo con il piano selezionato
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        public_email: email,
        plan: selectedPlan,
        status: 'active',
      })

      // Piano free → pagina "controlla la tua email"
      if (selectedPlan === 'free') {
        router.push('/register/check-email')
        return
      }

      // Piano a pagamento → checkout Systeme.io
      const checkoutUrls: Record<string, string> = {
        pro:    process.env.NEXT_PUBLIC_SYSTEME_CHECKOUT_PRO    || '/register/success?plan=pro',
        studio: process.env.NEXT_PUBLIC_SYSTEME_CHECKOUT_STUDIO || '/register/success?plan=studio',
      }
      const checkoutUrl = checkoutUrls[selectedPlan] || '/dashboard'
      // Passiamo email e nome come parametri per pre-compilare il checkout
      const url = new URL(checkoutUrl, window.location.origin)
      url.searchParams.set('email', email)
      url.searchParams.set('name',  name)
      window.location.href = url.toString()
    }

    setLoading(false)
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
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>

      {/* Nav */}
      <nav style={{ padding: '16px clamp(20px,4vw,52px)', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        < <Link href="/home" style={{ textDecoration: 'none' }}>
          <svg width="110" height="24" viewBox="0 0 110 24">
            <path d="M16,2 Q22,1.5 22,7 Q22,12.5 16,12.5" fill="none" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M10,12.5 Q4,12.5 4,17.5 Q4,22.5 10,22" fill="none" stroke="#c8a45a" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="10" y1="12.5" x2="16" y2="12.5" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
            <text x="30" y="10" fontFamily="'Cormorant Garamond',serif" fontSize="12" fontWeight="300" fill="#f0ebe0" letterSpacing="1.5">SCORE</text>
            <line x1="30" y1="13.5" x2="100" y2="13.5" stroke="#2a2830" strokeWidth="0.4"/>
            <text x="30" y="22" fontFamily="'Outfit',sans-serif" fontSize="7" fontWeight="500" fill="#c8a45a" letterSpacing="4">FORGE</text>
          </svg>
        </Link>
        <span style={{ fontSize: '13px', color: '#5a5548' }}>
          Hai già un account?{' '}
          <Link href="/login" style={{ color: '#c8a45a', textDecoration: 'none' }}>Accedi</Link>
        </span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: step === 'plan' ? '900px' : '480px' }}>

          {/* Step 1 — Scegli piano */}
          {step === 'plan' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '10px', color: '#c8a45a', fontFamily: 'DM Mono, monospace', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Crea il tuo account</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,5vw,46px)', fontWeight: 300, color: '#f0ebe0', marginBottom: '12px' }}>
                  Scegli il piano giusto per te
                </h1>
                <p style={{ color: '#5a5548', fontSize: '14px' }}>Puoi cambiare piano in qualsiasi momento.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '14px' }}>
                {Object.entries(PLAN_META).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedPlan(key); setStep('details') }}
                    style={{
                      background: '#0f0f1a', border: `1px solid ${selectedPlan === key ? p.color + '60' : 'rgba(255,255,255,.07)'}`,
                      borderRadius: '16px', padding: '28px 24px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all .2s', position: 'relative',
                    }}
                  >
                    {key === 'pro' && (
                      <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#c8a45a', color: '#07070d', padding: '3px 14px', borderRadius: '20px', fontSize: '9px', fontFamily: 'DM Mono, monospace', letterSpacing: '.1em', fontWeight: 600 }}>
                        PIÙ SCELTO
                      </div>
                    )}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 400, color: p.color, marginBottom: '6px' }}>{p.label}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#f0ebe0', lineHeight: 1, marginBottom: '16px' }}>{p.price}</div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,.07)', margin: '14px 0' }} />
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ fontSize: '13px', color: '#a09888', padding: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 500, background: p.color + '18', color: p.color, border: `1px solid ${p.color}44` }}>
                      {key === 'free' ? 'Inizia gratis →' : 'Seleziona →'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Dati personali */}
          {step === 'details' && (
            <div>
              <button onClick={() => setStep('plan')} style={{ background: 'none', border: 'none', color: '#5a5548', cursor: 'pointer', fontSize: '13px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
                ← Cambia piano
              </button>

              {/* Riepilogo piano scelto */}
              <div style={{ background: '#0f0f1a', border: `1px solid ${PLAN_META[selectedPlan]?.color}44`, borderRadius: '12px', padding: '14px 18px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Piano selezionato</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: PLAN_META[selectedPlan]?.color }}>{PLAN_META[selectedPlan]?.label}</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: '#f0ebe0' }}>
                  {PLAN_META[selectedPlan]?.price}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 300, color: '#f0ebe0', marginBottom: '8px' }}>
                  Crea il tuo account
                </h1>
                <p style={{ color: '#5a5548', fontSize: '13px' }}>Ci vogliono meno di 2 minuti.</p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={lS}>Nome completo</label>
                  <input style={iS} type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Andrea Pagliara"
                    onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
                </div>
                <div>
                  <label style={lS}>Email</label>
                  <input style={iS} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="andrea@email.com"
                    onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
                </div>
                <div>
                  <label style={lS}>Password</label>
                  <input style={iS} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 8 caratteri"
                    onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
                </div>
                <div>
                  <label style={lS}>Conferma password</label>
                  <input style={iS} type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ripeti la password"
                    onFocus={e => (e.target.style.borderColor = '#c8a45a')} onBlur={e => (e.target.style.borderColor = '#2a2830')} />
                </div>

                {error && (
                  <div style={{ background: '#c94b4b18', border: '1px solid #c94b4b44', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c94b4b' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', border: 'none', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", opacity: loading ? .7 : 1, transition: 'all .2s', marginTop: '4px' }}>
                  {loading ? 'Creazione account…' : selectedPlan === 'free' ? 'Crea account gratis' : `Continua al pagamento →`}
                </button>

                <p style={{ fontSize: '11px', color: '#5a5548', textAlign: 'center', lineHeight: 1.7 }}>
                  Registrandoti accetti i nostri{' '}
                  <Link href="/legal/termini" style={{ color: '#c8a45a', textDecoration: 'none' }}>Termini di Servizio</Link>
                  {' '}e la{' '}
                  <Link href="/legal/privacy" style={{ color: '#c8a45a', textDecoration: 'none' }}>Privacy Policy</Link>.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <RegisterForm />
    </Suspense>
  )
}
