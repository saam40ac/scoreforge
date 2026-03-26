import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — ScoreForge',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR (Reg. UE 2016/679).',
  robots: 'index, follow',
}

export default function PrivacyPage() {
  return (
    <div style={{ background: '#09090f', minHeight: '100vh', color: '#f0ebe0', fontFamily: "'Outfit', sans-serif" }}>

      {/* Topbar */}
      <div style={{ borderBottom: '1px solid #2a2830', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#e2c47e', textDecoration: 'none', fontWeight: 300, letterSpacing: '2px' }}>
          SCORE<span style={{ fontWeight: 600 }}>FORGE</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
          <Link href="/legal/cookie" style={{ color: '#5a5548', textDecoration: 'none' }}>Cookie Policy</Link>
          <Link href="/legal/termini" style={{ color: '#5a5548', textDecoration: 'none' }}>Termini di Servizio</Link>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '52px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', color: '#c8a45a', marginBottom: '12px' }}>
            Documento legale
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '12px', color: '#f0ebe0' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '13px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
            Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)<br />
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <LegalContent />

      </div>

      <LegalFooter />
    </div>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: '#e2c47e', marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#5a5548', fontWeight: 400 }}>{n}</span>
        {title}
      </h2>
      <div style={{ fontSize: '14px', lineHeight: 1.9, color: '#a09888' }}>
        {children}
      </div>
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: '12px' }}>{children}</p>
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
      ))}
    </ul>
  )
}

