import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — ScoreForge',
  description: 'Informativa sull\'uso dei cookie e tecnologie di tracciamento su ScoreForge.',
  robots: 'index, follow',
}

export default function CookiePage() {
  return (
    <div style={{ background: '#09090f', minHeight: '100vh', color: '#f0ebe0', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ borderBottom: '1px solid #2a2830', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#e2c47e', textDecoration: 'none', fontWeight: 300, letterSpacing: '2px' }}>
          SCORE<span style={{ fontWeight: 600 }}>FORGE</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
          <Link href="/legal/privacy" style={{ color: '#5a5548', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/legal/termini" style={{ color: '#5a5548', textDecoration: 'none' }}>Termini di Servizio</Link>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '52px 32px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', color: '#c8a45a', marginBottom: '12px' }}>Documento legale</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '12px' }}>Cookie Policy</h1>
          <p style={{ fontSize: '13px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
            Ai sensi del D.Lgs. 196/2003, del D.Lgs. 69/2012 e del Reg. UE 2016/679 (GDPR)<br />
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ borderTop: '1px solid #2a2830', paddingTop: '40px' }}>

          {/* Intro */}
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: '#a09888', marginBottom: '40px' }}>
            Questa Cookie Policy descrive in modo chiaro e trasparente le tipologie di cookie e
            tecnologie simili utilizzate da ScoreForge, le loro finalità e come l'utente può
            gestirne le preferenze.
          </p>

          <S n="1." title="Cosa sono i Cookie">
            <P>
              I cookie sono piccoli file di testo salvati sul dispositivo dell'utente quando visita
              un sito web. Permettono al sito di ricordare informazioni sulla visita, come la lingua
              preferita e altre impostazioni, rendendo la visita successiva più semplice.
            </P>
          </S>

          <S n="2." title="Cookie utilizzati da ScoreForge">
            <P>ScoreForge adotta una politica di <strong style={{ color: '#f0ebe0' }}>privacy-first</strong>: utilizziamo
            esclusivamente i cookie strettamente necessari al funzionamento del servizio.</P>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2830' }}>
                  {['Nome', 'Tipo', 'Durata', 'Finalità'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a5548', fontFamily: 'DM Mono, monospace', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { nome: 'sb-auth-token', tipo: 'Tecnico necessario', durata: 'Sessione / 7 giorni', finalita: 'Autenticazione utente (Supabase Auth). Senza questo cookie non è possibile accedere all\'area riservata.' },
                  { nome: 'sf_theme', tipo: 'Preferenze', durata: 'Persistente (1 anno)', finalita: 'Salva la preferenza tema chiaro/scuro dell\'utente nella dashboard.' },
                  { nome: 'sf_session', tipo: 'Analytics anonimo', durata: 'Sessione', finalita: 'Identificatore di sessione anonimo per le analytics della landing page. Non contiene dati personali identificativi. Viene eliminato alla chiusura del browser.' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #17171f' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#c8a45a' }}>{r.nome}</td>
                    <td style={{ padding: '10px 12px', color: '#a09888' }}>{r.tipo}</td>
                    <td style={{ padding: '10px 12px', color: '#a09888' }}>{r.durata}</td>
                    <td style={{ padding: '10px 12px', color: '#a09888', lineHeight: 1.6 }}>{r.finalita}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </S>

          <S n="3." title="Cookie di Terze Parti">
            <P>
              ScoreForge <strong style={{ color: '#f0ebe0' }}>non utilizza</strong> cookie di profilazione,
              cookie di marketing, cookie pubblicitari o strumenti di tracciamento comportamentale
              di terze parti (Google Analytics, Facebook Pixel, ecc.).
            </P>
            <P>
              I servizi di terze parti utilizzati dalla piattaforma (Supabase, Vercel) potrebbero
              impostare cookie tecnici strettamente necessari al loro funzionamento. Per informazioni
              dettagliate consulta le rispettive privacy policy:
            </P>
            <ul style={{ paddingLeft: '20px', color: '#a09888', lineHeight: 2 }}>
              <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#c8a45a', textDecoration: 'none' }}>Supabase Privacy Policy</a></li>
              <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#c8a45a', textDecoration: 'none' }}>Vercel Privacy Policy</a></li>
            </ul>
          </S>

          <S n="4." title="Come Gestire i Cookie">
            <P>
              L'utente può gestire le preferenze sui cookie in qualsiasi momento attraverso le
              impostazioni del proprio browser. Di seguito le guide ufficiali per i browser più diffusi:
            </P>
            <ul style={{ paddingLeft: '20px', color: '#a09888', lineHeight: 2 }}>
              {[
                { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox' },
                { name: 'Microsoft Edge', url: 'https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                { name: 'Safari (macOS)', url: 'https://support.apple.com/it-it/guide/safari/sfri11471/mac' },
                { name: 'Safari (iOS/iPadOS)', url: 'https://support.apple.com/it-it/HT201265' },
              ].map(b => (
                <li key={b.name}><a href={b.url} target="_blank" rel="noopener noreferrer" style={{ color: '#c8a45a', textDecoration: 'none' }}>{b.name}</a></li>
              ))}
            </ul>
            <P style={{ marginTop: '12px' }}>
              Attenzione: la disabilitazione dei cookie tecnici necessari potrebbe compromettere
              il corretto funzionamento della piattaforma, in particolare dell'area di accesso.
            </P>
          </S>

          <S n="5." title="Aggiornamenti">
            <P>
              Questa Cookie Policy può essere aggiornata periodicamente per riflettere eventuali
              modifiche ai servizi utilizzati o alla normativa applicabile. La data dell'ultimo
              aggiornamento è indicata in cima al documento.
            </P>
            <P>
              Per ulteriori informazioni sul trattamento dei dati personali, consulta la{' '}
              <Link href="/legal/privacy" style={{ color: '#c8a45a', textDecoration: 'none' }}>Privacy Policy</Link>.
            </P>
          </S>

        </div>
      </div>

      <LF />
    </div>
  )
}

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: '#e2c47e', marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#5a5548', fontWeight: 400 }}>{n}</span>{title}
      </h2>
      <div style={{ fontSize: '14px', lineHeight: 1.9, color: '#a09888' }}>{children}</div>
    </div>
  )
}
function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: '12px', ...style }}>{children}</p>
}
function LF() {
  return (
    <div style={{ borderTop: '1px solid #2a2830', padding: '20px 32px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {[{ href: '/legal/privacy', label: 'Privacy Policy' }, { href: '/legal/cookie', label: 'Cookie Policy' }, { href: '/legal/termini', label: 'Termini di Servizio' }].map(l => (
        <Link key={l.href} href={l.href} style={{ fontSize: '11px', color: '#5a5548', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>{l.label}</Link>
      ))}
      <span style={{ fontSize: '11px', color: '#3a3648', fontFamily: 'DM Mono, monospace' }}>© {new Date().getFullYear()} ScoreForge</span>
    </div>
  )
}
