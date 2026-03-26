import React from 'react'

interface LogoProps {
  variant?: 'sidebar' | 'topbar' | 'login' | 'icon'
  theme?: 'dark' | 'light'
  className?: string
}

// ── Colori per tema ───────────────────────────────────────
const C = {
  dark:  { arc1: '#e2c47e', arc2: '#c8a45a', text: '#f0ebe0', forge: '#c8a45a', line: '#2a2830', dash: '#c8a45a' },
  light: { arc1: '#8a6020', arc2: '#a07830', text: '#1a1612', forge: '#a07830', line: '#e0dcd4', dash: '#a07830' },
}

// ── Icona S (riutilizzabile a qualsiasi scala) ────────────
function SIcon({ w, h, strokeW, c }: { w: number; h: number; strokeW: number; c: typeof C.dark }) {
  // La S occupa uno spazio w×h con proporzione 3:4
  const cx = w / 2
  const cy = h / 2
  const s  = Math.min(w, h)
  const sw = strokeW

  // Punti costruttivi della S
  const topRight  = cx + s * 0.28
  const botLeft   = cx - s * 0.28
  const midY      = cy
  const arcTopY   = cy - s * 0.32
  const arcBotY   = cy + s * 0.32

  return (
    <>
      {/* Arco superiore */}
      <path
        d={`M ${cx} ${arcTopY} Q ${topRight} ${arcTopY - s * 0.04} ${topRight} ${midY - s * 0.22} Q ${topRight} ${midY} ${cx} ${midY}`}
        fill="none" stroke={c.arc1} strokeWidth={sw} strokeLinecap="round"
      />
      {/* Arco inferiore */}
      <path
        d={`M ${cx} ${midY} Q ${botLeft} ${midY} ${botLeft} ${midY + s * 0.22} Q ${botLeft} ${arcBotY + s * 0.04} ${cx} ${arcBotY}`}
        fill="none" stroke={c.arc2} strokeWidth={sw} strokeLinecap="round"
      />
      {/* Tratto centrale orizzontale */}
      <line x1={botLeft} y1={midY} x2={topRight} y2={midY} stroke={c.arc1} strokeWidth={sw} strokeLinecap="round" />
    </>
  )
}

// ── VARIANTE: Sidebar ─────────────────────────────────────
function LogoSidebar({ c }: { c: typeof C.dark }) {
  return (
    <svg width="158" height="38" viewBox="0 0 158 38" xmlns="http://www.w3.org/2000/svg">
      {/* Icona S */}
      <path d="M24,4 Q34,3 34,11 Q34,19 24,19" fill="none" stroke={c.arc1} strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M14,19 Q4,19 4,27 Q4,35 14,34" fill="none" stroke={c.arc2} strokeWidth="2.6" strokeLinecap="round"/>
      <line x1="14" y1="19" x2="24" y2="19" stroke={c.arc1} strokeWidth="2.6" strokeLinecap="round"/>
      {/* Trattini partitura */}
      <line x1="1" y1="11" x2="6" y2="11" stroke={c.dash} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      <line x1="1" y1="15" x2="6" y2="15" stroke={c.dash} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      <line x1="32" y1="23" x2="37" y2="23" stroke={c.dash} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      <line x1="32" y1="27" x2="37" y2="27" stroke={c.dash} strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      {/* Wordmark */}
      <text x="48" y="17" fontFamily="'Cormorant Garamond', serif" fontSize="18" fontWeight="300" fill={c.text} letterSpacing="2">SCORE</text>
      <line x1="48" y1="22" x2="146" y2="22" stroke={c.line} strokeWidth="0.5"/>
      <text x="49" y="34" fontFamily="'Outfit', sans-serif" fontSize="8" fontWeight="500" fill={c.forge} letterSpacing="6.5">FORGE</text>
    </svg>
  )
}

