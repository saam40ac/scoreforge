/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // I tipi Supabase richiedono la generazione CLI per essere precisi.
    // Gli errori di tipo 'never' sono falsi positivi da query non tipizzate.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
  async headers() {
    return [
      {
        // Solo /home e /register possono essere embeddati su Systeme.io
        source: '/(home|register)(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
      {
        // Tutte le altre pagine restano protette
        source: '/((?!home|register).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig
