import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'ScoreForge — Composer Portfolio Platform',
  description: 'La piattaforma per i compositori di musiche originali.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111118',
              border: '1px solid #2a2830',
              color: '#f0ebe0',
            },
          }}
        />
      </body>
    </html>
  )
}
