'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const supabase = createClient()

  useEffect(() => {
    async function verifyToken() {
      const token_hash = searchParams.get('token_hash')
      const type       = searchParams.get('type') as any

      if (!token_hash || !type) {
        // Nessun token — potrebbe essere redirect diretto senza token
        // Controlla se c'è già una sessione attiva
        const { data: { session } } = await supabase.auth.getSession()
        if (session) { setStatus('success'); return }
        setStatus('error')
        return
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type })
      if (error) {
        console.error('verifyOtp error:', error.message)
        setStatus('error')
      } else {
        setStatus('success')
      }
    }
    verifyToken()
  }, [])

  if (status === 'loading') return (
    <div style={{ minHeight:'100vh', background:'#07070d', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:'13px', color:'#5a5548', fontFamily:'DM Mono,monospace' }}>Verifica in corso…</div>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight:'100vh', background:'#07070d', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ fontSize:'40px', marginBottom:'20px' }}>⚠️</div>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'26px', fontWeight:300, color:'#f0ebe0', marginBottom:'12px', textAlign:'center' }}>
        Link non valido o scaduto
      </h2>
      <p style={{ fontSize:'14px', color:'#5a5548', textAlign:'center', marginBottom:'28px', maxWidth:'380px', lineHeight:1.7 }}>
        Il link di conferma è scaduto o è già stato usato. Registrati nuovamente oppure accedi.
      </p>
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center' }}>
        <Link href="/register" style={{ padding:'12px 28px', borderRadius:'8px', background:'#c8a45a', color:'#07070d', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>
          Registrati
        </Link>
        <Link href="/login" style={{ padding:'12px 28px', borderRadius:'8px', background:'transparent', color:'#a09888', fontSize:'14px', border:'1px solid #2a2830', textDecoration:'none' }}>
          Accedi
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#07070d', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Outfit',sans-serif" }}>
      {/* Logo */}
      <div style={{ marginBottom:'40px' }}>
        <svg width="140" height="30" viewBox="0 0 140 30">
          <path d="M20,3 Q28,2.5 28,10 Q28,17 20,17" fill="none" stroke="#e2c47e" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12,17 Q4,17 4,23 Q4,29 12,28" fill="none" stroke="#c8a45a" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="20" y2="17" stroke="#e2c47e" strokeWidth="2.5" strokeLinecap="round"/>
          <text x="38" y="13" fontFamily="'Cormorant Garamond',serif" fontSize="15" fontWeight="300" fill="#f0ebe0" letterSpacing="2">SCORE</text>
          <line x1="38" y1="17" x2="124" y2="17" stroke="#2a2830" strokeWidth="0.5"/>
          <text x="38" y="26" fontFamily="'Outfit',sans-serif" fontSize="8" fontWeight="500" fill="#c8a45a" letterSpacing="4">FORGE</text>
        </svg>
      </div>

      {/* Check */}
      <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(75,184,122,0.12)', border:'1.5px solid rgba(75,184,122,0.35)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'28px', fontSize:'32px' }}>
        ✓
      </div>

      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(26px,5vw,38px)', fontWeight:300, color:'#f0ebe0', marginBottom:'12px', textAlign:'center', lineHeight:1.2 }}>
        Email confermata!
      </h1>
      <p style={{ fontSize:'15px', color:'#5a5548', textAlign:'center', maxWidth:'400px', lineHeight:1.7, marginBottom:'40px' }}>
        Il tuo account è attivo. Accedi ora e inizia a costruire il tuo portfolio professionale.
      </p>

      <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 36px', borderRadius:'8px', background:'#c8a45a', color:'#07070d', fontSize:'15px', fontWeight:600, textDecoration:'none', letterSpacing:'.02em' }}>
        Accedi a ScoreForge →
      </Link>

      <p style={{ marginTop:'48px', fontSize:'12px', color:'#3a3648', textAlign:'center' }}>
        ScoreForge — powered by <span style={{ color:'#5a5548' }}>SAAM 4.0 Academy</span>
      </p>
    </div>
  )
}

export default function AuthConfirmedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#07070d' }} />}>
      <ConfirmedContent />
    </Suspense>
  )
}
