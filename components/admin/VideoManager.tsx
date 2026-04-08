'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, Upload, Film, Loader2 } from 'lucide-react'

interface VideoEntry {
  url: string
  label: string
  isEmbed: boolean
}

interface Props {
  portfolioId: string
  userId: string
  videoUrl: string
  setVideoUrl: (v: string) => void
  videoUrls: string[]
  setVideoUrls: (v: string[]) => void
}

export default function VideoManager({
  portfolioId, userId, videoUrl, setVideoUrl, videoUrls, setVideoUrls
}: Props) {
  const supabase         = createClient()
  const [uploading,  setUploading]  = useState(false)
  const [uploadPct,  setUploadPct]  = useState(0)
  const [savingEmbed,setSavingEmbed]= useState(false)
  const [newEmbed,   setNewEmbed]   = useState('')

  const isNew = !portfolioId || portfolioId === 'new'

  // Lista unificata di tutti i video
  const allVideos: VideoEntry[] = [
    ...(videoUrl ? [{ url: videoUrl, label: 'Video principale', isEmbed: !videoUrl.includes('supabase') }] : []),
    ...videoUrls.map((u, i) => ({
      url: u,
      label: `Video ${i + 2}`,
      isEmbed: u.includes('youtube') || u.includes('vimeo'),
    })),
  ]

  // ── Salva video_url e video_urls direttamente nel DB ─────────
  async function persistVideos(newVideoUrl: string, newVideoUrls: string[]) {
    if (isNew) return // portfolio non ancora salvato, lo stato basterà
    const { error } = await supabase
      .from('portfolios')
      .update({ video_url: newVideoUrl, video_urls: newVideoUrls })
      .eq('id', portfolioId)
    if (error) {
      toast.error('Errore nel salvataggio video: ' + error.message)
      return false
    }
    return true
  }

  // ── Aggiungi link embed ───────────────────────────────────────
  async function addEmbed() {
    const url = newEmbed.trim()
    if (!url) return
    if (!url.includes('youtube') && !url.includes('vimeo')) {
      toast.error('Incolla un URL embed di YouTube o Vimeo valido.')
      return
    }
    setSavingEmbed(true)
    let nextUrl  = videoUrl
    let nextUrls = [...videoUrls]
    if (!videoUrl) {
      nextUrl = url
    } else {
      nextUrls = [...videoUrls, url]
    }
    const ok = await persistVideos(nextUrl, nextUrls)
    if (ok !== false) {
      setVideoUrl(nextUrl)
      setVideoUrls(nextUrls)
      setNewEmbed('')
      toast.success('Video aggiunto e salvato!')
    }
    setSavingEmbed(false)
  }

  // ── Rimuovi video ─────────────────────────────────────────────
  async function removeVideo(idx: number) {
    let nextUrl  = videoUrl
    let nextUrls = [...videoUrls]
    if (idx === 0 && videoUrl) {
      nextUrl  = videoUrls[0] || ''
      nextUrls = videoUrls.slice(1)
    } else {
      const adj = videoUrl ? idx - 1 : idx
      nextUrls = videoUrls.filter((_, i) => i !== adj)
    }
    const ok = await persistVideos(nextUrl, nextUrls)
    if (ok !== false) {
      setVideoUrl(nextUrl)
      setVideoUrls(nextUrls)
      toast.success('Video rimosso.')
    }
  }

  // ── Upload diretto ────────────────────────────────────────────
  const onDrop = useCallback(async (accepted: File[]) => {
    if (isNew) {
      toast.error('Salva prima il portfolio, poi carica i video.')
      return
    }
    for (const file of accepted) {
      // Limite upload diretto: 200 MB per file
      if (file.size > 200 * 1024 * 1024) {
        toast.error(`"${file.name}" supera 200 MB. Per video più grandi usa YouTube o Vimeo.`)
        continue
      }
      setUploading(true)
      setUploadPct(0)

      const path = `${userId}/${portfolioId}/videos/${Date.now()}-${file.name}`

      // Simula progresso (Supabase JS non espone progress nativo)
      const progressInterval = setInterval(() => {
        setUploadPct(p => Math.min(p + 8, 85))
      }, 400)

      const { data, error } = await supabase.storage
        .from('scoreforge-media')
        .upload(path, file, { cacheControl: '3600', upsert: true })

      clearInterval(progressInterval)

      if (error) {
        toast.error(`Errore upload "${file.name}": ${error.message}`)
        setUploading(false)
        setUploadPct(0)
        continue
      }

      setUploadPct(95)
      const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
      const publicUrl = urlData.publicUrl

      // Salva in media_files
      await supabase.from('media_files').insert({
        owner_id: userId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        media_type: 'video',
        storage_path: data.path,
      })

      // Salva nel portfolio
      let nextUrl  = videoUrl
      let nextUrls = [...videoUrls]
      if (!videoUrl) {
        nextUrl = publicUrl
      } else {
        nextUrls = [...videoUrls, publicUrl]
      }
      const ok = await persistVideos(nextUrl, nextUrls)
      if (ok !== false) {
        setVideoUrl(nextUrl)
        setVideoUrls(nextUrls)
      }

      setUploadPct(100)
      setTimeout(() => { setUploadPct(0); setUploading(false) }, 800)
      toast.success(`"${file.name}" caricato!`)
    }
  }, [portfolioId, userId, videoUrl, videoUrls, isNew, supabase, setVideoUrl, setVideoUrls])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxSize: 200 * 1024 * 1024,
    multiple: true,
  })

  function getYouTubeThumb(url: string) {
    const id = url.match(/embed\/([^?&/]+)/)?.[1] || url.match(/v=([^&]+)/)?.[1]
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
  }

  // Mostra solo il nome del file per gli URL lunghi di Supabase Storage
  function displayUrl(url: string) {
    if (url.includes('supabase.co/storage')) {
      const filename = decodeURIComponent(url.split('/').pop() || url)
      return filename.length > 48 ? filename.slice(0, 45) + '…' : filename
    }
    if (url.length > 60) return url.slice(0, 57) + '…'
    return url
  }

  return (
    <div className="space-y-6">

      {/* Avviso se portfolio non ancora salvato */}
      {isNew && (
        <div className="bg-[#c8a45a]/10 border border-[#c8a45a]/30 rounded-xl px-4 py-3 text-sm text-[#e2c47e]">
          ⚠️ Salva prima il portfolio (tab Generale), poi torna qui per aggiungere i video.
        </div>
      )}

      {/* Lista video caricati */}
      {allVideos.length > 0 && (
        <div>
          <label className="field-label mb-3">Video caricati ({allVideos.length})</label>
          <div className="space-y-2">
            {allVideos.map((v, i) => {
              const thumb = v.isEmbed ? getYouTubeThumb(v.url) : null
              return (
                <div key={i} className="flex items-center gap-3 bg-[#17171f] border border-[#2a2830] rounded-xl p-3">
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#09090f] flex-shrink-0 flex items-center justify-center border border-[#2a2830]">
                    {thumb
                      ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                      : <Film size={18} className="text-[#5a5548]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#a09888]">{v.label}</span>
                      {i === 0 && (
                        <span className="text-[9px] font-mono text-[#c8a45a] bg-[#c8a45a]/10 border border-[#c8a45a]/25 px-1.5 py-0.5 rounded">
                          principale
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#5a5548] truncate mt-0.5" title={v.url}>{displayUrl(v.url)}</div>
                    <div className="text-[9px] text-[#5a5548] mt-0.5">
                      {v.isEmbed
                        ? (v.url.includes('youtube') ? '▶ YouTube embed' : '▶ Vimeo embed')
                        : '📁 File caricato in piattaforma'
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => removeVideo(i)}
                    className="btn btn-ghost btn-sm btn-icon text-[#5a5548] hover:text-[#c94b4b] flex-shrink-0"
                    title="Rimuovi video"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Aggiungi link embed */}
      <div>
        <label className="field-label">Aggiungi da YouTube o Vimeo</label>
        <div className="flex gap-2">
          <input
            className="field-input flex-1 font-mono text-xs"
            value={newEmbed}
            onChange={e => setNewEmbed(e.target.value)}
            placeholder="https://www.youtube.com/embed/ID_VIDEO"
            onKeyDown={e => e.key === 'Enter' && !savingEmbed && addEmbed()}
            disabled={savingEmbed || isNew}
          />
          <button
            onClick={addEmbed}
            disabled={!newEmbed.trim() || savingEmbed || isNew}
            className="btn btn-outline disabled:opacity-40 flex-shrink-0"
          >
            {savingEmbed ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {savingEmbed ? 'Salvo…' : 'Aggiungi'}
          </button>
        </div>
        <p className="field-hint">
          Su YouTube: <strong className="text-[#a09888]">Condividi → Incorpora</strong> → copia solo l'URL dentro <code className="text-[#c8a45a] text-[10px]">src="..."</code>
          <br />Esempio: <code className="text-[#c8a45a] text-[10px]">https://www.youtube.com/embed/dQw4w9WgXcQ</code>
        </p>
      </div>

      {/* Upload diretto */}
      <div>
        <label className="field-label">Oppure carica un video direttamente</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-[#c8a45a] bg-[#c8a45a]/5'
              : uploading
                ? 'border-[#3a3648] cursor-not-allowed'
                : isNew
                  ? 'border-[#2a2830] opacity-40 cursor-not-allowed'
                  : 'border-[#3a3648] hover:border-[#c8a45a]/50 hover:bg-[#17171f]'
          }`}
        >
          <input {...getInputProps()} disabled={uploading || isNew} />
          {uploading ? (
            <div>
              <Loader2 size={24} className="mx-auto mb-3 text-[#c8a45a] animate-spin" />
              <p className="text-sm text-[#a09888] mb-3">Upload in corso…</p>
              <div className="h-1.5 bg-[#2a2830] rounded-full max-w-xs mx-auto overflow-hidden">
                <div
                  className="h-full bg-[#c8a45a] rounded-full transition-all duration-300"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#5a5548] font-mono mt-2">{uploadPct}%</p>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-3 text-[#5a5548]" />
              <p className="text-sm text-[#a09888]">
                <span className="text-[#c8a45a] font-medium">Clicca</span> o trascina un file video
              </p>
              <p className="text-xs text-[#5a5548] mt-1">MP4, MOV, WebM · max <strong className="text-[#a09888]">200 MB</strong></p>
              <p className="text-xs text-[#5a5548] mt-0.5">
                Per video più grandi usa <strong className="text-[#a09888]">YouTube o Vimeo</strong> (gratuito e senza limiti)
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