function LegalContent() {
  return (
    <div style={{ borderTop: '1px solid #2a2830', paddingTop: '40px' }}>

      <Section n="1." title="Titolare del Trattamento">
        <P>
          Il Titolare del trattamento dei dati personali raccolti tramite la piattaforma ScoreForge
          è il soggetto che gestisce e amministra la piattaforma. Per esercitare i diritti previsti
          dal GDPR o per qualsiasi richiesta relativa alla privacy, è possibile contattare il Titolare
          scrivendo all'indirizzo email indicato nella sezione Contatti della piattaforma.
        </P>
      </Section>

      <Section n="2." title="Tipologie di Dati Raccolti">
        <P>La piattaforma ScoreForge raccoglie le seguenti categorie di dati personali:</P>
        <P><strong style={{ color: '#f0ebe0' }}>Dati forniti direttamente dall'utente:</strong></P>
        <Ul items={[
          'Indirizzo email (necessario per la registrazione e l\'accesso)',
          'Nome e cognome (inseriti nel profilo artista)',
          'Titolo professionale e città (facoltativi, inseriti nel profilo)',
          'Foto profilo (facoltativa, caricata dall\'utente)',
          'Contenuti multimediali: file audio, video, immagini caricati sulla piattaforma',
          'Testi biografici e link a profili social (facoltativi)',
        ]} />
        <P><strong style={{ color: '#f0ebe0' }}>Dati raccolti automaticamente:</strong></P>
        <Ul items={[
          'Dati di navigazione e analytics sulle landing page pubblicate (paese, browser, sistema operativo)',
          'Statistiche di ascolto delle tracce audio (anonime, senza identificazione dell\'ascoltatore)',
          'Identificatori di sessione anonimi (senza cookie persistenti)',
          'Indirizzi IP (trattati in forma aggregata per geolocalizzazione approssimativa)',
        ]} />
      </Section>

      <Section n="3." title="Finalità e Base Giuridica del Trattamento">
        <P>I dati personali sono trattati per le seguenti finalità:</P>
        <Ul items={[
          'Erogazione del servizio: gestione dell\'account, autenticazione, caricamento e visualizzazione dei contenuti — base giuridica: esecuzione del contratto (art. 6.1.b GDPR)',
          'Analytics della piattaforma: statistiche aggregate sulle visualizzazioni e ascolti delle landing page pubblicate — base giuridica: legittimo interesse (art. 6.1.f GDPR)',
          'Comunicazioni di servizio: notifiche tecniche legate all\'account — base giuridica: esecuzione del contratto',
          'Sicurezza e prevenzione delle frodi — base giuridica: legittimo interesse',
          'Adempimento di obblighi legali — base giuridica: obbligo legale (art. 6.1.c GDPR)',
        ]} />
      </Section>

      <Section n="4." title="Modalità e Luogo del Trattamento">
        <P>
          I dati sono trattati con strumenti informatici, nel rispetto delle misure di sicurezza
          previste dal GDPR. La piattaforma utilizza i seguenti servizi di terze parti per
          l'archiviazione e l'elaborazione dei dati:
        </P>
        <Ul items={[
          'Supabase (database e storage): i server sono localizzati nell\'Unione Europea (Frankfurt, Germania). Supabase è conforme al GDPR.',
          'Vercel (hosting e CDN): infrastruttura con server edge in UE e conformità GDPR.',
        ]} />
        <P>
          I dati non vengono trasferiti a paesi extra-UE, salvo nei casi in cui i fornitori
          garantiscano un livello di protezione adeguato tramite le Clausole Contrattuali Standard
          approvate dalla Commissione Europea.
        </P>
      </Section>

      <Section n="5." title="Periodo di Conservazione">
        <P>I dati personali sono conservati per i seguenti periodi:</P>
        <Ul items={[
          'Dati dell\'account: per tutta la durata dell\'account attivo, più 30 giorni dopo la cancellazione',
          'Contenuti multimediali: fino alla cancellazione manuale da parte dell\'utente o dell\'account',
          'Dati di analytics: in forma aggregata e anonimizzata per un massimo di 24 mesi',
          'Log di sicurezza: 90 giorni',
        ]} />
      </Section>

      <Section n="6." title="Diritti dell'Interessato">
        <P>Ai sensi degli artt. 15-22 del GDPR, ogni utente ha il diritto di:</P>
        <Ul items={[
          'Accesso: ottenere conferma che siano in corso trattamenti di dati personali che lo riguardano e ottenerne copia',
          'Rettifica: ottenere la correzione dei dati inesatti o incompleti',
          'Cancellazione ("diritto all\'oblio"): ottenere la cancellazione dei dati personali',
          'Limitazione: ottenere la limitazione del trattamento in determinati casi',
          'Portabilità: ricevere i dati in formato strutturato e leggibile da dispositivo automatico',
          'Opposizione: opporsi al trattamento per motivi legittimi',
          'Revoca del consenso: revocare il consenso in qualsiasi momento, senza pregiudizio per la liceità del trattamento precedente',
        ]} />
        <P>
          Per esercitare questi diritti, l'utente può inviare una richiesta via email al Titolare
          del trattamento. La risposta sarà fornita entro 30 giorni dalla ricezione della richiesta.
          È inoltre possibile proporre reclamo all'Autorità Garante per la protezione dei dati
          personali (Garante Privacy — www.garanteprivacy.it).
        </P>
      </Section>

      <Section n="7." title="Cookie e Tecnologie di Tracciamento">
        <P>
          ScoreForge utilizza un numero minimo di cookie, esclusivamente tecnici e necessari al
          funzionamento del servizio. Non vengono utilizzati cookie di profilazione o di marketing.
          Per informazioni dettagliate, consulta la{' '}
          <Link href="/legal/cookie" style={{ color: '#c8a45a', textDecoration: 'none' }}>Cookie Policy</Link>.
        </P>
      </Section>

      <Section n="8." title="Sicurezza dei Dati">
        <P>
          Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali da
          accessi non autorizzati, perdita, distruzione o divulgazione. Tra queste:
        </P>
        <Ul items={[
          'Cifratura HTTPS/TLS per tutte le comunicazioni',
          'Autenticazione sicura tramite Supabase Auth con hashing delle password',
          'Accesso ai dati limitato al solo personale autorizzato',
          'Backup regolari con cifratura dei dati a riposo',
          'Row Level Security (RLS) sul database: ogni utente accede solo ai propri dati',
        ]} />
      </Section>

      <Section n="9." title="Modifiche alla Privacy Policy">
        <P>
          Il Titolare si riserva il diritto di modificare questa Privacy Policy in qualsiasi momento,
          dandone comunicazione agli utenti tramite la piattaforma. Le modifiche avranno effetto
          dalla data di pubblicazione. L'uso continuato della piattaforma dopo la pubblicazione
          delle modifiche costituisce accettazione delle stesse.
        </P>
      </Section>

    </div>
  )
}

function LegalFooter() {
  return (
    <div style={{ borderTop: '1px solid #2a2830', padding: '20px 32px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { href: '/legal/privacy',  label: 'Privacy Policy' },
        { href: '/legal/cookie',   label: 'Cookie Policy' },
        { href: '/legal/termini',  label: 'Termini di Servizio' },
      ].map(l => (
        <Link key={l.href} href={l.href} style={{ fontSize: '11px', color: '#5a5548', textDecoration: 'none', fontFamily: 'DM Mono, monospace' }}>
          {l.label}
        </Link>
      ))}
      <span style={{ fontSize: '11px', color: '#3a3648', fontFamily: 'DM Mono, monospace' }}>
        © {new Date().getFullYear()} ScoreForge
      </span>
    </div>
  )
}
