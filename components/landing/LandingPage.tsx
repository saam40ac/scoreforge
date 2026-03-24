'use client'

import { useState } from 'react'
import type { PortfolioWithContent, Profile } from '@/lib/supabase/types'
import AudioPlayer from '@/components/player/AudioPlayer'

interface Props {
  portfolio: PortfolioWithContent
  profile: Pick<Profile, 'name' | 'public_email' | 'website' | 'short_bio' | 'avatar_url'>
  preview?: boolean
}

const THEMES = {
  dark:  { bg:'#09090f', bg2:'#111118', bg3:'#17171f', text:'#f0ebe0', text2:'#a09888', text3:'#5a5548', border:'rgba(255,255,255,0.07)' },
  ivory: { bg:'#f5f0e8', bg2:'#ede8df', bg3:'#e5dfd5', text:'#1a1612', text2:'#4a4540', text3:'#9a9590', border:'rgba(0,0,0,0.09)' },
  neon:  { bg:'#060612', bg2:'#0e0e20', bg3:'#14142a', text:'#e8e0f8', text2:'#9890b8', text3:'#4a4870', border:'rgba(148,110,255,0.14)' },
}

// ── Modale contatto ───────────────────────────────────────────
function ContactModal({ open, onClose, accentColor, T, email }: {
  open: boolean; onClose: () => void; accentColor: string
  T: typeof THEMES.dark; email: string
}) {
  const [from,     setFrom]     = useState('')
  const [fromMail, setFromMail] = useState('')
  const [message,  setMessage]  = useState('')
  const [sent,     setSent]     = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Proposta di collaborazione — ${from}`)
    const body    = encodeURIComponent(`Nome: ${from}\nEmail: ${fromMail}\n\n${message}`)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 2500)
  }

  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'440px', position:'relative' }} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', color:T.text3, cursor:'pointer', fontSize:'20px', lineHeight:1 }}>✕</button>
        {sent ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>✓</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'22px', color:T.text }}>Messaggio inviato!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'26px', marginBottom:'4px', color:T.text }}>Scrivimi</div>
            <div style={{ fontSize:'12px', color:T.text3, marginBottom:'24px', fontFamily:'DM Mono,monospace' }}>a {email}</div>
            {[
              { label:'Il tuo nome',  val:from,     set:setFrom,     type:'text'  },
              { label:'La tua email', val:fromMail, set:setFromMail, type:'email' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:'14px' }}>
                <div style={{ fontSize:'10px', color:T.text3, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'DM Mono,monospace', marginBottom:'6px' }}>{f.label}</div>
                <input type={f.type} required value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{ width:'100%', background:T.bg3, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'9px 13px', color:T.text, fontSize:'14px', fontFamily:'Outfit,sans-serif', outline:'none' }} />
              </div>
            ))}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'10px', color:T.text3, textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'DM Mono,monospace', marginBottom:'6px' }}>Messaggio</div>
              <textarea required value={message} onChange={e=>setMessage(e.target.value)} rows={4}
                placeholder="Raccontami del tuo progetto…"
                style={{ width:'100%', background:T.bg3, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'9px 13px', color:T.text, fontSize:'14px', fontFamily:'Outfit,sans-serif', outline:'none', resize:'vertical' }} />
            </div>
            <button type="submit" style={{ width:'100%', padding:'12px', borderRadius:'8px', background:accentColor, color:'#09090f', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>
              Invia messaggio
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Componente principale ─────────────────────────────────────
export default function LandingPage({ portfolio, profile, preview }: Props) {
  const T  = THEMES[portfolio.theme as keyof typeof THEMES] || THEMES.dark
  const ac = portfolio.accent_color || '#c8a45a'
  const [contactOpen, setContactOpen] = useState(false)

  const name     = profile.name         || 'Artista'
  const email    = profile.public_email || ''
  const website  = profile.website      || ''
  const initials = name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0, 2)

  const hasVideo = !!portfolio.video_url?.includes('youtube.com/embed') || !!portfolio.video_url?.includes('vimeo.com')

  // ── Stili comuni ─────────────────────────────────────────────
  // Wrapper centrato con max-width e padding laterale generoso
  const wrap: React.CSSProperties = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 clamp(20px, 5vw, 60px)',
  }
  const sec:  React.CSSProperties = { padding:'48px 0', borderBottom:`1px solid ${T.border}`, background:T.bg }
  const tag:  React.CSSProperties = { fontSize:'9.5px', letterSpacing:'.2em', textTransform:'uppercase', fontFamily:'DM Mono,monospace', color:ac, marginBottom:'10px', opacity:.85 }
  const h2s:  React.CSSProperties = { fontFamily:"'Cormorant Garamond',serif", fontSize:'27px', fontWeight:400, marginBottom:'12px', color:T.text, lineHeight:1.1 }
  const body: React.CSSProperties = { fontSize:'14px', lineHeight:1.85, color:T.text2 }

  return (
    <>
      <ContactModal open={contactOpen} onClose={()=>setContactOpen(false)} accentColor={ac} T={T} email={email} />

      <div style={{ background:T.bg, color:T.text, fontFamily:"'Outfit',sans-serif", minHeight:'100vh' }}>

        {/* ── HEADER ── */}
        <div style={{ background:T.bg2, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ ...wrap, display:'flex', alignItems:'center', gap:'16px', padding:`16px clamp(20px,5vw,60px)` }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={name}
                style={{ width:'52px', height:'52px', borderRadius:'50%', objectFit:'cover', flexShrink:0, border:`2px solid ${ac}40` }} />
            ) : (
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:`linear-gradient(135deg,${ac},${ac}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'19px', fontWeight:600, color:'#09090f', flexShrink:0, border:`2px solid ${ac}40` }}>
                {initials}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'18px', fontWeight:400, color:T.text }}>{name}</div>
              <div style={{ fontSize:'11px', color:T.text3, fontFamily:'DM Mono,monospace', marginTop:'2px' }}>Compositore · Musica Originale</div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
              {email && (
                <button onClick={()=>setContactOpen(true)} style={{ padding:'8px 18px', borderRadius:'6px', background:ac, color:'#09090f', border:'none', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>
                  Contattami
                </button>
              )}
              {website && (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                  style={{ padding:'8px 14px', borderRadius:'6px', background:'transparent', color:T.text3, border:`1px solid ${T.border}`, fontSize:'12px', cursor:'pointer', fontFamily:'DM Mono,monospace', textDecoration:'none', display:'flex', alignItems:'center' }}>
                  🌐
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ background:T.bg, padding:'56px 0 48px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%,${ac}0a,transparent 65%)` }} />
          <div style={{ ...wrap, textAlign:'center', position:'relative' }}>
            <div style={tag}>Portfolio · {portfolio.target || 'Musica Originale'}</div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,5vw,58px)', fontWeight:300, lineHeight:1.06, marginBottom:'16px', color:T.text }}>
              {portfolio.title}
            </h1>
            <div style={{ height:'1px', width:'44px', background:ac, margin:'0 auto 16px' }} />
            <p style={{ ...body, maxWidth:'480px', margin:'0 auto 28px' }}>{portfolio.description}</p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
              {portfolio.tracks.length > 0 && (
                <button style={{ padding:'11px 26px', borderRadius:'6px', fontSize:'14px', fontWeight:500, cursor:'pointer', border:'none', background:ac, color:'#09090f', fontFamily:'Outfit,sans-serif' }}
                  onClick={()=>document.getElementById('sf-audio')?.scrollIntoView({behavior:'smooth'})}>
                  ▶ Ascolta
                </button>
              )}
              {email && (
                <button style={{ padding:'11px 24px', borderRadius:'6px', fontSize:'14px', fontWeight:500, cursor:'pointer', background:'transparent', color:T.text2, border:`1px solid ${T.border}`, fontFamily:'Outfit,sans-serif' }}
                  onClick={()=>setContactOpen(true)}>
                  Scrivimi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BIO con foto artista ── */}
        {portfolio.bio && (
          <div style={{ ...sec }}>
            <div style={wrap}>
              <div style={tag}>Chi sono</div>
              {/* Layout: foto a sinistra + testo a destra su desktop, impilato su mobile */}
              <div style={{ display:'flex', gap:'32px', alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Foto artista */}
                {profile.avatar_url && (
                  <div style={{ flexShrink:0 }}>
                    <img
                      src={profile.avatar_url}
                      alt={name}
                      style={{
                        width: 'clamp(120px, 20vw, 200px)',
                        height: 'clamp(140px, 24vw, 240px)',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: `1px solid ${T.border}`,
                        display: 'block',
                      }}
                    />
                  </div>
                )}
                {/* Testo bio */}
                <div style={{ flex:1, minWidth:'200px' }}>
                  <h2 style={h2s}>{name}</h2>
                  <p style={body}>{portfolio.bio}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROGETTI con copertine ── */}
        {portfolio.projects.length > 0 && (
          <div style={{ ...sec }}>
            <div style={wrap}>
              <div style={tag}>Lavori selezionati</div>
              <h2 style={h2s}>Progetti</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px', marginTop:'16px' }}>
                {portfolio.projects.map(p => (
                  <div key={p.id} style={{ borderRadius:'12px', overflow:'hidden', border:`1px solid ${T.border}`, background:T.bg2, transition:'transform .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-3px)')}
                    onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                    {/* Copertina: immagine reale se presente, altrimenti sfondo colorato con emoji */}
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        style={{ width:'100%', height:'120px', objectFit:'cover', display:'block' }}
                      />
                    ) : (
                      <div style={{ height:'120px', display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${T.bg3},${ac}18)`, position:'relative' }}>
                        <span style={{ fontSize:'36px', opacity:.6 }}>{p.emoji}</span>
                        <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom,transparent 50%,${T.bg2}dd)` }} />
                      </div>
                    )}
                    <div style={{ padding:'10px 13px 13px' }}>
                      <div style={{ fontSize:'13.5px', fontWeight:500, marginBottom:'4px', color:T.text }}>{p.title}</div>
                      <div style={{ fontSize:'10.5px', fontFamily:'DM Mono,monospace', color:ac }}>{p.project_type}</div>
                      {p.description && (
                        <div style={{ fontSize:'12px', color:T.text3, marginTop:'6px', lineHeight:1.5 }}>{p.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIO ── */}
        {portfolio.tracks.length > 0 && (
          <div id="sf-audio" style={{ ...sec }}>
            <div style={wrap}>
              <div style={tag}>Composizioni</div>
              <h2 style={h2s}>Ascolta il mio lavoro</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'14px' }}>
                {portfolio.tracks.map(t => (
                  <AudioPlayer key={t.id} track={t} accentColor={ac} theme={portfolio.theme as 'dark'|'ivory'|'neon'} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEO ── */}
        {hasVideo && (
          <div style={{ ...sec }}>
            <div style={wrap}>
              <div style={tag}>Video</div>
              <h2 style={h2s}>Showreel</h2>
              <div style={{ position:'relative', paddingBottom:'56.25%', height:0, overflow:'hidden', borderRadius:'12px', marginTop:'14px', background:T.bg3 }}>
                {preview ? (
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer' }}
                    onClick={()=>window.open(portfolio.video_url?.replace('/embed/','/watch?v=') ?? '','_blank')}>
                    <div style={{ width:'60px', height:'60px', borderRadius:'50%', border:`2px solid ${ac}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:ac }}>▶</div>
                    <div style={{ fontSize:'13px', color:T.text2 }}>Clicca per riprodurre</div>
                  </div>
                ) : (
                  <iframe src={portfolio.video_url!} allow="autoplay;encrypted-media" allowFullScreen
                    style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0, borderRadius:'12px' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTATTI ── */}
        {email && (
          <div id="sf-contact" style={{ background:T.bg, padding:'56px 0' }}>
            <div style={{ ...wrap, textAlign:'center' }}>
              <div style={tag}>Lavoriamo insieme</div>
              <h2 style={{ ...h2s, textAlign:'center' }}>Contattami</h2>
              <p style={{ ...body, maxWidth:'420px', margin:'0 auto 28px' }}>
                Disponibile per nuovi progetti cinematografici, musicali e teatrali. Scrivimi per discutere la tua visione.
              </p>
              <button onClick={()=>setContactOpen(true)}
                style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 32px', borderRadius:'8px', background:ac, color:'#09090f', border:'none', fontSize:'15px', fontWeight:600, cursor:'pointer', fontFamily:'Outfit,sans-serif', marginBottom:'20px' }}>
                ✉ Invia un messaggio
              </button>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                <a href={`mailto:${email}`}
                  style={{ padding:'8px 18px', borderRadius:'6px', fontSize:'13px', background:'transparent', color:T.text2, border:`1px solid ${T.border}`, fontFamily:'Outfit,sans-serif', textDecoration:'none' }}>
                  ✉ {email}
                </a>
                {website && (
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding:'8px 18px', borderRadius:'6px', fontSize:'13px', background:'transparent', color:T.text2, border:`1px solid ${T.border}`, fontFamily:'Outfit,sans-serif', textDecoration:'none' }}>
                    🌐 {website}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ padding:'18px clamp(20px,5vw,60px)', textAlign:'center', fontSize:'10.5px', fontFamily:'DM Mono,monospace', color:T.text3, borderTop:`1px solid ${T.border}`, background:T.bg }}>
          © {new Date().getFullYear()} {name} · Powered by ScoreForge
        </div>

      </div>
    </>
  )
}
