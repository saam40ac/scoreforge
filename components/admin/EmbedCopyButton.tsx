'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function EmbedCopyButton({ embedCode }: { embedCode: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button onClick={copy} className={`btn btn-sm flex items-center gap-2 transition-all ${copied ? 'btn-gold' : 'btn-outline'}`}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiato!' : 'Copia embed'}
    </button>
  )
}
