'use client'

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
    trackBg: '#17171f', font: "'Cormorant Garamond', serif",
  },
  ivory: {
    bg: '#f5f0e8', bg2: '#ede8df', bg3: '#e5dfd5',
    text: '#1a1612', text2: '#4a4540', text3: '#9a9590',
    border: 'rgba(0,0,0,0.09)',
    trackBg: '#ede8df', font: "'Cormorant Garamond', serif",
  },
  neon: {
    bg: '#060612', bg2: '#0e0e20', bg3: '#14142a',
    text: '#e8e0f8', text2: '#9890b8', text3: '#4a4870',
    border: 'rgba(148,110,255,0.14)',
    trackBg: '#0e0e20', font: "'Outfit', sans-serif",
  },
}

export default function LandingPage({ portfolio, preview }: Props) {
  const T  = THEMES[portfolio.theme as keyof typeof THEMES] || THEMES.dark
  const ac = portfolio.accent_color || '#c8a45a'
  const hasVideo = !!portfolio.video_url?.includes('youtube.com/embed') || !!portfolio.video_url?.includes('vimeo.com')

  const sectionStyle = { padding: '40px 28px', borderBottom: `1px solid ${T.border}`, background: T.bg }
  const tagStyle     = { fontSize: '9.5px', letterSpacing: '.2em', textTransform: 'uppercase' as const, fontFamily: 'DM Mono, monospace', color: ac, marginBottom: '10px', opacity: .85 }
  const h2Style      = { fontFamily: T.font, fontSize: '27px', fontWeight: 400, marginBottom: '12px', color: T.text, lineHeight: 1.1 }
  const bodyStyle    = { fontSize: '14px', lineHeight: 1.85, color: T.text2 }

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Outfit', sans-serif", minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '56px 24px 44px', position: 'relative', overflow: 'hidden', background: T.bg }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${ac}0a, transparent 65%)` }} />
        <div style={{ ...tagStyle, position: 'relative' }}>Compositore · Musica Originale</div>
        <h1 style={{ fontFamily: T.font, fontSize: 'clamp(30px, 5vw, 58px)', fontWeight: 300, lineHeight: 1.06, marginBottom: '16px', position: 'relative', color: T.text }}>
          {portfolio.title}
        </h1>
        <div style={{ height: '1px', width: '44px', background: ac, margin: '0 auto 16px' }} />
        <p style={{ ...bodyStyle, maxWidth: '440px', margin: '0 auto 28px', position: 'relative' }}>{portfolio.description}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <button
            style={{ padding: '11px 26px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', background: ac, color: '#09090f', fontFamily: 'Outfit, sans-serif' }}
            onClick={() => document.getElementById('sf-audio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ▶ Ascolta
          </button>
          <button
            style={{ padding: '11px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif' }}
            onClick={() => document.getElementById('sf-contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contattami
          </button>
        </div>
      </div>

      {/* BIO */}
      {portfolio.bio && (
        <div style={sectionStyle}>
          <div style={tagStyle}>Chi sono</div>
          <h2 style={h2Style}>Andrea Pagliara</h2>
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
                <div style={{ height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', opacity: .55, background: T.bg3 }}>
                  {p.emoji}
                </div>
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
              <AudioPlayer key={t.id} track={t} accentColor={ac} theme={portfolio.theme as 'dark'|'ivory'|'neon'} />
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
              <div
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', borderRadius: '10px' }}
                onClick={() => window.open(portfolio.video_url?.replace('/embed/', '/watch?v=') ?? '', '_blank')}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${ac}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: ac }}>▶</div>
                <div style={{ fontSize: '13px', color: T.text2 }}>Clicca per riprodurre</div>
              </div>
            ) : (
              <iframe
                src={portfolio.video_url!}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '10px' }}
              />
            )}
          </div>
        </div>
      )}

      {/* CONTACT */}
      <div id="sf-contact" style={{ padding: '50px 28px', textAlign: 'center', background: T.bg }}>
        <div style={tagStyle}>Lavoriamo insieme</div>
        <h2 style={{ ...h2Style, textAlign: 'center' }}>Contattami</h2>
        <p style={{ ...bodyStyle, maxWidth: '400px', margin: '0 auto 24px' }}>
          Disponibile per nuovi progetti cinematografici, musicali e teatrali. Scrivimi per discutere la tua visione.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✉ Email', 'in LinkedIn', '♪ Spotify'].map(s => (
            <button key={s} style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, fontFamily: 'Outfit, sans-serif', transition: 'all .15s' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '14px 24px', textAlign: 'center', fontSize: '10.5px', fontFamily: 'DM Mono, monospace', color: T.text3, borderTop: `1px solid ${T.border}`, background: T.bg }}>
        © {new Date().getFullYear()} Andrea Pagliara · Powered by ScoreForge
      </div>
    </div>
  )
}