// ── VARIANTE: Topbar ──────────────────────────────────────
function LogoTopbar({ c }: { c: typeof C.dark }) {
  return (
    <svg width="110" height="28" viewBox="0 0 110 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M17,3 Q25,2 25,9 Q25,16 17,16" fill="none" stroke={c.arc1} strokeWidth="2.1" strokeLinecap="round"/>
      <path d="M9,16 Q1,16 1,22 Q1,28 9,27" fill="none" stroke={c.arc2} strokeWidth="2.1" strokeLinecap="round"/>
      <line x1="9" y1="16" x2="17" y2="16" stroke={c.arc1} strokeWidth="2.1" strokeLinecap="round"/>
      <line x1="0" y1="8" x2="4" y2="8" stroke={c.dash} strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
      <line x1="0" y1="11.5" x2="4" y2="11.5" stroke={c.dash} strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
      <line x1="22" y1="19" x2="26" y2="19" stroke={c.dash} strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
      <line x1="22" y1="22.5" x2="26" y2="22.5" stroke={c.dash} strokeWidth="0.9" opacity="0.4" strokeLinecap="round"/>
      <text x="35" y="13" fontFamily="'Cormorant Garamond', serif" fontSize="14" fontWeight="300" fill={c.text} letterSpacing="2">SCORE</text>
      <line x1="35" y1="17.5" x2="102" y2="17.5" stroke={c.line} strokeWidth="0.5"/>
      <text x="36" y="26" fontFamily="'Outfit', sans-serif" fontSize="7.5" fontWeight="500" fill={c.forge} letterSpacing="5.5">FORGE</text>
    </svg>
  )
}

// ── VARIANTE: Login (icona grande + wordmark) ─────────────
function LogoLogin({ c }: { c: typeof C.dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="80" height="72" viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg">
        <path d="M52,6 Q72,4 72,20 Q72,36 52,36" fill="none" stroke={c.arc1} strokeWidth="4.5" strokeLinecap="round"/>
        <path d="M28,36 Q8,36 8,52 Q8,68 28,66" fill="none" stroke={c.arc2} strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="28" y1="36" x2="52" y2="36" stroke={c.arc1} strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="2" y1="20" x2="12" y2="20" stroke={c.dash} strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
        <line x1="2" y1="27" x2="12" y2="27" stroke={c.dash} strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
        <line x1="68" y1="46" x2="78" y2="46" stroke={c.dash} strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
        <line x1="68" y1="53" x2="78" y2="53" stroke={c.dash} strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 300, color: c.text, letterSpacing: '4px' }}>
          SCORE<span style={{ color: c.forge, fontWeight: 600 }}>FORGE</span>
        </div>
        <div style={{ width: '120px', height: '0.5px', background: c.line }} />
        <div style={{ fontSize: '8px', color: c.dash, opacity: 0.5, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
          Composer Portfolio Platform
        </div>
      </div>
    </div>
  )
}

// ── VARIANTE: Solo icona (favicon/avatar) ─────────────────
function LogoIcon({ c, size = 32 }: { c: typeof C.dark; size?: number }) {
  const v = size + 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${v} ${v}`} xmlns="http://www.w3.org/2000/svg">
      <path d={`M ${v*0.6},${v*0.08} Q ${v*0.92},${v*0.04} ${v*0.92},${v*0.36} Q ${v*0.92},${v*0.6} ${v*0.6},${v*0.6}`} fill="none" stroke={c.arc1} strokeWidth={v*0.09} strokeLinecap="round"/>
      <path d={`M ${v*0.4},${v*0.6} Q ${v*0.08},${v*0.6} ${v*0.08},${v*0.78} Q ${v*0.08},${v*0.97} ${v*0.4},${v*0.94}`} fill="none" stroke={c.arc2} strokeWidth={v*0.09} strokeLinecap="round"/>
      <line x1={v*0.4} y1={v*0.6} x2={v*0.6} y2={v*0.6} stroke={c.arc1} strokeWidth={v*0.09} strokeLinecap="round"/>
    </svg>
  )
}

// ── ESPORTAZIONE PRINCIPALE ───────────────────────────────
export default function Logo({ variant = 'sidebar', theme = 'dark', className }: LogoProps) {
  const c = C[theme]
  return (
    <div className={className}>
      {variant === 'sidebar'  && <LogoSidebar  c={c} />}
      {variant === 'topbar'   && <LogoTopbar   c={c} />}
      {variant === 'login'    && <LogoLogin    c={c} />}
      {variant === 'icon'     && <LogoIcon     c={c} />}
    </div>
  )
}

export { LogoIcon, LogoSidebar, LogoTopbar, LogoLogin }
