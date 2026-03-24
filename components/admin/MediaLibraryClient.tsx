'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Music, Image, FileText, Trash2, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MediaFile } from '@/lib/supabase/types'

function fmtSize(b: number) {
  if (!b) return '—'
  if (b < 1024 * 1024) return `${(b/1024).toFixed(0)} KB`
  return `${(b/(1024*1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: string }) {
  if (type === 'audio') return <Music size={14} className="text-[#c8a45a]" />
  if (type === 'image') return <Image size={14} className="text-blue-400" />
  return <FileText size={14} className="text-[#5a5548]" />
}

export default function MediaLibraryClient({ files, userId }: { files: MediaFile[]; userId: string }) {
  const supabase = createClient()
  const router   = useRouter()
  const [uploading, setUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aiff'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 100 * 1024 * 1024,
    onDrop: async (accepted) => {
      setUploading(true)
      for (const file of accepted) {
        const type  = file.type.startsWith('audio') ? 'audio' : 'image'
        const path  = `${userId}/library/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage.from('scoreforge-media').upload(path, file)
        if (error) { toast.error(`Errore: ${file.name}`); continue }
        const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
        await supabase.from('media_files').insert({
          owner_id: userId, file_name: file.name, file_url: urlData.publicUrl,
          file_size: file.size, mime_type: file.type, media_type: type, storage_path: data.path,
        })
        toast.success(`"${file.name}" caricato!`)
      }
      setUploading(false)
      router.refresh()
    },
  })

  async function deleteFile(file: MediaFile) {
    if (file.storage_path) {
      await supabase.storage.from('scoreforge-media').remove([file.storage_path])
    }
    await supabase.from('media_files').delete().eq('id', file.id)
    toast.success('File eliminato.')
    router.refresh()
  }

  // Storage usage bar (Supabase Free = 1 GB)
  const totalBytes  = files.reduce((a, f) => a + (f.file_size ?? 0), 0)
  const limitBytes  = 1 * 1024 * 1024 * 1024
  const usedPct     = Math.min(100, (totalBytes / limitBytes) * 100)

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div className="card card-sm">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-[#c8a45a] bg-[#c8a45a]/5' : 'border-[#3a3648] hover:border-[#c8a45a]/50 hover:bg-[#17171f]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={26} className="mx-auto mb-3 text-[#5a5548]" />
          <p className="text-sm text-[#a09888]">
            {uploading ? 'Upload in corso…' : <><span className="text-[#c8a45a] font-medium">Clicca</span> o trascina file audio e immagini</>}
          </p>
          <p className="text-xs text-[#5a5548] mt-1">MP3, WAV, FLAC, JPG, PNG, WebP · max 100 MB</p>
        </div>

        {/* Storage bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono text-[#5a5548] mb-1.5">
            <span>Storage utilizzato</span>
            <span>{fmtSize(totalBytes)} / 1 GB</span>
          </div>
          <div className="h-1.5 bg-[#2a2830] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : 'bg-[#c8a45a]'}`} style={{ width: `${usedPct}%` }} />
          </div>
        </div>
      </div>

      {/* Lista file */}
      <div className="card p-0 overflow-hidden">
        {files.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#5a5548]">Nessun file caricato ancora.</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#2a2830]">
                <th className="text-left px-5 py-3 text-[10px] text-[#5a5548] uppercase tracking-[.08em] font-mono font-normal">File</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#5a5548] uppercase tracking-[.08em] font-mono font-normal hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#5a5548] uppercase tracking-[.08em] font-mono font-normal hidden md:table-cell">Dim.</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#5a5548] uppercase tracking-[.08em] font-mono font-normal hidden lg:table-cell">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} className="border-b border-[#2a2830] last:border-0 hover:bg-[#17171f] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileIcon type={f.media_type} />
                      <span className="font-mono text-xs text-[#a09888] truncate max-w-[160px]">{f.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-[#5a5548] capitalize">{f.media_type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-[#5a5548]">{fmtSize(f.file_size ?? 0)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-mono text-xs text-[#5a5548]">{f.created_at.slice(0,10)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => { navigator.clipboard.writeText(f.file_url); toast.success('Link copiato!') }}
                        className="btn btn-ghost btn-sm btn-icon" title="Copia link"
                      >
                        <Copy size={12} />
                      </button>
                      <button onClick={() => deleteFile(f)} className="btn btn-ghost btn-sm btn-icon text-[#5a5548] hover:text-[#c94b4b]" title="Elimina">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
