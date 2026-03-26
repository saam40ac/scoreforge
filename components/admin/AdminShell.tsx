'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { LogoIcon } from '@/components/brand/Logo'
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

          {/* Logo mobile */}
          <div className="lg:hidden">
            <LogoIcon c={{
              arc1: 'var(--sf-gold2, #e2c47e)',
              arc2: 'var(--sf-gold, #c8a45a)',
              text: 'var(--sf-text)',
              forge: 'var(--sf-gold)',
              line: 'var(--sf-border)',
              dash: 'var(--sf-gold)',
            }} size={28} />
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
