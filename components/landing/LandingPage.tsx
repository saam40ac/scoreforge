'use client'

import { useState } from 'react'
import type { PortfolioWithContent } from '@/lib/supabase/types'
import AudioPlayer from '@/components/player/AudioPlayer'

interface Props {
  portfolio: PortfolioWithContent
  preview?: boolean
}

const THEMES = {
  dark: {
    bg: '#09090f', bg2: '#111118', bg3: '#17171f',
    text: '#f0ebe0', text2: '#a09888', text3: '#5a5548',
    border: 'rgba(255,255,255,0.07)',
    trackBg: '#17171f',
  },
  ivory: {
    bg: '#f5f0e8', bg2: '#ede8df', bg3: '#e5dfd5',
    text: '#1a1612', text2: '#4a4540', text3: '#9a9590',
    border: 'rgba(0,0,0,0.09)',
    trackBg: '#ede8df',
  },
  neon: {
    bg: '#060612', bg2: '#0e0e20', bg3: '#14142a',
    text: '#e8e0f8', text2: '#9890b8', text3: '#4a4870',
    border: 'rgba(148,110,255,0.14)',
    trackBg: '#0e0e20',
  },
}

function ContactModal({
  open, onClose, accentColor, T, profile
}: {
  open: boolean
  onClose: () => void
  accentColor: string
  T: typeof THEMES.dark
  profile: { name: string; email: string }
}) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Proposta di collaborazione — ${name}`)
    const body    = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\n${message}`)
    window.open(`mailto:${profile.email}?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 2000)
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '18px' }}>✕</button>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text }}>Messaggio inviato!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', marginBottom: '4px', color: T.text }}>Scrivimi</div>
            <div style={{ fontSize: '12px', color: T.text3, marginBottom: '24px', fontFamily: 'DM Mono, monospace' }}>a {profile.email}</div>
            {[
              { label: 'Il tuo nome', val: name, set: setName, type: 'text' },
              { label: 'La tua email', val: email, set: setEmail, type: 'email' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10px', color: T.text3, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'DM Mono, monospace', marginBottom: '6px' }}>{f.label}</div>
                <input
                  type={f.type}
                  required
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '9px 13px', color: T.text, fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: T.text3, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'DM Mono, monospace', marginBottom: '6px' }}>Messaggio</div>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                style={{ width: '100%', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '9px 13px', color: T.text, fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', resize: 'vertical' }}
                placeholder="Raccontami del tuo progetto…"
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: accentColor, color: '#09090f', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              Invia messaggio
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function EmbedModal({ open, onClose, slug, T }: { open: boolean; onClose: () => void; slug: string; T: typeof THEMES.dark }) {
  const [copied, setCopied] = useState(false)
  const appUrl    = typeof window !== 'undefined' ? window.location.origin : ''
  const iframeUrl = `${appUrl}/${slug}`
  const embedCode = `<iframe src="${iframeUrl}" width="100%" height="700" frameborder="0" allow="autoplay" style="border-radius:12px;overflow:hidden;"></iframe>`

  function copy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '18px' }}>✕</button>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', marginBottom: '6px', color: T.text }}>Codice Embed</div>
        <div style={{ fontSize: '12px', color: T.text3, marginBottom: '20px', fontFamily: 'DM Mono, monospace' }}>Incolla su Systeme.io, WordPress o qualsiasi sito</div>
        <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '14px', marginBottom: '14px', overflowX: 'auto' }}>
          <pre style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: T.text2, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{embedCode}</pre>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={copy}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', background: copied ? '#4bb87a' : T.bg3, color: copied ? '#fff' : T.text2, border: `1px solid ${T.border}`, fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all .2s' }}
          >
            {copied ? '✓ Copiato!' : 'Copia codice embed'}
          </button>
          <button
            onClick={() => window.open(iframeUrl, '_blank')}
            style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', color: T.text3, border: `1px solid ${T.border}`, fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
          >
            Apri ↗
          </button>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: T.bg3, borderRadius: '8px', fontSize: '12px', color: T.text3, fontFamily: 'DM Mono, monospace', lineHeight: 1.6 }}>
          💡 Su Systeme.io: aggiungi un blocco &quot;HTML&quot; nella pagina e incolla il codice embed.
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ portfolio, preview }: Props) {
  const T  = THEMES[portfolio.theme as keyof typeof THEMES] || THEMES.dark
  const ac = portfolio.accent_color || '#c8a45a'

  const [contactOpen, setContactOpen] = useState(false)
  const [embedOpen,   setEmbedOpen]   = useState(false)

  const artistProfile = {
    name:     'Andrea Pagliara',
    email:    'andrea@pagliara.it',
    website:  'www.andreapagliara.it',
    linkedin: 'https://linkedin.com',
    spotify:  'https://spotify.com',
  }

  const hasVideo = !!portfolio.video_url?.includes('youtube.com/embed') || !!portfolio.video_url?.includes('vimeo.com')
  const initials = artistProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const sectionStyle = { padding: '40px 28px', borderBottom: `1px solid ${T.border}`, background: T.bg }
  const tagStyle     = { fontSize: '9.5px', letterSpacing: '.2em', textTransform: 'uppercase' as const, fontFamily: 'DM Mono, monospace', color: ac, marginBottom: '10px', opacity: .85 }
  const h2Style      = { fontFamily: "'Cormorant Garamond', serif", fontSize: '27px', fontWeight: 400, marginBottom: '12px', color: T.text, lineHeight: 1.1 }
  const bodyStyle    = { fontSize: '14px', lineHeight: 1.85, color: T.text2 }

  return (
    <>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} accentColor={ac} T={T} profile={artistProfile} />
      <EmbedModal   open={embedOpen}   onClose={() => setEmbedOpen(false)}   slug={portfolio.slug} T={T} />

      <div style={{ background: T.bg, color: T.text, fontFamily: "'Outfit', sans-serif", minHeight: '100vh' }}>

        {/* HEADER */}
        <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '0 28px' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '18px', padding: '18px 0' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: `linear-gradient(135deg, ${ac}, ${ac}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: '#09090f', flexShrink: 0, border: `2px solid ${ac}40` }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 400, color: T.text }}>{artistProfile.name}</div>
              <div style={{ fontSize: '11px', color: T.text3, fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Compositore · Musica Originale</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => setContactOpen(true)} style={{ padding: '8px 18px', borderRadius: '6px', background: ac, color: '#09090f', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Contattami
              </button>
              {!preview && (
                <button onClick={() => setEmbedOpen(true)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', color: T.text3, border: `1px solid ${T.border}`, fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }} title="Codice embed">
                  {'</>'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* HERO */}
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '52px 24px 44px', position: 'relative', overflow: 'hidden', background: T.bg }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${ac}0a, transparent 65%)` }} />
          <div style={{ ...tagStyle, position: 'relative' }}>Portfolio · {portfolio.target || 'Musica Originale'}</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 300, lineHeight: 1.06, marginBottom: '16px', position: 'relative', color: T.text }}>
            {portfolio.title}
          </h1>
          <div style={{ height: '1px', width: '44px', background: ac, margin: '0 auto 16px' }} />
          <p style={{ ...bodyStyle, maxWidth: '440px', margin: '0 auto 28px', position: 'relative' }}>{portfolio.description}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <button style={{ padding: '11px 26px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', background: ac, color: '#09090f', fontFamily: 'Outfit, sans-serif' }} onClick={() => document.getElementById('sf-audio')?.scrollIntoView({ behavior: 'smooth' })}>
              ▶ Ascolta
            </button>
            <button style={{ padding: '11px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif' }} onClick={() => setContactOpen(true)}>
              Scrivimi
            </button>
          </div>
        </div>

        {/* BIO */}
        {portfolio.bio && (
          <div style={sectionStyle}>
            <div style={tagStyle}>Chi sono</div>
            <h2 style={h2Style}>{artistProfile.name}</h2>
            <p style={bodyStyle}>{portfolio.bio}</p>
          </div>
        )}

        {/* PROGETTI */}
        {portfolio.projects.length > 0 && (
          <div style={sectionStyle}>
            <div style={tagStyle}>Lavori selezionati</div>
            <h2 style={h2Style}>Progetti</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {portfolio.projects.map(p => (
                <div key={p.id} style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg2 }}>
                  <div style={{ height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', opacity: .55, background: T.bg3 }}>{p.emoji}</div>
                  <div style={{ padding: '9px 11px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px', color: T.text }}>{p.title}</div>
                    <div style={{ fontSize: '10.5px', fontFamily: 'DM Mono, monospace', color: ac }}>{p.project_type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIO */}
        {portfolio.tracks.length > 0 && (
          <div id="sf-audio" style={sectionStyle}>
            <div style={tagStyle}>Composizioni</div>
            <h2 style={h2Style}>Ascolta il mio lavoro</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              {portfolio.tracks.map(t => (
                <AudioPlayer key={t.id} track={t} accentColor={ac} theme={portfolio.theme as 'dark' | 'ivory' | 'neon'} />
              ))}
            </div>
          </div>
        )}

        {/* VIDEO */}
        {hasVideo && (
          <div style={sectionStyle}>
            <div style={tagStyle}>Video</div>
            <h2 style={h2Style}>Showreel</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px', marginTop: '14px', background: T.bg3 }}>
              {preview ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', borderRadius: '10px' }} onClick={() => window.open(portfolio.video_url?.replace('/embed/', '/watch?v=') ?? '', '_blank')}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${ac}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: ac }}>▶</div>
                  <div style={{ fontSize: '13px', color: T.text2 }}>Clicca per riprodurre</div>
                </div>
              ) : (
                <iframe src={portfolio.video_url!} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '10px' }} />
              )}
            </div>
          </div>
        )}

        {/* CONTATTI */}
        <div id="sf-contact" style={{ padding: '50px 28px', textAlign: 'center', background: T.bg }}>
          <div style={tagStyle}>Lavoriamo insieme</div>
          <h2 style={{ ...h2Style, textAlign: 'center' }}>Contattami</h2>
          <p style={{ ...bodyStyle, maxWidth: '400px', margin: '0 auto 28px' }}>
            Disponibile per nuovi progetti cinematografici, musicali e teatrali. Scrivimi per discutere la tua visione.
          </p>
          <button onClick={() => setContactOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '8px', background: ac, color: '#09090f', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>
            ✉ Invia un messaggio
          </button>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`mailto:${artistProfile.email}`} style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '13px', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif', textDecoration: 'none' }}>
              ✉ {artistProfile.email}
            </a>
            <a href={artistProfile.linkedin} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '13px', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif', textDecoration: 'none' }}>
              in LinkedIn
            </a>
            <a href={artistProfile.spotify} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '13px', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif', textDecoration: 'none' }}>
              ♪ Spotify
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '16px 28px', textAlign: 'center', fontSize: '10.5px', fontFamily: 'DM Mono, monospace', color: T.text3, borderTop: `1px solid ${T.border}`, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} {artistProfile.name}</span>
          <span style={{ opacity: .3 }}>·</span>
          <span>Powered by ScoreForge</span>
          {!preview && (
            <>
              <span style={{ opacity: .3 }}>·</span>
              <button onClick={() => setEmbedOpen(true)} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '10.5px', fontFamily: 'DM Mono, monospace', padding: 0 }}>
                {'</>'} Embed
              </button>
            </>
          )}
        </div>

      </div>
    </>
  )
}
