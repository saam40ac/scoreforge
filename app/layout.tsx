import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'ScoreForge — Artist Portfolio Platform',
  description: 'La piattaforma portfolio per artisti creativi.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: { url: '/apple-icon.svg', type: 'image/svg+xml' },
  },
}

// Bug 15 fix: viewport corretto per mobile — elimina lo zoom automatico
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#07070d' },
    { media: '(prefers-color-scheme: light)', color: '#f5f0e8' },
  ],
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
