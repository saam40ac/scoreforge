import Link from 'next/link'

export default function EmailConfirmedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px' }}>
        <svg width="140" height="30" viewBox="0 0 140 30">
          <path d="M20,3 Q28,2.5 28,10 Q28,17 20,17" fill="none" stroke="#e2c47e" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M12,17 Q4,17 4,23 Q4,29 12,28" fill="none" stroke="#c8a45a" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="20" y2="17" stroke="#e2c47e" strokeWidth="2.5" strokeLinecap="round"/>
          <text x="38" y="13" fontFamily="'Cormorant Garamond',serif" fontSize="15" fontWeight="300" fill="#f0ebe0" letterSpacing="2">SCORE</text>
          <line x1="38" y1="17" x2="124" y2="17" stroke="#2a2830" strokeWidth="0.5"/>
          <text x="38" y="26" fontFamily="'Outfit',sans-serif" fontSize="8" fontWeight="500" fill="#c8a45a" letterSpacing="4">FORGE</text>
        </svg>
      </div>

      {/* Icona successo */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'rgba(75,184,122,0.12)', border: '1.5px solid rgba(75,184,122,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px', fontSize: '32px',
      }}>
        ✓
      </div>

      {/* Titolo */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(26px, 5vw, 38px)',
        fontWeight: 300,
        color: '#f0ebe0',
        marginBottom: '12px',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        Email confermata
      </h1>

      {/* Sottotitolo */}
      <p style={{
        fontSize: '15px',
        color: '#5a5548',
        textAlign: 'center',
        maxWidth: '420px',
        lineHeight: 1.7,
        marginBottom: '40px',
      }}>
        Il tuo indirizzo email è stato verificato con successo.
        Ora puoi accedere alla piattaforma e iniziare a creare il tuo portfolio professionale.
      </p>

      {/* CTA */}
      <Link href="/login" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 36px',
        borderRadius: '8px',
        background: '#c8a45a',
        color: '#07070d',
        fontSize: '15px',
        fontWeight: 600,
        textDecoration: 'none',
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '.02em',
        transition: 'opacity .2s',
      }}>
        Accedi a ScoreForge →
      </Link>

      {/* Footer */}
      <p style={{ marginTop: '48px', fontSize: '12px', color: '#3a3648', textAlign: 'center' }}>
        ScoreForge — powered by{' '}
        <span style={{ color: '#5a5548' }}>SAAM 4.0 Academy</span>
      </p>
    </div>
  )
}
