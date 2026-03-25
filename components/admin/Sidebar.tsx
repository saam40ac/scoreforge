'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LayoutDashboard, FolderOpen, Music, User, Settings, LogOut, X, BarChart2 } from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/portfolios', label: 'Portfolio',      icon: FolderOpen },
  { href: '/analytics',  label: 'Analytics',      icon: BarChart2 },
  { href: '/media',      label: 'Media Library',  icon: Music },
  { href: '/bio',        label: 'Biografia',      icon: User },
  { href: '/settings',   label: 'Impostazioni',   icon: Settings },
]

interface Props { userName: string; userEmail: string; onClose?: () => void }

export default function Sidebar({ userName, userEmail, onClose }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Disconnesso.')
    router.push('/login')
    router.refresh()
  }

  const s = {
    aside: {
      display: 'flex', flexDirection: 'column' as const, height: '100%',
      background: 'var(--sf-sidebar)', borderRight: '1px solid var(--sf-border)',
    },
    logo: {
      padding: '22px 20px 16px', borderBottom: '1px solid var(--sf-border)',
    },
    logoMark: {
      display: 'flex', alignItems: 'center', gap: '8px',
      fontFamily: "'Cormorant Garamond', serif", fontSize: '21px',
      color: 'var(--sf-gold2)', fontWeight: 600,
    },
    logoIcon: {
      width: '28px', height: '28px', borderRadius: '7px',
      background: 'linear-gradient(135deg, var(--sf-gold), var(--sf-gold2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 700, color: 'var(--sf-bg)', flexShrink: 0,
    },
    sub: {
      fontSize: '9px', color: 'var(--sf-text3)', letterSpacing: '.15em',
      textTransform: 'uppercase' as const, fontFamily: 'DM Mono, monospace',
      marginTop: '2px', paddingLeft: '36px',
    },
    nav: { padding: '10px 0', flex: 1, overflowY: 'auto' as const },
    sect: {
      padding: '5px 20px 2px', fontSize: '9px', color: 'var(--sf-text3)',
      letterSpacing: '.15em', textTransform: 'uppercase' as const,
      fontFamily: 'DM Mono, monospace', marginTop: '8px',
    },
    foot: { padding: '12px', borderTop: '1px solid var(--sf-border)' },
  }

  return (
    <aside style={s.aside}>
      {/* Logo */}
      <div style={s.logo}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={s.logoMark}>
            <div style={s.logoIcon}>S</div>
            ScoreForge
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sf-text3)', padding: '2px' }} className="lg:hidden">
              <X size={17} />
            </button>
          )}
        </div>
        <div style={s.sub}>Platform v1.0</div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.sect}>Principale</div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '9px 16px', margin: '1px 6px',
                borderRadius: '8px', fontSize: '13.5px',
                color: active ? 'var(--sf-gold2)' : 'var(--sf-text2)',
                background: active ? 'color-mix(in srgb, var(--sf-gold) 12%, transparent)' : 'transparent',
                textDecoration: 'none', transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--sf-bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--sf-text)' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sf-text2)' } }}
            >
              <Icon size={15} style={{ opacity: active ? 1 : 0.5, flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer utente */}
      <div style={s.foot}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px', borderRadius: '8px', background: 'none', border: 'none',
            cursor: 'pointer', transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sf-bg3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--sf-gold), var(--sf-gold2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', serif", fontSize: '13px',
            fontWeight: 600, color: 'var(--sf-bg)',
          }}>
            {initials || 'A'}
          </div>
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--sf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || 'Artista'}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--sf-text3)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
          </div>
          <LogOut size={13} style={{ color: 'var(--sf-text3)', flexShrink: 0, opacity: 0.6 }} />
        </button>
      </div>
    </aside>
  )
}
