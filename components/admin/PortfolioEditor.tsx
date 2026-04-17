'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, ChevronLeft, Eye, Save, Scissors } from 'lucide-react'
import type { PortfolioWithContent } from '@/lib/supabase/types'
import AudioUploader from './AudioUploader'
import AudioEditor from './AudioEditor'
import VideoManager from './VideoManager'

const ACCENT_COLORS = ['#c8a45a','#c94b4b','#4b8bc9','#4bb87a','#9b71c9','#e67e22']
const THEMES = [
  { value: 'dark',  label: '🌑 Cinematica Oscura' },
  { value: 'ivory', label: '🌿 Luxury Ivory' },
  { value: 'neon',  label: '🟣 Neon Minimal' },
]

interface Props {
  portfolio:      PortfolioWithContent | null
  userId:         string
  profileBio:     string       // compat
  profileShortBio?: string     // Bug 22: bio breve
  profileLongBio?:  string     // Bug 22: bio estesa
}

export default function PortfolioEditor({ portfolio, userId, profileBio, profileShortBio, profileLongBio }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const isNew    = !portfolio

  // Form state
  const [title,       setTitle]       = useState(portfolio?.title       ?? '')
  const [slug,        setSlug]        = useState(portfolio?.slug        ?? '')
  const [target,      setTarget]      = useState(portfolio?.target      ?? '')
  const [description, setDescription] = useState(portfolio?.description ?? '')
  const [bio,         setBio]         = useState(portfolio?.bio         ?? '')
  const [videoUrl,    setVideoUrl]    = useState(portfolio?.video_url   ?? '')
  const [videoUrls,   setVideoUrls]   = useState<string[]>((portfolio as any)?.video_urls ?? [])
  const [status,      setStatus]      = useState(portfolio?.status      ?? 'draft')
  const [theme,       setTheme]       = useState(portfolio?.theme       ?? 'dark')
  const [accentColor, setAccentColor] = useState(portfolio?.accent_color ?? '#c8a45a')
  const [noindex,     setNoindex]     = useState(portfolio?.noindex     ?? false)
  const [dlDisabled,  setDlDisabled]  = useState(portfolio?.downloads_disabled ?? true)
  const [saving,      setSaving]      = useState(false)
  const [activeTab,   setActiveTab]   = useState<'general'|'content'|'media'|'share'|'structure'>('general')
  const [isDirty,     setIsDirty]     = useState(false)
  const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null)
  const [bannerUrl,   setBannerUrl]   = useState<string>((portfolio as any)?.banner_url ?? '')
  const [sectionOrder,  setSectionOrder]  = useState<string[]>((portfolio as any)?.section_order ?? ['bio','projects','tracks','videos'])
  const [sectionTitles, setSectionTitles] = useState<Record<string,string>>((portfolio as any)?.section_titles ?? {})

  // Projects & tracks (gestiti localmente e salvati insieme al portfolio)
  const [projects, setProjects] = useState(portfolio?.projects ?? [])
  const [tracks,   setTracks]   = useState(portfolio?.tracks   ?? [])
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Leggi durata reale di ogni traccia audio dal file
  useEffect(() => {
    tracks.forEach((t, i) => {
      if (!t.file_url) return
      const audio = new Audio()
      audio.preload = 'metadata'
      audio.src = t.file_url
      audio.onloadedmetadata = () => {
        const s = audio.duration
        if (!isFinite(s)) return
        const m = Math.floor(s / 60)
        const label = `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
        setTracks(prev => prev.map((tr, idx) =>
          idx === i && tr.duration_label !== label
            ? { ...tr, duration_label: label }
            : tr
        ))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.map(t => t.file_url).join(',')])

  // Bug 21: avviso modifiche non salvate
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Hai modifiche non salvate. Vuoi davvero uscire?'
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Auto-slug da titolo
  function handleTitleChange(v: string) {
    setTitle(v)
    setIsDirty(true)
    if (isNew) setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Inserisci un titolo.'); return }
    if (!slug.trim())  { toast.error('Inserisci uno slug URL.'); return }
    setSaving(true)

    try {
      let portfolioId = portfolio?.id

      if (isNew) {
        const { data, error } = await supabase.from('portfolios').insert({
          owner_id: userId, title, slug, status: status as 'draft'|'published'|'private',
          theme: theme as 'dark'|'ivory'|'neon', accent_color: accentColor,
          target, description, bio, video_url: videoUrl, video_urls: videoUrls, noindex, downloads_disabled: dlDisabled,
        }).select().single()
        if (error) throw error
        portfolioId = data.id
      } else {
        const { error } = await supabase.from('portfolios').update({
          title, slug, status: status as 'draft'|'published'|'private',
          theme: theme as 'dark'|'ivory'|'neon', accent_color: accentColor,
          target, description, bio, video_url: videoUrl, video_urls: videoUrls, noindex, downloads_disabled: dlDisabled,
          banner_url: bannerUrl || null,
          section_order: sectionOrder,
          section_titles: sectionTitles,
        }).eq('id', portfolioId!)
        if (error) throw error
      }

      // Salva progetti: delete + reinsert (semplice e affidabile)
      await supabase.from('projects').delete().eq('portfolio_id', portfolioId!)
      if (projects.length) {
        await supabase.from('projects').insert(
          projects.map((p, i) => ({ portfolio_id: portfolioId!, title: p.title, project_type: p.project_type, emoji: p.emoji, description: p.description, cover_url: p.cover_url ?? null, sort_order: i }))
        )
      }

      // Salva tracce: preserva file_url esistenti, aggiorna metadati
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i]
        if (t.id) {
          await supabase.from('tracks').update({
            title: t.title, genre: t.genre, duration_label: t.duration_label, sort_order: i
          }).eq('id', t.id)
        } else {
          await supabase.from('tracks').insert({
            portfolio_id: portfolioId!, title: t.title, genre: t.genre,
            duration_label: t.duration_label, file_url: t.file_url ?? null, sort_order: i
          })
        }
      }

      toast.success('Portfolio salvato! ✓')
      setIsDirty(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Errore durante il salvataggio.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // Gestione progetti
  function addProject() {
    setProjects(prev => [...prev, { id: '', portfolio_id: portfolio?.id ?? '', title: 'Nuovo Progetto', project_type: 'Cortometraggio', emoji: '🎬', description: null, cover_url: null, sort_order: prev.length, created_at: '' }])
  }
  function removeProject(i: number) { setProjects(prev => prev.filter((_, idx) => idx !== i)) }
  function updateProject(i: number, field: string, value: string) {
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  // Gestione tracce
  function addTrack() {
    setTracks(prev => [...prev, { id: '', portfolio_id: portfolio?.id ?? '', title: 'Nuova Traccia', genre: 'Orchestral', duration_label: '0:00', file_url: null, waveform_data: null, sort_order: prev.length, play_count: 0, created_at: '' }])
  }
  async function removeTrack(i: number) {
    const t = tracks[i]
    // Se la traccia ha un ID nel DB, cancellala anche lì
    if (t?.id) {
      await supabase.from('tracks').delete().eq('id', t.id)
    }
    setTracks(prev => prev.filter((_, idx) => idx !== i))
    setIsDirty(true)
    if (editingTrackIdx === i) setEditingTrackIdx(null)
  }
  function updateTrack(i: number, field: string, value: string) {
    setTracks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb + azioni */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-[#5a5548]">
          <Link href="/portfolios" className="hover:text-[#c8a45a] transition-colors flex items-center gap-1">
            <ChevronLeft size={14} /> Portfolio
          </Link>
          <span>/</span>
          <span className="text-[#a09888]">{isNew ? 'Nuovo' : (title || 'Modifica')}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Link href={`/portfolios/${portfolio.id}/preview`} className="btn btn-outline btn-sm">
              <Eye size={13} /> Anteprima
            </Link>
          )}
          <button onClick={handleSave} disabled={saving} className="btn btn-gold btn-sm disabled:opacity-60" title={isDirty ? 'Hai modifiche non salvate' : ''}>
            <Save size={13} /> {saving ? 'Salvo…' : isDirty ? 'Salva *' : 'Salva'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Colonna principale */}
        <div>
          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-[#2a2830] mb-6 overflow-x-auto">
            {(['general','content','media','share','structure'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if (isDirty && activeTab !== tab) {
                    if (!window.confirm('Hai modifiche non salvate in questa sezione. Continuare senza salvare?')) return
                  }
                  setActiveTab(tab)
                }}
                className={`px-4 py-2.5 text-[13.5px] whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-[#c8a45a] text-[#e2c47e]'
                    : 'border-transparent text-[#5a5548] hover:text-[#a09888]'
                }`}
              >
                {{ general: 'Generale', content: 'Contenuti', media: 'Media & Video', share: 'Condivisione', structure: 'Struttura' }[tab]}
              </button>
            ))}
          </div>

          {/* TAB: GENERALE */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadein">
              <div>
                <label className="field-label">Titolo Portfolio</label>
                <input className="field-input" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="es. Cinematica Showreel 2024" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Slug URL</label>
                  <input className="field-input font-mono text-xs" value={slug} onChange={e => setSlug(e.target.value)} placeholder="cinematica-2024" />
                  <p className="field-hint">scoreforge.io/<span className="text-[#c8a45a]">{slug || 'slug'}</span></p>
                </div>
                <div>
                  <label className="field-label">Target Audience</label>
                  <input className="field-input" value={target} onChange={e => setTarget(e.target.value)} placeholder="es. Registi & Produttori" />
                </div>
              </div>
              <div>
                <label className="field-label">Descrizione breve</label>
                <textarea className="field-input field-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Una frase che descrive questo portfolio…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Stato</label>
                  <select className="field-input field-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="draft">Bozza</option>
                    <option value="published">Pubblicato</option>
                    <option value="private">Privato (solo link)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Tema grafico</label>
                  <select className="field-input field-select" value={theme} onChange={e => setTheme(e.target.value)}>
                    {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Colore accent</label>
                <div className="flex gap-2 mt-1.5">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${accentColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTENUTI */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fadein">
              <div>
                <label className="field-label">Biografia (per questo portfolio)</label>
                <textarea className="field-input field-textarea" style={{ minHeight: 120 }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Descrivi il tuo percorso artistico per questo target specifico…" />
                <div className="flex gap-2 mt-2 flex-wrap items-center">
                  <span className="text-[10px] text-[#5a5548] font-mono uppercase tracking-wide">Importa dal profilo:</span>
                  <button
                    onClick={() => { const v = profileShortBio || profileBio; if (v) { setBio(v); setIsDirty(true) } }}
                    disabled={!profileShortBio && !profileBio}
                    className="text-xs text-[#c8a45a] hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                    title={(profileShortBio || profileBio) ? `Bio breve: "${(profileShortBio || profileBio).slice(0,60)}…"` : 'Nessuna bio breve nel profilo'}
                  >
                    ↳ Bio breve
                  </button>
                  <span className="text-[#3a3648] text-xs">·</span>
                  <button
                    onClick={() => { if (profileLongBio) { setBio(profileLongBio); setIsDirty(true) } }}
                    disabled={!profileLongBio}
                    className="text-xs text-[#c8a45a] hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                    title={profileLongBio ? `Bio estesa: "${profileLongBio.slice(0,60)}…"` : 'Nessuna bio estesa nel profilo'}
                  >
                    ↳ Bio estesa
                  </button>
                </div>
              </div>

              <div className="border-t border-[#2a2830] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="field-label mb-0">Progetti</label>
                  <button onClick={addProject} className="btn btn-outline btn-sm"><Plus size={12} /> Aggiungi</button>
                </div>
                <div className="space-y-3">
                  {projects.length === 0 && <p className="text-sm text-[#5a5548] py-2">Nessun progetto. Aggiungine uno!</p>}
                  {projects.map((p, i) => (
                    <div key={i} className="bg-[#17171f] border border-[#2a2830] rounded-xl overflow-hidden">
                      <div className="flex gap-3 items-start p-3">
                        <div className="flex-shrink-0">
                          <label className="cursor-pointer block group relative">
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const path = `${userId}/projects/${Date.now()}-${file.name}`
                                const { data, error } = await supabase.storage.from('scoreforge-media').upload(path, file, { upsert: true })
                                if (error) { toast.error('Errore upload copertina'); return }
                                const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
                                updateProject(i, 'cover_url', urlData.publicUrl)
                                toast.success('Copertina caricata!')
                              }}
                            />
                            {p.cover_url ? (
                              <div className="relative w-16 h-16">
                                <img src={p.cover_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#2a2830]" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs">Cambia</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg border border-dashed border-[#3a3648] bg-[#09090f] flex flex-col items-center justify-center gap-1 hover:border-[#c8a45a]/50 transition-colors">
                                <span className="text-xl">{p.emoji}</span>
                                <span className="text-[8px] text-[#5a5548] font-mono">+ foto</span>
                              </div>
                            )}
                          </label>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <input className="w-full bg-transparent text-sm text-[#f0ebe0] outline-none border-b border-[#2a2830] pb-1 focus:border-[#c8a45a] transition-colors" value={p.title} onChange={e => updateProject(i, 'title', e.target.value)} placeholder="Titolo progetto" />
                          <div className="flex gap-2">
                            <input className="w-10 bg-transparent text-center text-base outline-none" value={p.emoji} onChange={e => updateProject(i, 'emoji', e.target.value)} title="Emoji" />
                            <input className="flex-1 bg-transparent text-xs text-[#5a5548] font-mono outline-none" value={p.project_type ?? ''} onChange={e => updateProject(i, 'project_type', e.target.value)} placeholder="Tipo (es. Cortometraggio)" />
                          </div>
                          <input className="w-full bg-transparent text-xs text-[#5a5548] outline-none" value={p.description ?? ''} onChange={e => updateProject(i, 'description', e.target.value)} placeholder="Breve descrizione (opzionale)" />
                        </div>
                        <button onClick={() => removeProject(i)} className="text-[#5a5548] hover:text-[#c94b4b] transition-colors flex-shrink-0 mt-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#2a2830] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="field-label mb-0">Tracce Audio</label>
                  <button onClick={addTrack} className="btn btn-outline btn-sm"><Plus size={12} /> Aggiungi</button>
                </div>
                <div className="space-y-2">
                  {tracks.length === 0 && <p className="text-sm text-[#5a5548] py-2">Nessuna traccia. Aggiungine una!</p>}
                  {tracks.map((t, i) => (
                    <div key={t.id || `new-${i}`}
                      onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
                      onDragLeave={() => setDragOverIdx(null)}
                      onDrop={e => {
                        e.preventDefault()
                        const from = parseInt(e.dataTransfer.getData('trackIdx'))
                        if (from === i) { setDragOverIdx(null); return }
                        const next = [...tracks]
                        const [moved] = next.splice(from, 1)
                        next.splice(i, 0, moved)
                        setTracks(next)
                        setIsDirty(true)
                        setDragOverIdx(null)
                        if (editingTrackIdx === from) setEditingTrackIdx(i)
                      }}
                      style={{ opacity: dragOverIdx === i ? 0.6 : 1, transition: 'opacity .15s' }}
                    >
                      <div className="flex gap-2 bg-[#17171f] border border-[#2a2830] rounded-lg px-3 py-2"
                        style={{ borderColor: dragOverIdx === i ? '#c8a45a' : undefined }}>
                        <span className="text-[#3a3648] text-sm pt-0.5 cursor-grab select-none hover:text-[#c8a45a]" title="Trascina per riordinare" draggable={true} onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData('trackIdx', String(i)); e.dataTransfer.effectAllowed = 'move' }}>⠿</span>
                        <span className="text-[#5a5548] text-sm pt-0.5">♪</span>
                        <input className="flex-1 bg-transparent text-sm text-[#f0ebe0] outline-none" value={t.title} onChange={e => updateTrack(i, 'title', e.target.value)} placeholder="Titolo traccia" />
                        <input className="w-24 bg-transparent text-xs text-[#5a5548] font-mono outline-none" value={t.genre ?? ''} onChange={e => updateTrack(i, 'genre', e.target.value)} placeholder="Genere" />
                        <input className="w-14 bg-transparent text-xs text-[#5a5548] font-mono outline-none text-right" value={t.duration_label ?? ''} onChange={e => updateTrack(i, 'duration_label', e.target.value)} placeholder="3:24" />
                        {t.file_url && (
                          <button
                            onClick={() => setEditingTrackIdx(editingTrackIdx === i ? null : i)}
                            title="Ritaglia / Fade-in / Fade-out"
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#3a3648] text-[#5a5548] hover:border-[#c8a45a] hover:text-[#c8a45a] transition-all text-xs flex-shrink-0"
                          >
                            <Scissors size={11} />
                            <span style={{fontSize:'9px',fontFamily:'monospace'}}>{editingTrackIdx === i ? 'CHIUDI' : 'EDIT'}</span>
                          </button>
                        )}
                        <button onClick={() => removeTrack(i)} className="text-[#5a5548] hover:text-[#c94b4b] transition-colors flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                      {editingTrackIdx === i && t.file_url && (
                        <div className="mt-2">
                          <AudioEditor
                            fileUrl={t.file_url}
                            fileName={`${t.title || 'traccia'}.wav`}
                            onClose={() => setEditingTrackIdx(null)}
                            onSave={async (blob, newName) => {
                              if (!portfolio?.id) {
                                toast.error('Salva prima il portfolio, poi modifica le tracce.')
                                return
                              }
                              try {
                                const path = `${userId}/${portfolio.id}/edited/${Date.now()}-${newName}`
                                const { data, error } = await supabase.storage
                                  .from('scoreforge-media')
                                  .upload(path, blob, { upsert: true, contentType: 'audio/wav' })
                                if (error) { toast.error('Errore upload: ' + error.message); return }
                                const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
                                const newUrl = urlData.publicUrl
                                // Aggiorna la traccia nel DB direttamente
                                if (tracks[i]?.id) {
                                  await supabase.from('tracks').update({ file_url: newUrl, waveform_data: null }).eq('id', tracks[i].id)
                                }
                                updateTrack(i, 'file_url', newUrl)
                                setIsDirty(true)
                                setEditingTrackIdx(null)
                                toast.success('Traccia aggiornata con la versione editata!')
                              } catch (err: any) {
                                toast.error('Errore: ' + (err?.message || 'Upload fallito'))
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload tracce audio direttamente da Contenuti */}
              <div className="border-t border-[#2a2830] pt-5">
                <label className="field-label mb-1">Carica tracce audio</label>
                <p className="text-xs text-[#5a5548] mb-3">Carica i file audio qui oppure dalla sezione Media &amp; Video.</p>
                {portfolio ? (
                  <AudioUploader portfolioId={portfolio.id} userId={userId} />
                ) : (
                  <div className="bg-[#17171f] border border-[#2a2830] rounded-xl p-4 text-center text-sm text-[#5a5548]">
                    Salva prima il portfolio (tab Generale) per abilitare il caricamento.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-fadein">

              {/* 1. BANNER — primo in assoluto */}
              <div>
                <label className="field-label mb-1">1. Banner / Immagine di copertina</label>
                <p className="text-xs text-[#5a5548] mb-3">Appare sopra tutto nella tua landing page, come intestazione visiva.</p>
                {bannerUrl && (
                  <div className="relative mb-3 rounded-xl overflow-hidden" style={{ maxHeight: 160 }}>
                    <img src={bannerUrl} alt="Banner" className="w-full object-cover" style={{ maxHeight: 160 }} />
                    <button onClick={() => { setBannerUrl(''); setIsDirty(true) }}
                      className="absolute top-2 right-2 btn btn-ghost btn-sm btn-icon bg-black/50 text-white hover:bg-red-500/70">
                      ✕
                    </button>
                  </div>
                )}
                <label className="btn btn-outline btn-sm cursor-pointer">
                  📷 {bannerUrl ? 'Cambia banner' : 'Carica banner'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const path = `${userId}/banners/${portfolio?.id ?? 'new'}-banner.${file.name.split('.').pop()}`
                      const { data, error } = await supabase.storage.from('scoreforge-media').upload(path, file, { upsert: true })
                      if (error) { toast.error('Errore upload banner'); return }
                      const { data: urlData } = supabase.storage.from('scoreforge-media').getPublicUrl(data.path)
                      setBannerUrl(urlData.publicUrl + '?t=' + Date.now())
                      setIsDirty(true)
                      toast.success('Banner caricato!')
                    }}
                  />
                </label>
              </div>

              {/* 2. AUDIO */}
              <div className="border-t border-[#2a2830] pt-5">
                <label className="field-label mb-1">2. Tracce Audio</label>
                {portfolio ? (
                  <AudioUploader portfolioId={portfolio.id} userId={userId} />
                ) : (
                  <div className="bg-[#17171f] border border-[#2a2830] rounded-xl p-5 text-center text-sm text-[#5a5548]">
                    Salva prima il portfolio per abilitare l'upload dei file audio.
                  </div>
                )}
              </div>

              {/* 3. VIDEO */}
              <div className="border-t border-[#2a2830] pt-5">
                <label className="field-label mb-1">3. Video</label>
                <VideoManager
                  portfolioId={portfolio?.id ?? 'new'}
                  userId={userId}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                  videoUrls={videoUrls}
                  setVideoUrls={setVideoUrls}
                />
              </div>

            </div>
          )}

          {/* TAB: CONDIVISIONE */}
          {activeTab === 'share' && (
            <div className="space-y-5 animate-fadein">
              <div>
                <label className="field-label">URL Pubblico</label>
                <div className="flex gap-2 bg-[#17171f] border border-[#2a2830] rounded-lg px-4 py-2.5 mt-1.5">
                  <span className="flex-1 font-mono text-xs text-[#c8a45a] truncate">
                    {(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')}/{slug || 'slug'}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(`${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '')}/${slug}`); toast.success('Link copiato!') }} className="text-xs text-[#5a5548] hover:text-[#c8a45a] transition-colors">Copia</button>
                </div>
              </div>
              <div className="card card-sm space-y-0">
                {[
                  { label: 'Consenti download audio', desc: 'Gli ascoltatori possono scaricare le tracce audio', val: !dlDisabled, set: (v: boolean) => setDlDisabled(!v) },
                  { label: 'Nascosto da Google (noindex)', desc: 'Aggiunge meta noindex alla landing page', val: noindex, set: setNoindex },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#2a2830] last:border-0">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-[#5a5548] mt-0.5">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#2a2830] rounded-full peer peer-checked:bg-[#c8a45a]/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#5a5548] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-[#c8a45a]" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB: STRUTTURA — Bug 23 + Bug 24 */}
          {activeTab === 'structure' && (
            <div className="space-y-6 animate-fadein">

              {/* Ordine sezioni */}
              <div>
                <label className="field-label mb-1">Ordine delle sezioni</label>
                <p className="text-xs text-[#5a5548] mb-3">Trascina con le frecce su/giù per cambiare l'ordine in cui appaiono nella tua landing page.</p>
                <div className="space-y-2">
                  {sectionOrder.map((key, i) => {
                    const labels: Record<string,string> = { bio:'Chi sono / Bio', projects:'Lavori / Progetti', tracks:'Audio / Tracce', videos:'Video / Showreel' }
                    const icons: Record<string,string>  = { bio:'👤', projects:'🎬', tracks:'🎵', videos:'📹' }
                    return (
                      <div key={key} className="flex items-center gap-3 bg-[#17171f] border border-[#2a2830] rounded-xl px-3 py-2.5">
                        <span style={{ fontSize:18 }}>{icons[key] || '◻'}</span>
                        <span className="flex-1 text-sm text-[#f0ebe0]">{labels[key] || key}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            disabled={i === 0}
                            onClick={() => {
                              const next = [...sectionOrder]
                              ;[next[i-1], next[i]] = [next[i], next[i-1]]
                              setSectionOrder(next); setIsDirty(true)
                            }}
                            className="text-[#5a5548] hover:text-[#c8a45a] disabled:opacity-20 text-xs leading-none px-1"
                            title="Sposta su"
                          >▲</button>
                          <button
                            disabled={i === sectionOrder.length - 1}
                            onClick={() => {
                              const next = [...sectionOrder]
                              ;[next[i], next[i+1]] = [next[i+1], next[i]]
                              setSectionOrder(next); setIsDirty(true)
                            }}
                            className="text-[#5a5548] hover:text-[#c8a45a] disabled:opacity-20 text-xs leading-none px-1"
                            title="Sposta giù"
                          >▼</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Titoli sezioni */}
              <div className="border-t border-[#2a2830] pt-5">
                <label className="field-label mb-1">Personalizza i titoli delle sezioni</label>
                <p className="text-xs text-[#5a5548] mb-3">Lascia vuoto per usare il titolo predefinito.</p>
                <div className="space-y-3">
                  {[
                    { key:'bio',          label:'Chi sono — etichetta tag',      default:'Chi sono' },
                    { key:'projects_tag', label:'Progetti — etichetta tag',      default:'Lavori selezionati' },
                    { key:'projects',     label:'Progetti — titolo sezione',     default:'Progetti' },
                    { key:'tracks_tag',   label:'Audio — etichetta tag',         default:'Composizioni' },
                    { key:'tracks',       label:'Audio — titolo sezione',        default:'Ascolta il mio lavoro' },
                    { key:'videos_tag',   label:'Video — etichetta tag',         default:'Video' },
                    { key:'videos',       label:'Video — titolo sezione',        default:'Showreel' },
                  ].map(f => (
                    <div key={f.key} className="grid grid-cols-[1fr_2fr] gap-3 items-center">
                      <label className="text-xs text-[#5a5548]">{f.label}</label>
                      <input
                        className="field-input text-sm"
                        value={sectionTitles[f.key] || ''}
                        onChange={e => {
                          setSectionTitles(prev => ({ ...prev, [f.key]: e.target.value }))
                          setIsDirty(true)
                        }}
                        placeholder={f.default}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar editor */}
        <div className="space-y-4">
          <div className="card card-sm">
            <div className="field-label mb-2">Stato pubblicazione</div>
            <select className="field-input field-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="draft">📝 Bozza</option>
              <option value="published">✅ Pubblicato</option>
              <option value="private">🔒 Privato</option>
            </select>
            <div className="border-t border-[#2a2830] my-4" />
            <button onClick={handleSave} disabled={saving} className="btn btn-gold w-full justify-center disabled:opacity-60">
              <Save size={13} /> {saving ? 'Salvo…' : 'Salva Modifiche'}
            </button>
            {!isNew && (
              <Link href={`/portfolios/${portfolio.id}/preview`} className="btn btn-outline w-full justify-center mt-2">
                <Eye size={13} /> Anteprima
              </Link>
            )}
          </div>

          {!isNew && (
            <div className="card card-sm">
              <div className="field-label mb-3">Statistiche</div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  ['Views', portfolio.view_count],
                  ['Tracce', portfolio.tracks?.length ?? 0],
                  ['Progetti', portfolio.projects?.length ?? 0],
                  ['Creato', portfolio.created_at?.slice(0,10)],
                  ['Modificato', portfolio.updated_at?.slice(0,10)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between">
                    <span className="text-[#5a5548]">{k}</span>
                    <span className="text-[#a09888]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
