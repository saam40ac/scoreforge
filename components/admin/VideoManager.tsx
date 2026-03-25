'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, Upload, Youtube, Film } from 'lucide-react'

interface VideoEntry {
  type: 'embed' | 'upload'
  url: string
  label: string
}

interface Props {
  portfolioId: string
  userId: string
  // URL embed principale (campo legacy mantenuto per compatibilità)
  videoUrl: string
  setVideoUrl: (v: string) => void
  // Array video aggiuntivi
  videoUrls: string[]
  setVideoUrls: (v: string[]) => void
}

export default function VideoManager({ portfolioId, userId, videoUrl, setVideoUrl, videoUrls, setVideoUrls }: Props) {
  const supabase  = createClient()
  const [uploading, setUploading] = useState(false)
  const [newEmbed,  setNewEmbed]  = useState('')

  // Tutti i video come lista unificata (principale + aggiuntivi)
  const allVideos: VideoEntry[] = [
    ...(videoUrl ? [{ type: 'embed' as const, url: videoUrl, label: 'Video principale' }] : []),
    ...videoUrls.map((u, i) => ({
      type: u.startsWith('http') && (u.includes('youtube') || u.includes('vimeo')) ? 'embed' as const : 'upload' as const,
      url: u,
      label: `Video ${i + 2}`,
    })),
  ]

  function addEmbed() {
    if (!newEmbed.trim()) return
    const url = newEmbed.trim()
    if (!videoUrl) {
      setVideoUrl(url)
    } else {
      setVideoUrls([...videoUrls, url])
    }
    setNewEmbed('')
    toast.success('Video aggiunto!')
  }

  function removeVideo(idx: number) {
    if (idx === 0 && videoUrl) {
      // Rimuovi il principale, promuovi il primo aggiuntivo
      setVideoUrl(videoUrls[0] || '')
      setVideoUrls(videoUrls.slice(1))
    } else {
      const adjustedIdx = videoUrl ? idx - 1 : idx
      setVideoUrls(videoUrls.filter((_, i) => i !== adjustedIdx))
    }
    toast.success('Video rimosso.')
  }

  // Upload video diretto su Supabase Storage
  const onDrop = useCallback(async (accepted: File[]) => {
    for (const file of accepted) {
      if (file.size > 200 * 1024 * 1024) {
        toast.error(`"${file.name}" supera i 200 MB. Usa YouTube/Vimeo per video più grandi.`)
        continue
      }
      setUploading(true)
      const path = `${userId}/${portfolioId}/videos/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('scoreforge-media')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) { toast.error(`Errore upload: ${file.name}`); setUploading(false); continue }

      const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)

      // Salva in media_files
      await supabase.from('media_files').insert({
        owner_id: userId, file_name: file.name, file_url: urlData.publicUrl,
        file_size: file.size, mime_type: file.type, media_type: 'video', storage_path: data.path,
      })

      if (!videoUrl) {
        setVideoUrl(urlData.publicUrl)
      } else {
        setVideoUrls(prev => [...prev, urlData.publicUrl])
      }
      toast.success(`"${file.name}" caricato!`)
      setUploading(false)
    }
  }, [portfolioId, userId, videoUrl, videoUrls, supabase, setVideoUrl, setVideoUrls])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxSize: 200 * 1024 * 1024,
    multiple: true,
  })

  function isYouTube(url: string) { return url.includes('youtube') || url.includes('youtu.be') }
  function isVimeo(url: string)   { return url.includes('vimeo') }
  function getThumb(url: string)  {
    const ytId = url.match(/embed\/([^?]+)/)?.[1] || url.match(/v=([^&]+)/)?.[1]
    if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
    return null
  }

  return (
    <div className="space-y-5">
      {/* Lista video esistenti */}
      {allVideos.length > 0 && (
        <div className="space-y-2">
          <label className="field-label">Video caricati ({allVideos.length})</label>
          {allVideos.map((v, i) => {
            const thumb = getThumb(v.url)
            return (
              <div key={i} className="flex items-center gap-3 bg-[#17171f] border border-[#2a2830] rounded-xl p-3">
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#09090f] flex-shrink-0 flex items-center justify-center border border-[#2a2830]">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Film size={18} className="text-[#5a5548]" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#a09888] truncate">
                    {v.label}
                    {i === 0 && <span className="ml-2 text-[9px] font-mono text-[#c8a45a] bg-[#c8a45a]/10 px-1.5 py-0.5 rounded">principale</span>}
                  </div>
                  <div className="text-[10px] font-mono text-[#5a5548] truncate mt-0.5">{v.url}</div>
                  <div className="text-[9px] text-[#5a5548] mt-0.5">
                    {isYouTube(v.url) ? '▶ YouTube' : isVimeo(v.url) ? '▶ Vimeo' : '📁 File caricato'}
                  </div>
                </div>
                <button onClick={() => removeVideo(i)} className="btn btn-ghost btn-sm btn-icon text-[#5a5548] hover:text-[#c94b4b] flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Aggiungi embed YouTube/Vimeo */}
      <div>
        <label className="field-label">Aggiungi video da YouTube o Vimeo</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5548]" />
            <input
              className="field-input pl-8"
              value={newEmbed}
              onChange={e => setNewEmbed(e.target.value)}
              placeholder="https://www.youtube.com/embed/ID_VIDEO"
              onKeyDown={e => e.key === 'Enter' && addEmbed()}
            />
          </div>
          <button onClick={addEmbed} disabled={!newEmbed.trim()} className="btn btn-outline disabled:opacity-40">
            <Plus size={14} /> Aggiungi
          </button>
        </div>
        <p className="field-hint">Su YouTube: clicca <strong className="text-[#a09888]">Condividi → Incorpora</strong> e copia l'URL dal campo <code className="text-[#c8a45a] text-[10px]">src="..."</code></p>
      </div>

      {/* Upload video diretto */}
      <div>
        <label className="field-label">Oppure carica un video direttamente</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-[#c8a45a] bg-[#c8a45a]/5' : 'border-[#3a3648] hover:border-[#c8a45a]/50 hover:bg-[#17171f]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={22} className="mx-auto mb-2 text-[#5a5548]" />
          <p className="text-sm text-[#a09888]">
            {uploading ? 'Upload in corso…' : <><span className="text-[#c8a45a] font-medium">Clicca</span> o trascina un file video</>}
          </p>
          <p className="text-xs text-[#5a5548] mt-1">MP4, MOV, WebM · max <strong className="text-[#a09888]">200 MB</strong></p>
          <p className="text-xs text-[#5a5548] mt-0.5">Per video più grandi usa YouTube o Vimeo (consigliato)</p>
        </div>
      </div>
    </div>
  )
}
