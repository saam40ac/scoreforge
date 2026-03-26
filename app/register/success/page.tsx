'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'

  return (
    <div style={{ minHeight: '100vh', background: '#07070d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Outfit', sans-serif", textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '24px' }}>✓</div>
      <div style={{ fontSize: '10px', color: '#c8a45a', fontFamily: 'DM Mono, monospace', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Pagamento completato</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,5vw,46px)', fontWeight: 300, color: '#f0ebe0', marginBottom: '16px' }}>
        Benvenuto in ScoreForge!
      </h1>
      <p style={{ color: '#a09888', fontSize: '15px', maxWidth: '420px', lineHeight: 1.8, marginBottom: '36px' }}>
        Il tuo account con piano <strong style={{ color: '#c8a45a', textTransform: 'capitalize' }}>{plan}</strong> è attivo.
        Il tuo portfolio professionale ti aspetta.
      </p>
      <Link href="/dashboard" style={{ padding: '14px 36px', borderRadius: '8px', background: '#c8a45a', color: '#07070d', textDecoration: 'none', fontSize: '15px', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
        Entra nella dashboard →
      </Link>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
