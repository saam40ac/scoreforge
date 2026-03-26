'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, BarChart2, CreditCard, LogOut, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/admin',           label: 'Overview',    icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Utenti',      icon: Users },
  { href: '/admin/content',   label: 'Contenuti',   icon: FileText },
  { href: '/admin/analytics', label: 'Analytics',   icon: BarChart2 },
  { href: '/admin/plans',     label: 'Piani',       icon: CreditCard },
]

export default function AdminNavbar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ width: '220px', flexShrink: 0, background: '#0a0a12', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo + badge */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#e2c47e', letterSpacing: '2px', marginBottom: '6px' }}>
          SCORE<span style={{ fontWeight: 600 }}>FORGE</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#c94b4b18', border: '1px solid #c94b4b44', borderRadius: '6px', padding: '3px 8px' }}>
          <Shield size={10} color="#c94b4b" />
          <span style={{ fontSize: '9px', color: '#c94b4b', fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>SUPER ADMIN</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflow: 'auto' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '9px 10px', margin: '1px 0', borderRadius: '8px',
              textDecoration: 'none', fontSize: '13.5px',
              background: active ? '#c8a45a18' : 'transparent',
              color: active ? '#e2c47e' : '#5a5548',
              transition: 'all .15s',
            }}>
              <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e1e2e' }}>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#5a5548', fontSize: '12px' }}>
          <LogOut size={13} />
          <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
        </button>
      </div>
    </div>
  )
}
