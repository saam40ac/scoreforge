import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini di Servizio — ScoreForge',
  description: 'Termini e condizioni di utilizzo della piattaforma ScoreForge.',
  robots: 'index, follow',
}

export default function TerminiPage() {
  return (
    <div style={{ background: '#09090f', minHeight: '100vh', color: '#f0ebe0', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ borderBottom: '1px solid #2a2830', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#e2c47e', textDecoration: 'none', fontWeight: 300, letterSpacing: '2px' }}>
          SCORE<span style={{ fontWeight: 600 }}>FORGE</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
          <Link href="/legal/privacy" style={{ color: '#5a5548', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/legal/cookie" style={{ color: '#5a5548', textDecoration: 'none' }}>Cookie Policy</Link>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '52px 32px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', color: '#c8a45a', marginBottom: '12px' }}>Documento legale</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, marginBottom: '12px' }}>Termini di Servizio</h1>
          <p style={{ fontSize: '13px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>
            Condizioni generali di utilizzo della piattaforma ScoreForge<br />
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ borderTop: '1px solid #2a2830', paddingTop: '40px' }}>

          <p style={{ fontSize: '14px', lineHeight: 1.9, color: '#a09888', marginBottom: '40px' }}>
            Leggere attentamente i presenti Termini di Servizio prima di utilizzare la piattaforma
            ScoreForge. L'utilizzo della piattaforma implica l'accettazione integrale di questi termini.
          </p>

          <S n="1." title="Descrizione del Servizio">
            <P>
              ScoreForge è una piattaforma digitale che consente ad artisti creativi di creare,
              personalizzare e pubblicare portfolio artistici professionali online. Il servizio
              include la gestione di contenuti multimediali (audio, video, immagini), la creazione
              di landing page pubbliche e strumenti di analytics per monitorare le interazioni
              con i propri portfolio.
            </P>
          </S>

          <S n="2." title="Accettazione dei Termini">
            <P>
              Registrandosi alla piattaforma o utilizzandone i servizi, l'utente dichiara di aver
              letto, compreso e accettato integralmente i presenti Termini di Servizio, la{' '}
              <Link href="/legal/privacy" style={{ color: '#c8a45a', textDecoration: 'none' }}>Privacy Policy</Link>{' '}
              e la <Link href="/legal/cookie" style={{ color: '#c8a45a', textDecoration: 'none' }}>Cookie Policy</Link>.
            </P>
            <P>
              Se l'utente non accetta questi termini, non è autorizzato a utilizzare la piattaforma.
            </P>
          </S>

          <S n="3." title="Registrazione e Account">
            <P>Per accedere ai servizi di ScoreForge è necessario creare un account personale. L'utente si impegna a:</P>
            <Ul items={[
              'Fornire informazioni veritiere, accurate e aggiornate durante la registrazione',
              'Mantenere riservate le credenziali di accesso e non condividerle con terzi',
              'Notificare immediatamente il Titolare in caso di accesso non autorizzato al proprio account',
              'Utilizzare la piattaforma esclusivamente per scopi leciti e conformi ai presenti termini',
              'Essere il legittimo titolare dei contenuti caricati sulla piattaforma',
            ]} />
            <P>
              Un solo account per persona fisica. La creazione di account multipli per eludere
              limitazioni del servizio è espressamente vietata.
            </P>
          </S>

          <S n="4." title="Contenuti Caricati dall'Utente">
            <P>
              L'utente è l'unico responsabile di tutti i contenuti (testi, immagini, audio, video)
              caricati sulla piattaforma. Caricando contenuti, l'utente dichiara e garantisce che:
            </P>
            <Ul items={[
              'I contenuti sono originali o l\'utente detiene tutti i diritti necessari per pubblicarli',
              'I contenuti non violano diritti d\'autore, marchi registrati o altri diritti di proprietà intellettuale di terzi',
              'I contenuti non sono diffamatori, osceni, offensivi o in violazione di leggi applicabili',
              'I contenuti non contengono software dannoso, virus o codice malevolo',
              'I contenuti non violano la privacy o i diritti di immagine di terze persone',
            ]} />
            <P>
              ScoreForge si riserva il diritto di rimuovere contenuti che violino questi termini,
              senza obbligo di preavviso.
            </P>
          </S>

          <S n="5." title="Proprietà Intellettuale">
            <P>
              <strong style={{ color: '#f0ebe0' }}>Contenuti dell'utente:</strong> L'utente mantiene
              la piena proprietà di tutti i contenuti caricati sulla piattaforma. Caricando contenuti,
              l'utente concede a ScoreForge una licenza limitata, non esclusiva, gratuita, per
              visualizzare e rendere accessibili i contenuti nell'ambito del servizio offerto.
              Questa licenza cessa automaticamente alla cancellazione dei contenuti o dell'account.
            </P>
            <P>
              <strong style={{ color: '#f0ebe0' }}>Piattaforma ScoreForge:</strong> Il codice sorgente,
              il design, i loghi, i marchi e tutti gli elementi grafici della piattaforma sono di
              proprietà esclusiva del Titolare e protetti dalle leggi sul diritto d'autore.
              È vietata qualsiasi riproduzione, distribuzione o utilizzo non autorizzato.
            </P>
          </S>

          <S n="6." title="Limitazioni d'Uso">
            <P>È espressamente vietato utilizzare ScoreForge per:</P>
            <Ul items={[
              'Caricare contenuti pornografici, violenti, discriminatori o illegali',
              'Violare i diritti di proprietà intellettuale di terzi',
              'Inviare comunicazioni non richieste (spam) tramite i link di contatto',
              'Tentare di accedere a sezioni o dati della piattaforma non autorizzati',
              'Effettuare operazioni di scraping automatizzato dei contenuti',
              'Impersonare altri utenti o soggetti terzi',
              'Utilizzare la piattaforma per scopi commerciali non autorizzati dal Titolare',
            ]} />
          </S>

          <S n="7." title="Disponibilità del Servizio">
            <P>
              ScoreForge si impegna a garantire la massima continuità del servizio, ma non può
              garantire un uptime del 100%. Il servizio potrebbe essere temporaneamente non
              disponibile per manutenzione, aggiornamenti tecnici o cause di forza maggiore.
            </P>
            <P>
              Il Titolare si riserva il diritto di modificare, sospendere o interrompere qualsiasi
              funzionalità del servizio in qualsiasi momento, dandone comunicazione agli utenti
              con ragionevole preavviso salvo casi di emergenza tecnica.
            </P>
          </S>

          <S n="8." title="Limitazione di Responsabilità">
            <P>
              Nei limiti consentiti dalla legge applicabile, ScoreForge non è responsabile per:
            </P>
            <Ul items={[
              'Perdita o danneggiamento di dati derivante da cause al di fuori del proprio controllo',
              'Interruzioni del servizio dovute a cause di forza maggiore',
              'Danni indiretti, consequenziali o perdite di profitto dell\'utente',
              'Contenuti di terze parti accessibili tramite link presenti sulla piattaforma',
              'Utilizzo non autorizzato dell\'account da parte di terzi a seguito di negligenza dell\'utente',
            ]} />
          </S>

          <S n="9." title="Cancellazione dell'Account">
            <P>
              L'utente può cancellare il proprio account in qualsiasi momento dalla sezione
              Impostazioni della dashboard. Alla cancellazione:
            </P>
            <Ul items={[
              'I dati personali saranno eliminati entro 30 giorni, salvo obblighi legali di conservazione',
              'I contenuti multimediali caricati saranno eliminati dallo storage',
              'Le landing page pubblicate non saranno più accessibili',
              'I dati di analytics saranno anonimizzati e conservati in forma aggregata',
            ]} />
            <P>
              Il Titolare si riserva il diritto di sospendere o cancellare account che violino
              ripetutamente i presenti Termini di Servizio.
            </P>
          </S>

          <S n="10." title="Modifiche ai Termini">
            <P>
              Il Titolare si riserva il diritto di modificare i presenti Termini di Servizio
              in qualsiasi momento. Le modifiche saranno comunicate agli utenti tramite la
              piattaforma con almeno 15 giorni di preavviso. L'uso continuato della piattaforma
              dopo l'entrata in vigore delle modifiche costituisce accettazione dei nuovi termini.
            </P>
          </S>

          <S n="11." title="Legge Applicabile e Foro Competente">
            <P>
              I presenti Termini di Servizio sono regolati dalla legge italiana. Per qualsiasi
              controversia derivante dall'utilizzo della piattaforma, le parti si impegnano a
              ricercare una soluzione amichevole. In mancanza di accordo, sarà competente in
              via esclusiva il foro del luogo di residenza o domicilio del consumatore, ai
              sensi del Codice del Consumo (D.Lgs. 206/2005).
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
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: '12px' }}>{children}</p>
}
function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
    </ul>
  )
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
