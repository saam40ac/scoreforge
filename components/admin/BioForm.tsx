'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save, X, Plus, Camera } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function BioForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const supabase  = createClient()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [saving,  setSaving]  = useState(false)
  const [uploading, setUploading] = useState(false)

  const [name,      setName]      = useState(profile?.name               ?? '')
  const [title,     setTitle]     = useState(profile?.professional_title ?? '')
  const [city,      setCity]      = useState(profile?.city               ?? '')
  const [email,     setEmail]     = useState(profile?.public_email       ?? '')
  const [website,   setWebsite]   = useState(profile?.website            ?? '')
  const [shortBio,  setShortBio]  = useState(profile?.short_bio         ?? '')
  const [longBio,   setLongBio]   = useState(profile?.long_bio           ?? '')
  const [skills,    setSkills]    = useState<string[]>(profile?.skills   ?? [])
  const [newSkill,  setNewSkill]  = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url        ?? '')

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'

  // ── Upload foto profilo ──────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Immagine troppo grande. Max 5 MB.'); return }

    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/avatar/profile.${ext}`

    // Rimuovi vecchio avatar se esiste
    await supabase.storage.from('scoreforge-media').remove([`${userId}/avatar/profile.jpg`, `${userId}/avatar/profile.png`, `${userId}/avatar/profile.webp`])

    const { data, error } = await supabase.storage
      .from('scoreforge-media')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (error) { toast.error('Errore upload foto.'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
    const url = urlData.publicUrl + '?t=' + Date.now() // cache-bust

    setAvatarUrl(url)
    // Salva subito l'avatar nel profilo
    await supabase.from('profiles').upsert({ id: userId, avatar_url: url })
    toast.success('Foto profilo aggiornata!')
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: userId, name, professional_title: title, city,
      public_email: email, website, short_bio: shortBio,
      long_bio: longBio, skills, avatar_url: avatarUrl,
    })
    setSaving(false)
    error ? toast.error('Errore durante il salvataggio.') : toast.success('Profilo salvato!')
  }

  function addSkill() {
    const s = newSkill.trim()
    if (!s || skills.includes(s)) return
    setSkills(prev => [...prev, s])
    setNewSkill('')
  }

  return (
    <div className="space-y-5">

      {/* Avatar + azioni */}
      <div className="card card-sm flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {/* Input file nascosto */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          {/* Foto o iniziali */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#c8a45a]/40"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c8a45a] to-[#e2c47e] flex items-center justify-center font-serif text-3xl font-semibold text-[#09090f] border-2 border-[#c8a45a]/40">
              {initials}
            </div>
          )}
          {/* Pulsante camera sovrapposto */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#c8a45a] flex items-center justify-center cursor-pointer border-2 border-[#09090f] hover:bg-[#e2c47e] transition-colors disabled:opacity-60"
            title="Cambia foto"
          >
            {uploading
              ? <span className="text-[#09090f] text-[9px] font-mono">…</span>
              : <Camera size={12} className="text-[#09090f]" />
            }
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-serif text-xl text-[#f0ebe0]">{name || 'Il tuo nome'}</div>
          <div className="text-xs text-[#5a5548] mt-0.5">{title || 'Titolo professionale'}</div>
          <div className="text-[10px] text-[#5a5548] font-mono mt-2">
            JPG, PNG, WebP · max 5 MB · clicca sull&apos;icona fotocamera
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-gold btn-sm self-start disabled:opacity-60">
          <Save size={13} /> {saving ? 'Salvo…' : 'Salva'}
        </button>
      </div>

      {/* Dati personali */}
      <div className="card">
        <div className="text-sm font-medium mb-4">Dati personali</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label:'Nome completo',        val:name,    set:setName,    ph:'Andrea Pagliara',          span:false },
            { label:'Titolo professionale', val:title,   set:setTitle,   ph:'Compositore · Film · Musical', span:false },
            { label:'Città',               val:city,    set:setCity,    ph:'Bari, Italia',             span:false },
            { label:'Email pubblica',      val:email,   set:setEmail,   ph:'andrea@pagliara.it',       span:false },
            { label:'Sito web',            val:website, set:setWebsite, ph:'www.andreapagliara.it',    span:true  },
          ].map(f => (
            <div key={f.label} className={f.span ? 'sm:col-span-2' : ''}>
              <label className="field-label">{f.label}</label>
              <input className="field-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="card">
        <div className="text-sm font-medium mb-4">Biografie</div>
        <div className="space-y-4">
          <div>
            <label className="field-label">Bio breve <span className="text-[#3a3648] normal-case">(nelle landing page — max 200 caratteri)</span></label>
            <textarea className="field-input field-textarea" value={shortBio} onChange={e => setShortBio(e.target.value)}
              placeholder="Una frase incisiva che descrive chi sei e cosa fai…" style={{ minHeight:80 }} />
            <p className="field-hint">{shortBio.length}/200 caratteri</p>
          </div>
          <div>
            <label className="field-label">Bio estesa</label>
            <textarea className="field-input field-textarea" value={longBio} onChange={e => setLongBio(e.target.value)}
              placeholder="Il tuo percorso, la tua formazione, le tue passioni…" style={{ minHeight:140 }} />
          </div>
        </div>
      </div>

      {/* Competenze */}
      <div className="card">
        <div className="text-sm font-medium mb-4">Competenze & Software</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.length === 0 && <span className="text-sm text-[#5a5548]">Nessuna competenza aggiunta.</span>}
          {skills.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#c8a45a]/10 border border-[#c8a45a]/25 rounded-full text-xs text-[#c8a45a]">
              {s}
              <button onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="field-input flex-1" value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="es. Logic Pro X, Sibelius, Orchestrazione…" />
          <button onClick={addSkill} className="btn btn-outline"><Plus size={14} /> Aggiungi</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn btn-gold disabled:opacity-60">
          <Save size={14} /> {saving ? 'Salvataggio…' : 'Salva Profilo'}
        </button>
      </div>
    </div>
  )
}
