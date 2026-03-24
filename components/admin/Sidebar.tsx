'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  LayoutDashboard, FolderOpen, Music, User, Settings, LogOut, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/portfolios', label: 'Portfolio',     icon: FolderOpen },
  { href: '/media',     label: 'Media Library',  icon: Music },
  { href: '/bio',       label: 'Biografia',      icon: User },
  { href: '/settings',  label: 'Impostazioni',   icon: Settings },
]

interface SidebarProps {
  userName: string
  userEmail: string
  onClose?: () => void
}

export default function Sidebar({ userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Disconnesso.')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-full bg-[#111118] border-r border-[#2a2830]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-[#2a2830]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c8a45a] to-[#e2c47e] flex items-center justify-center font-serif text-sm font-bold text-[#09090f]">S</div>
            <span className="font-serif text-xl text-[#e2c47e] font-semibold">ScoreForge</span>
          </div>
          <p className="text-[9px] text-[#5a5548] tracking-[0.15em] uppercase font-mono mt-0.5 pl-9">Platform v1.0</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#5a5548] hover:text-[#f0ebe0] transition-colors lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="text-[9px] text-[#5a5548] uppercase tracking-[0.15em] font-mono px-3 py-1 mb-1">Principale</div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] mb-0.5 transition-all duration-150 ${
                active
                  ? 'bg-[#c8a45a]/12 text-[#e2c47e]'
                  : 'text-[#a09888] hover:bg-[#17171f] hover:text-[#f0ebe0]'
              }`}
            >
              <Icon size={15} className={active ? 'opacity-100' : 'opacity-50'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer utente */}
      <div className="p-3 border-t border-[#2a2830]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-[#17171f] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8a45a] to-[#e2c47e] flex items-center justify-center font-serif text-sm font-semibold text-[#09090f] flex-shrink-0">
            {initials || 'A'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-medium text-[#f0ebe0] truncate">{userName || 'Artista'}</div>
            <div className="text-[10.5px] text-[#5a5548] font-mono truncate">{userEmail}</div>
          </div>
          <LogOut size={14} className="text-[#5a5548] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </button>
      </div>
    </aside>
  )
}
