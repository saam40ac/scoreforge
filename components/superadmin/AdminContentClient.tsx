'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { portfolioUrl } from '@/lib/utils/url'

interface Portfolio {
  id: string; title: string; slug: string; status: string; theme: string
  owner_id: string; view_count: number; created_at: string; updated_at: string; noindex: boolean
}

const STATUS_COLORS: Record<string,string> = { published:'#4bb87a', draft:'#5a5548', private:'#378add' }

export default function AdminContentClient({ portfolios: init, ownerMap }: { portfolios: Portfolio[]; ownerMap: Record<string,any> }) {
  const supabase = createClient()
  const [portfolios, setPortfolios] = useState(init)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'published'|'draft'|'private'>('all')

  const filtered = portfolios.filter(p => {
    const owner = ownerMap[p.owner_id]
    const q = search.toLowerCase()
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q) || owner?.name?.toLowerCase().includes(q)
    const matchFilter = filter === 'all' ? true : p.status === filter
    return matchSearch && matchFilter
  })

  async function toggleVisibility(p: Portfolio) {
    const newStatus = p.status === 'published' ? 'private' : 'published'
    const { error } = await supabase.from('portfolios').update({ status: newStatus }).eq('id', p.id)
    if (error) { toast.error('Errore: ' + error.message); return }
    setPortfolios(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x))
    toast.success(newStatus === 'private' ? 'Portfolio oscurato.' : 'Portfolio ripristinato.')
  }

  async function toggleNoindex(p: Portfolio) {
    const { error } = await supabase.from('portfolios').update({ noindex: !p.noindex }).eq('id', p.id)
    if (error) { toast.error('Errore: ' + error.message); return }
    setPortfolios(prev => prev.map(x => x.id === p.id ? { ...x, noindex: !p.noindex } : x))
    toast.success(!p.noindex ? 'Portfolio escluso dai motori di ricerca.' : 'Portfolio indicizzabile.')
  }

  const s = {
    input: { background: '#0a0a12', border: '1px solid #2a2830', borderRadius: '8px', padding: '8px 12px', color: '#f0ebe0', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" } as React.CSSProperties,
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5a5548' }} />
          <input style={{ ...s.input, paddingLeft: '32px', width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per titolo, slug o artista…" />
        </div>
        <select style={{ ...s.input, cursor: 'pointer' }} value={filter} onChange={e => setFilter(e.target.value as any)}>
          <option value="all">Tutti gli stati</option>
          <option value="published">Pubblicati</option>
          <option value="draft">Bozze</option>
          <option value="private">Privati / Oscurati</option>
        </select>
      </div>

      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Titolo', 'Artista', 'Slug', 'Tema', 'Views', 'Stato', 'noindex', 'Azioni'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '9.5px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const owner = ownerMap[p.owner_id]
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #14141f' }}>
                  <td style={{ padding: '10px 14px', color: '#f0ebe0', fontWeight: 500 }}>{p.title}</td>
                  <td style={{ padding: '10px 14px', color: '#a09888', fontSize: '12px' }}>
                    <div>{owner?.name || '—'}</div>
                    <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>{owner?.plan || 'free'}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#5a5548', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>{p.slug}</td>
                  <td style={{ padding: '10px 14px', color: '#5a5548', fontSize: '11px' }}>{p.theme}</td>
                  <td style={{ padding: '10px 14px', color: '#c8a45a', fontFamily: 'DM Mono, monospace' }}>{p.view_count || 0}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', background: STATUS_COLORS[p.status]+'18', color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}44` }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '10px', color: p.noindex ? '#c94b4b' : '#4bb87a', fontFamily: 'DM Mono, monospace' }}>
                      {p.noindex ? 'SI' : 'NO'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button onClick={() => toggleVisibility(p)} title={p.status === 'published' ? 'Oscura' : 'Ripristina'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: p.status === 'published' ? '#c94b4b' : '#4bb87a' }}>
                        {p.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => toggleNoindex(p)} title={p.noindex ? 'Consenti indicizzazione' : 'Escludi da motori ricerca'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: p.noindex ? '#4bb87a' : '#c8a45a', fontSize: '10px', fontFamily: 'DM Mono, monospace' }}>
                        IDX
                      </button>
                      {p.status === 'published' && (
                        <a href={portfolioUrl(p.slug)} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#5a5548', display: 'flex', alignItems: 'center' }}>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#5a5548', fontSize: '13px' }}>Nessun portfolio trovato.</div>
        )}
      </div>
    </div>
  )
}
