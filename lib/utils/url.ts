export function portfolioUrl(slug: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.scoreforge.it')
  ).replace(/\/+$/, '')
  return `${base}/${slug}`
}

export function absoluteUrl(path: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.scoreforge.it')
  ).replace(/\/+$/, '')
  return `${base}${path.startsWith('/') ? path : '/' + path}`
}
