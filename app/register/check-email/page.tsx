import Link from 'next/link'

export default function CheckEmailPage() {
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

      {/* Icona email */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(200,164,90,0.08)', border: '1.5px solid rgba(200,164,90,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px', fontSize: '36px',
      }}>
        ✉️
      </div>

      {/* Titolo */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(26px, 5vw, 36px)',
        fontWeight: 300,
        color: '#f0ebe0',
        marginBottom: '16px',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        Controlla la tua email
      </h1>

      {/* Testo */}
      <p style={{
        fontSize: '15px',
        color: '#a09888',
        textAlign: 'center',
        maxWidth: '440px',
        lineHeight: 1.8,
        marginBottom: '12px',
      }}>
        Ti abbiamo inviato un link di conferma. Aprilo per attivare il tuo account ScoreForge e iniziare a creare il tuo portfolio.
      </p>
      <p style={{
        fontSize: '13px',
        color: '#5a5548',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: 1.7,
        marginBottom: '40px',
      }}>
        Non trovi la mail? Controlla anche la cartella <strong style={{ color: '#a09888' }}>Spam</strong> o <strong style={{ color: '#a09888' }}>Promozioni</strong>. Il link è valido per 24 ore.
      </p>

      {/* Divisore con icona */}
      <div style={{
        width: '100%', maxWidth: '440px',
        border: 'none', borderTop: '1px solid #1e1e2e',
        marginBottom: '32px',
      }} />

      {/* CTA secondaria */}
      <p style={{ fontSize: '13px', color: '#5a5548', marginBottom: '16px', textAlign: 'center' }}>
        Hai già confermato la tua email?
      </p>
      <Link href="/login" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 32px',
        borderRadius: '8px',
        background: '#c8a45a',
        color: '#07070d',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '.02em',
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
