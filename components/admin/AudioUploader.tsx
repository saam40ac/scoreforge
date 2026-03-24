'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Music, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadedFile {
  name: string
  size: number
  progress: number
  done: boolean
  error?: string
  url?: string
}

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AudioUploader({ portfolioId, userId }: { portfolioId: string; userId: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const supabase = createClient()
  const router   = useRouter()

  const onDrop = useCallback(async (accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map(f => ({ name: f.name, size: f.size, progress: 0, done: false }))
    setFiles(prev => [...prev, ...newFiles])

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i]
      const idx  = files.length + i
      const path = `${userId}/${portfolioId}/${Date.now()}-${file.name}`

      // Upload su Supabase Storage
      const { data, error } = await supabase.storage
        .from('scoreforge-media')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        setFiles(prev => prev.map((f, fi) => fi === idx ? { ...f, error: error.message, progress: 0 } : f))
        toast.error(`Errore upload: ${file.name}`)
        continue
      }

      const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
      const publicUrl = urlData.publicUrl

      // Salva traccia nel DB
      await supabase.from('tracks').insert({
        portfolio_id: portfolioId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        genre: 'Score',
        file_url: publicUrl,
        sort_order: 99,
      })

      // Salva riferimento nella media library
      await supabase.from('media_files').insert({
        owner_id: userId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        media_type: 'audio',
        storage_path: data.path,
      })

      setFiles(prev => prev.map((f, fi) => fi === idx ? { ...f, progress: 100, done: true, url: publicUrl } : f))
      toast.success(`"${file.name}" caricato!`)
    }

    router.refresh()
  }, [files.length, portfolioId, userId, supabase, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aiff', '.m4a', '.ogg'] },
    maxSize: 100 * 1024 * 1024, // 100 MB
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-[#c8a45a] bg-[#c8a45a]/5'
            : 'border-[#3a3648] hover:border-[#c8a45a]/50 hover:bg-[#17171f]'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={28} className="mx-auto mb-3 text-[#5a5548]" />
        <p className="text-sm text-[#a09888]">
          <span className="text-[#c8a45a] font-medium">Clicca per caricare</span> o trascina i file audio
        </p>
        <p className="text-xs text-[#5a5548] mt-1">MP3, WAV, FLAC, AIFF · max 100 MB per file</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#17171f] border border-[#2a2830] rounded-lg px-3 py-2.5">
              {f.done
                ? <Check size={14} className="text-green-400 flex-shrink-0" />
                : f.error
                  ? <X size={14} className="text-red-400 flex-shrink-0" />
                  : <Music size={14} className="text-[#5a5548] flex-shrink-0 animate-pulse" />
              }
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-[#a09888] truncate">{f.name}</div>
                <div className="text-[10px] text-[#5a5548]">{fmtSize(f.size)}</div>
                {!f.done && !f.error && (
                  <div className="h-0.5 bg-[#2a2830] rounded mt-1">
                    <div className="h-full bg-[#c8a45a] rounded animate-pulse" style={{ width: `${f.progress || 60}%` }} />
                  </div>
                )}
                {f.error && <div className="text-[10px] text-red-400 mt-0.5">{f.error}</div>}
              </div>
              <span className="text-[10px] font-mono text-[#5a5548] flex-shrink-0">
                {f.done ? '✓ ok' : f.error ? 'errore' : 'upload…'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
