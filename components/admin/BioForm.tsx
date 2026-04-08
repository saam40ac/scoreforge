'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save, X, Plus, Camera, ExternalLink, Pencil, Check } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

interface CustomLink { label: string; url: string }

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/tuonome',  icon: '📸' },
  { key: 'linkedin',  label: 'LinkedIn',   placeholder: 'https://linkedin.com/in/tuonome', icon: '💼' },
  { key: 'facebook',  label: 'Facebook',   placeholder: 'https://facebook.com/tuonome',   icon: '👥' },
  { key: 'spotify',   label: 'Spotify',    placeholder: 'https://open.spotify.com/artist/...', icon: '🎵' },
  { key: 'youtube',   label: 'YouTube',    placeholder: 'https://youtube.com/@tuocanale', icon: '▶️' },
  { key: 'vimeo',     label: 'Vimeo',      placeholder: 'https://vimeo.com/tuonome',      icon: '🎬' },
  { key: 'imdb',      label: 'IMDb',       placeholder: 'https://imdb.com/name/nm...',    icon: '🎞' },
] as const

type SocialKey = typeof SOCIAL_FIELDS[number]['key']

export default function BioForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const supabase  = createClient()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)

  // Dati base
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

  // Social links
  const [socials, setSocials] = useState<Record<SocialKey, string>>({
    instagram: (profile as any)?.instagram ?? '',
    linkedin:  (profile as any)?.linkedin  ?? '',
    facebook:  (profile as any)?.facebook  ?? '',
    spotify:   (profile as any)?.spotify   ?? '',
    youtube:   (profile as any)?.youtube   ?? '',
    vimeo:     (profile as any)?.vimeo     ?? '',
    imdb:      (profile as any)?.imdb      ?? '',
  })

  // Custom links
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    (profile as any)?.custom_links ?? []
  )
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl,   setNewLinkUrl]   = useState('')
  const [editingLink,  setEditingLink]  = useState<number | null>(null)
  const [editLabel,    setEditLabel]    = useState('')
  const [editUrl,      setEditUrl]      = useState('')

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'

  // ── Upload avatar ────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Immagine troppo grande. Max 5 MB.'); return }
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${userId}/avatar/profile.${ext}`
    await supabase.storage.from('scoreforge-media').remove([
      `${userId}/avatar/profile.jpg`,
      `${userId}/avatar/profile.png`,
      `${userId}/avatar/profile.webp`,
    ])
    const { data, error } = await supabase.storage
      .from('scoreforge-media')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) { toast.error('Errore upload foto.'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
    const url = urlData.publicUrl + '?t=' + Date.now()
    setAvatarUrl(url)
    await supabase.from('profiles').upsert({ id: userId, avatar_url: url })
    toast.success('Foto profilo aggiornata!')
    setUploading(false)
  }

  // ── Salva tutto ──────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name, professional_title: title, city,
      public_email: email, website,
      short_bio: shortBio, long_bio: longBio,
      skills, avatar_url: avatarUrl,
      ...socials,
      custom_links: customLinks,
    })
    setSaving(false)
    error ? toast.error('Errore durante il salvataggio.') : toast.success('Profilo salvato!')
  }

  // ── Custom links ─────────────────────────────────────────
  function addCustomLink() {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return
    let url = newLinkUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    setCustomLinks(prev => [...prev, { label: newLinkLabel.trim(), url }])
    setNewLinkLabel(''); setNewLinkUrl('')
  }
  function removeCustomLink(i: number) {
    setCustomLinks(prev => prev.filter((_, idx) => idx !== i))
  }
  function startEditLink(i: number) {
    setEditingLink(i)
    setEditLabel(customLinks[i].label)
    setEditUrl(customLinks[i].url)
  }
  function saveEditLink(i: number) {
    if (!editLabel.trim() || !editUrl.trim()) return
    let url = editUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url
    setCustomLinks(prev => prev.map((l, idx) => idx === i ? { label: editLabel.trim(), url } : l))
    setEditingLink(null)
  }

  return (
    <div className="space-y-5">

      {/* Avatar + header */}
      <div className="card card-sm flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-20 h-20 rounded-full object-cover" style={{ border:'2px solid var(--sf-gold)' }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-3xl font-semibold"
              style={{ background:'linear-gradient(135deg,var(--sf-gold),var(--sf-gold2))', color:'var(--sf-bg)', border:'2px solid var(--sf-gold)' }}>
              {initials}
            </div>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-2 transition-colors disabled:opacity-60"
            style={{ background:'var(--sf-gold)', borderColor:'var(--sf-bg)', color:'var(--sf-bg)' }}>
            {uploading ? <span className="text-[9px] font-mono">…</span> : <Camera size={12} />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-xl" style={{ color:'var(--sf-text)' }}>{name || 'Il tuo nome'}</div>
          <div className="text-xs mt-0.5" style={{ color:'var(--sf-text3)' }}>{title || 'Titolo professionale'}</div>
          <div className="text-[10px] font-mono mt-2" style={{ color:'var(--sf-text3)' }}>JPG, PNG, WebP · max 5 MB · icona fotocamera</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-gold btn-sm self-start disabled:opacity-60">
          <Save size={13} /> {saving ? 'Salvo…' : 'Salva'}
        </button>
      </div>

      {/* Dati personali */}
      <div className="card">
        <div className="text-sm font-medium mb-4" style={{ color:'var(--sf-text)' }}>Dati personali</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label:'Nome completo',        val:name,    set:setName,    ph:'Andrea Pagliara',              span:false },
            { label:'Titolo professionale', val:title,   set:setTitle,   ph:'Compositore · Film · Musical', span:false },
            { label:'Città',                val:city,    set:setCity,    ph:'Bari, Italia',                 span:false },
            { label:'Email pubblica',       val:email,   set:setEmail,   ph:'andrea@pagliara.it',           span:false },
            { label:'Sito web',             val:website, set:setWebsite, ph:'www.andreapagliara.it',        span:true  },
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
        <div className="text-sm font-medium mb-4" style={{ color:'var(--sf-text)' }}>Biografie</div>
        <div className="space-y-4">
          <div>
            <label className="field-label">Bio breve <span style={{ color:'var(--sf-border2)' }}>(nelle landing page)</span></label>
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

      {/* Social Links */}
      <div className="card">
        <div className="text-sm font-medium mb-1" style={{ color:'var(--sf-text)' }}>Profili Social</div>
        <p className="text-xs mb-4" style={{ color:'var(--sf-text3)' }}>
          Appariranno come pulsanti cliccabili su tutte le tue landing page. Lascia vuoti quelli che non usi.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(f => (
            <div key={f.key}>
              <label className="field-label flex items-center gap-1.5">
                <span style={{ fontSize:14 }}>{f.icon}</span> {f.label}
              </label>
              <input
                className="field-input"
                value={socials[f.key]}
                onChange={e => setSocials(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Links */}
      <div className="card">
        <div className="text-sm font-medium mb-1" style={{ color:'var(--sf-text)' }}>Link Personalizzati</div>
        <p className="text-xs mb-4" style={{ color:'var(--sf-text3)' }}>
          CV su Drive, showreel su Dropbox, cartella stampa, qualsiasi URL — appariranno accanto ai social.
        </p>

        {/* Lista link aggiunti — con modifica inline (Bug 27) */}
        {customLinks.length > 0 && (
          <div className="space-y-2 mb-4">
            {customLinks.map((l, i) => (
              <div key={i} className="rounded-lg px-3 py-2"
                style={{ background:'var(--sf-bg3)', border:'1px solid var(--sf-border)' }}>
                {editingLink === i ? (
                  <div className="flex gap-2 flex-wrap">
                    <input className="field-input flex-1 min-w-[100px]" value={editLabel}
                      onChange={e => setEditLabel(e.target.value)} placeholder="Etichetta"
                      onKeyDown={e => e.key === 'Enter' && saveEditLink(i)} />
                    <input className="field-input flex-1 min-w-[160px]" value={editUrl}
                      onChange={e => setEditUrl(e.target.value)} placeholder="URL"
                      onKeyDown={e => e.key === 'Enter' && saveEditLink(i)} />
                    <button onClick={() => saveEditLink(i)}
                      className="btn btn-gold btn-sm btn-icon" title="Salva">
                      <Check size={13} />
                    </button>
                    <button onClick={() => setEditingLink(null)}
                      className="btn btn-ghost btn-sm btn-icon" title="Annulla">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink size={13} style={{ color:'var(--sf-text3)', flexShrink:0 }} />
                    <span className="text-sm font-medium flex-shrink-0" style={{ color:'var(--sf-text)', minWidth:'100px' }}>{l.label}</span>
                    <span className="text-xs font-mono truncate flex-1" style={{ color:'var(--sf-gold)' }}>{l.url}</span>
                    <button onClick={() => startEditLink(i)}
                      className="flex-shrink-0 transition-colors"
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sf-text3)' }}
                      title="Modifica"
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--sf-gold)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--sf-text3)')}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => removeCustomLink(i)}
                      className="flex-shrink-0 transition-colors"
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sf-text3)' }}
                      title="Elimina"
                      onMouseEnter={e => (e.currentTarget.style.color = '#c94b4b')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--sf-text3)')}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Aggiungi nuovo link */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
          <div>
            <label className="field-label">Etichetta</label>
            <input className="field-input" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)}
              placeholder="es. Il mio CV" onKeyDown={e => e.key === 'Enter' && addCustomLink()} />
          </div>
          <div>
            <label className="field-label">URL</label>
            <input className="field-input" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)}
              placeholder="https://drive.google.com/..." onKeyDown={e => e.key === 'Enter' && addCustomLink()} />
          </div>
          <div className="flex items-end">
            <button onClick={addCustomLink} disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}
              className="btn btn-outline w-full justify-center disabled:opacity-40">
              <Plus size={14} /> Aggiungi
            </button>
          </div>
        </div>
        <p className="field-hint mt-2">Puoi aggiungere Drive, Dropbox, Box, WeTransfer, qualsiasi servizio cloud.</p>
      </div>

      {/* Competenze */}
      <div className="card">
        <div className="text-sm font-medium mb-4" style={{ color:'var(--sf-text)' }}>Competenze & Software</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.length === 0 && <span className="text-sm" style={{ color:'var(--sf-text3)' }}>Nessuna competenza aggiunta.</span>}
          {skills.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{ background:'color-mix(in srgb,var(--sf-gold) 10%,transparent)', border:'1px solid color-mix(in srgb,var(--sf-gold) 25%,transparent)', color:'var(--sf-gold)' }}>
              {s}
              <button onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))}
                style={{ background:'none', border:'none', cursor:'pointer', opacity:.6, display:'flex' }}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="field-input flex-1" value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill('') } }}
            placeholder="es. Logic Pro X, Sibelius, Orchestrazione…" />
          <button onClick={() => { if (newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill('') } }}
            className="btn btn-outline"><Plus size={14} /> Aggiungi</button>
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
