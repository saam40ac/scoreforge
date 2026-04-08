'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
  isAutomatic: boolean
}>({ theme: 'dark', toggle: () => {}, isAutomatic: true })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,       setTheme]       = useState<Theme>('dark')
  const [isAutomatic, setIsAutomatic] = useState(true)

  useEffect(() => {
    const saved   = localStorage.getItem('sf_theme') as Theme | null
    const osDark  = window.matchMedia('(prefers-color-scheme: dark)').matches
    const osTheme = osDark ? 'dark' : 'light'

    // Priorità: 1) preferenza salvata manualmente, 2) sistema operativo
    const initial = saved || osTheme
    setTheme(initial)
    setIsAutomatic(!saved)
    document.documentElement.setAttribute('data-theme', initial)

    // Ascolta i cambiamenti del tema OS (solo se l'utente non ha scelto manualmente)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleOsChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('sf_theme')) {
        const next = e.matches ? 'dark' : 'light'
        setTheme(next)
        setIsAutomatic(true)
        document.documentElement.setAttribute('data-theme', next)
      }
    }
    mq.addEventListener('change', handleOsChange)
    return () => mq.removeEventListener('change', handleOsChange)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setIsAutomatic(false)
    localStorage.setItem('sf_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isAutomatic }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
