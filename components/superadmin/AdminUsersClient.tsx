'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, UserPlus, Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown } from 'lucide-react'

interface User {
  id: string; name: string; public_email: string; professional_title: string | null
  city: string | null; role: string; status: string; plan: string
  plan_expires_at: string | null; notes: string | null; created_at: string; avatar_url: string | null
}

const PLAN_COLORS: Record<string,string> = { free:'#5a5548', pro:'#c8a45a', studio:'#e2c47e', enterprise:'#f5e4b8' }
const STATUS_ICONS: Record<string,any> = { active: CheckCircle, suspended: XCircle, pending: AlertTriangle }

export default function AdminUsersClient({ users: initialUsers, portfolioCounts }: { users: User[]; portfolioCounts: Record<string,number> }) {
  const supabase  = createClient()
  const [users,   setUsers]   = useState(initialUsers)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<'all'|'active'|'suspended'|'pro'|'studio'>('all')
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)

  // Nuovo utente
  const [newEmail, setNewEmail] = useState('')
  const [newName,  setNewName]  = useState('')
  const [newPlan,  setNewPlan]  = useState('free')
  const [newPass,  setNewPass]  = useState('')

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.public_email?.toLowerCase().includes(q)
    const matchFilter = filter === 'all' ? true
      : filter === 'active' ? u.status === 'active'
      : filter === 'suspended' ? u.status === 'suspended'
      : u.plan === filter
    return matchSearch && matchFilter
  })

  async function updateUser(id: string, updates: Partial<User>) {
    setSaving(true)
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (error) { toast.error('Errore: ' + error.message); setSaving(false); return }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
    toast.success('Utente aggiornato.')
    setSaving(false)
  }

  async function createUser() {
    if (!newEmail || !newPass) { toast.error('Email e password obbligatorie'); return }
    setSaving(true)
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName, plan: newPlan, password: newPass }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Errore creazione utente'); setSaving(false); return }
    setUsers(prev => [data.user, ...prev])
    setShowNew(false); setNewEmail(''); setNewName(''); setNewPass(''); setNewPlan('free')
    toast.success('Utente creato con successo!')
    setSaving(false)
  }

  const s = {
    card: { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px' } as React.CSSProperties,
    input: { background: '#0a0a12', border: '1px solid #2a2830', borderRadius: '8px', padding: '8px 12px', color: '#f0ebe0', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" } as React.CSSProperties,
    label: { fontSize: '10px', color: '#5a5548', textTransform: 'uppercase' as const, letterSpacing: '.1em', fontFamily: 'DM Mono, monospace', display: 'block', marginBottom: '5px' },
    btn: (color: string) => ({ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${color}44`, background: color + '12', color, fontFamily: "'Outfit', sans-serif" } as React.CSSProperties),
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5a5548' }} />
          <input style={{ ...s.input, paddingLeft: '32px', width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per nome o email…" />
        </div>
        <select style={{ ...s.input, cursor: 'pointer' }} value={filter} onChange={e => setFilter(e.target.value as any)}>
          <option value="all">Tutti</option>
          <option value="active">Attivi</option>
          <option value="suspended">Sospesi</option>
          <option value="pro">Piano Pro</option>
          <option value="studio">Piano Studio</option>
        </select>
        <button onClick={() => setShowNew(v => !v)} style={{ ...s.btn('#c8a45a'), display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={13} /> Nuovo utente
        </button>
      </div>

      {/* Form nuovo utente */}
      {showNew && (
        <div style={{ ...s.card, padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0ebe0', marginBottom: '16px' }}>Crea nuovo utente</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            {[
              { label: 'Nome', val: newName, set: setNewName, ph: 'Andrea Pagliara', type: 'text' },
              { label: 'Email', val: newEmail, set: setNewEmail, ph: 'andrea@email.com', type: 'email' },
              { label: 'Password temporanea', val: newPass, set: setNewPass, ph: '••••••••', type: 'password' },
            ].map(f => (
              <div key={f.label}>
                <label style={s.label}>{f.label}</label>
                <input type={f.type} style={{ ...s.input, width: '100%' }} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
              </div>
            ))}
            <div>
              <label style={s.label}>Piano</label>
              <select style={{ ...s.input, width: '100%', cursor: 'pointer' }} value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                {['free','pro','studio','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={createUser} disabled={saving} style={{ ...s.btn('#c8a45a'), opacity: saving ? .6 : 1 }}>
              {saving ? 'Creo…' : 'Crea utente'}
            </button>
            <button onClick={() => setShowNew(false)} style={s.btn('#5a5548')}>Annulla</button>
          </div>
        </div>
      )}

      {/* Tabella utenti */}
      <div style={s.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Utente', 'Email', 'Piano', 'Portfolio', 'Stato', 'Ruolo', 'Registrato', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '9.5px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const StatusIcon = STATUS_ICONS[u.status] || CheckCircle
              const isExpanded = expanded === u.id
              return (
                <React.Fragment key={u.id}>
                  <tr style={{ borderBottom: '1px solid #14141f', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : u.id)}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#c8a45a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#c8a45a', flexShrink: 0 }}>
                              {u.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) || '?'}
                            </div>
                        }
                        <span style={{ color: '#f0ebe0', fontWeight: 500 }}>{u.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#5a5548', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{u.public_email || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', background: PLAN_COLORS[u.plan]+'18', color: PLAN_COLORS[u.plan], border: `1px solid ${PLAN_COLORS[u.plan]}44` }}>
                        {u.plan || 'free'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#a09888', fontFamily: 'DM Mono, monospace' }}>{portfolioCounts[u.id] || 0}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusIcon size={14} color={u.status === 'active' ? '#4bb87a' : u.status === 'suspended' ? '#c94b4b' : '#c8a45a'} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {u.role === 'super_admin' && <Shield size={13} color="#c94b4b" />}
                      {u.role === 'admin' && <Shield size={13} color="#c8a45a" />}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#5a5548', fontSize: '11px' }}>{new Date(u.created_at).toLocaleDateString('it-IT')}</td>
                    <td style={{ padding: '11px 14px' }}><ChevronDown size={13} color="#5a5548" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} /></td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                      <td colSpan={8} style={{ padding: '14px 20px', background: '#0a0a12' }}>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                          {/* Stato */}
                          <div>
                            <label style={s.label}>Stato account</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {['active','suspended'].map(st => (
                                <button key={st} onClick={() => updateUser(u.id, { status: st } as any)}
                                  style={{ ...s.btn(st === 'active' ? '#4bb87a' : '#c94b4b'), opacity: u.status === st ? 1 : .4, fontWeight: u.status === st ? 600 : 400 }}>
                                  {st === 'active' ? 'Attivo' : 'Sospendi'}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Piano */}
                          <div>
                            <label style={s.label}>Piano</label>
                            <select style={{ ...s.input, cursor: 'pointer' }} value={u.plan}
                              onChange={e => updateUser(u.id, { plan: e.target.value } as any)}>
                              {['free','pro','studio','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          {/* Ruolo */}
                          <div>
                            <label style={s.label}>Ruolo</label>
                            <select style={{ ...s.input, cursor: 'pointer' }} value={u.role}
                              onChange={e => updateUser(u.id, { role: e.target.value } as any)}>
                              {['user','admin','super_admin'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          {/* Note interne */}
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={s.label}>Note interne admin</label>
                            <input style={{ ...s.input, width: '100%' }} defaultValue={u.notes || ''}
                              onBlur={e => updateUser(u.id, { notes: e.target.value } as any)}
                              placeholder="Note visibili solo agli admin…" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#5a5548', fontSize: '13px' }}>Nessun utente trovato.</div>
        )}
      </div>
    </div>
  )
}
