'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save, X, Plus } from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export default function BioForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [name,       setName]       = useState(profile?.name               ?? '')
  const [title,      setTitle]      = useState(profile?.professional_title ?? '')
  const [city,       setCity]       = useState(profile?.city               ?? '')
  const [email,      setEmail]      = useState(profile?.public_email       ?? '')
  const [website,    setWebsite]    = useState(profile?.website            ?? '')
  const [shortBio,   setShortBio]   = useState(profile?.short_bio         ?? '')
  const [longBio,    setLongBio]    = useState(profile?.long_bio           ?? '')
  const [skills,     setSkills]     = useState<string[]>(profile?.skills   ?? [])
  const [newSkill,   setNewSkill]   = useState('')

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: userId, name, professional_title: title, city, public_email: email,
      website, short_bio: shortBio, long_bio: longBio, skills,
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

  function removeSkill(i: number) { setSkills(prev => prev.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-5">
      {/* Avatar + azioni */}
      <div className="card card-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c8a45a] to-[#e2c47e] flex items-center justify-center font-serif text-2xl font-semibold text-[#09090f] flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-serif text-xl">{name || 'Il tuo nome'}</div>
          <div className="text-xs text-[#5a5548]">{title || 'Titolo professionale'}</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-gold btn-sm disabled:opacity-60">
          <Save size={13} /> {saving ? 'Salvo…' : 'Salva'}
        </button>
      </div>

      {/* Dati anagrafici */}
      <div className="card">
        <div className="text-sm font-medium mb-4">Dati personali</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nome completo',           val: name,    set: setName,    ph: 'Andrea Pagliara' },
            { label: 'Titolo professionale',    val: title,   set: setTitle,   ph: 'Compositore · Film · Musical' },
            { label: 'Città',                   val: city,    set: setCity,    ph: 'Bari, Italia' },
            { label: 'Email pubblica',          val: email,   set: setEmail,   ph: 'andrea@pagliara.it' },
            { label: 'Sito web',                val: website, set: setWebsite, ph: 'www.andreapagliara.it' },
          ].map(f => (
            <div key={f.label} className={f.label === 'Sito web' ? 'sm:col-span-2' : ''}>
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
            <label className="field-label">Bio breve <span className="text-[#3a3648]">(usata nelle landing page — max 200 caratteri)</span></label>
            <textarea className="field-input field-textarea" value={shortBio} onChange={e => setShortBio(e.target.value)} placeholder="Una frase incisiva che descrive chi sei e cosa fai…" style={{ minHeight: 80 }} />
            <p className="field-hint">{shortBio.length}/200 caratteri</p>
          </div>
          <div>
            <label className="field-label">Bio estesa</label>
            <textarea className="field-input field-textarea" value={longBio} onChange={e => setLongBio(e.target.value)} placeholder="Il tuo percorso, la tua formazione, le tue passioni…" style={{ minHeight: 140 }} />
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
              <button onClick={() => removeSkill(i)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="field-input flex-1"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="es. Logic Pro X, Sibelius, Orchestrazione…"
          />
          <button onClick={addSkill} className="btn btn-outline">
            <Plus size={14} /> Aggiungi
          </button>
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
