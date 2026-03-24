'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface AdminShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
}

export default function AdminShell({ children, userName, userEmail }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#09090f]">
      {/* Sidebar desktop */}
      <div className="hidden lg:block w-[244px] flex-shrink-0">
        <div className="fixed top-0 left-0 bottom-0 w-[244px]">
          <Sidebar userName={userName} userEmail={userEmail} />
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div className={`fixed top-0 left-0 bottom-0 w-[244px] z-50 transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar userName={userName} userEmail={userEmail} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#2a2830] bg-[#09090f] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#a09888] hover:text-[#f0ebe0] transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-lg text-[#e2c47e]">ScoreForge</span>
        </div>

        <main className="flex-1 animate-fadein">
          {children}
        </main>
      </div>
    </div>
  )
}
