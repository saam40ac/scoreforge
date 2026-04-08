'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { LogoIcon, LogoTopbar } from '@/components/brand/Logo'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      style={{
        background: 'var(--sf-bg3)',
        border: '1px solid var(--sf-border)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--sf-text3)',
        transition: 'all .15s',
        fontFamily: 'DM Mono, monospace',
      }}
    >
      <span style={{ fontSize: '14px' }}>{theme === 'dark' ? '☀' : '☾'}</span>
      <span style={{ display: 'none' }} className="sm:inline">
        {theme === 'dark' ? 'Chiaro' : 'Scuro'}
      </span>
    </button>
  )
}

function Shell({ children, userName, userEmail }: {
  children: React.ReactNode
  userName: string
  userEmail: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--sf-bg)' }}>

      {/* Sidebar desktop */}
      <div className="hidden lg:block" style={{ width: '244px', flexShrink: 0 }}>
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '244px' }}>
          <Sidebar userName={userName} userEmail={userEmail} />
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }}
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '244px', zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .3s',
        }}
        className="lg:hidden"
      >
        <Sidebar userName={userName} userEmail={userEmail} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: '54px',
          borderBottom: '1px solid var(--sf-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          background: 'var(--sf-topbar)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(8px)',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sf-text2)', padding: '4px' }}
          >
            <Menu size={20} />
          </button>

          {/* Logo mobile — versione con testo */}
          <div className="lg:hidden">
            <svg width="100" height="22" viewBox="0 0 110 24">
              <path d="M16,2 Q22,1.5 22,7 Q22,12.5 16,12.5" fill="none" stroke="var(--sf-gold2, #e2c47e)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10,12.5 Q4,12.5 4,17.5 Q4,22.5 10,22" fill="none" stroke="var(--sf-gold, #c8a45a)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="12.5" x2="16" y2="12.5" stroke="var(--sf-gold2, #e2c47e)" strokeWidth="2" strokeLinecap="round"/>
              <text x="28" y="10" fontFamily="'Cormorant Garamond',serif" fontSize="11" fontWeight="300" fill="var(--sf-text, #f0ebe0)" letterSpacing="1.5">SCORE</text>
              <line x1="28" y1="13" x2="96" y2="13" stroke="var(--sf-border, #2a2830)" strokeWidth="0.4"/>
              <text x="28" y="21" fontFamily="'Outfit',sans-serif" fontSize="6.5" fontWeight="500" fill="var(--sf-gold, #c8a45a)" letterSpacing="3.5">FORGE</text>
            </svg>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Theme toggle — sempre visibile */}
          <ThemeToggle />
        </div>

        <main style={{ flex: 1 }} className="animate-fadein">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminShell({ children, userName, userEmail }: {
  children: React.ReactNode
  userName: string
  userEmail: string
}) {
  return (
    <ThemeProvider>
      <Shell userName={userName} userEmail={userEmail}>
        {children}
      </Shell>
    </ThemeProvider>
  )
}
