/**
 * Restituisce l'URL base dell'app senza slash finale.
 * Gestisce il caso in cui NEXT_PUBLIC_APP_URL abbia uno slash finale.
 */
export function appUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return base.replace(/\/+$/, '') // rimuove tutti gli slash finali
}

/**
 * Costruisce l'URL pubblico di un portfolio.
 * Es: https://scoreforge-zeta.vercel.app/orchestral
 */
export function portfolioUrl(slug: string): string {
  return `${appUrl()}/${slug}`
}
