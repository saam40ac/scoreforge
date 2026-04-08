'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copiato negli appunti!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossibile copiare il link')
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copia link: ${url}`}
      className="btn btn-outline btn-sm"
      style={{ color: copied ? '#4bb87a' : undefined, borderColor: copied ? '#4bb87a44' : undefined }}
    >
      {copied ? <Check size={12} /> : <Share2 size={12} />}
    </button>
  )
}
