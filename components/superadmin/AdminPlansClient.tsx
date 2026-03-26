'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

interface Plan {
  id: string; name: string; label: string; price_eur: number; price_eur_annual: number
  max_portfolios: number; max_tracks: number; max_storage_mb: number
  features: string[]; active: boolean; sort_order: number
}

const PLAN_COLORS: Record<string,string> = { free:'#5a5548', pro:'#c8a45a', studio:'#e2c47e', enterprise:'#f5e4b8' }

export default function AdminPlansClient({ plans: init, userCounts }: { plans: Plan[]; userCounts: Record<string,number> }) {
  const supabase = createClient()
  const [plans, setPlans] = useState(init)
  const [saving, setSaving] = useState<string|null>(null)

  async function savePlan(plan: Plan) {
    setSaving(plan.id)
    const { error } = await supabase.from('subscription_plans').update({
      label: plan.label,
      price_eur: plan.price_eur,
      price_eur_annual: plan.price_eur_annual,
      max_portfolios: plan.max_portfolios,
      max_tracks: plan.max_tracks,
      max_storage_mb: plan.max_storage_mb,
      active: plan.active,
    }).eq('id', plan.id)
    setSaving(null)
    error ? toast.error('Errore: ' + error.message) : toast.success(`Piano ${plan.label} aggiornato.`)
  }

  function update(id: string, field: keyof Plan, value: any) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const totalMRR = plans.reduce((acc, p) => acc + (p.price_eur || 0) * (userCounts[p.name] || 0), 0)
  const totalUsers = Object.values(userCounts).reduce((a,b) => a+b, 0)

  const s = {
    input: { background: '#0a0a12', border: '1px solid #2a2830', borderRadius: '6px', padding: '7px 10px', color: '#f0ebe0', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif", width: '100%' } as React.CSSProperties,
    label: { fontSize: '9px', color: '#5a5548', textTransform: 'uppercase' as const, letterSpacing: '.1em', fontFamily: 'DM Mono, monospace', display: 'block', marginBottom: '4px' },
  }

  return (
    <div>
      {/* Revenue KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>MRR stimato</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: '#c8a45a', lineHeight: 1 }}>€{totalMRR.toFixed(0)}</div>
          <div style={{ fontSize: '11px', color: '#5a5548', marginTop: '4px' }}>su {totalUsers} utenti totali</div>
        </div>
        {plans.map(p => (
          <div key={p.id} style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ fontSize: '10px', color: PLAN_COLORS[p.name] || '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>{p.label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 300, color: PLAN_COLORS[p.name] || '#5a5548', lineHeight: 1 }}>{userCounts[p.name] || 0}</div>
            <div style={{ fontSize: '11px', color: '#5a5548', marginTop: '4px' }}>utenti · €{p.price_eur}/mese</div>
          </div>
        ))}
      </div>

      {/* Editor piani */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '14px' }}>
        {plans.map(p => (
          <div key={p.id} style={{ background: '#0f0f1a', border: `1px solid ${PLAN_COLORS[p.name] || '#1e1e2e'}44`, borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: PLAN_COLORS[p.name] || '#f0ebe0' }}>{p.label}</div>
                <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace' }}>{userCounts[p.name] || 0} utenti attivi</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: '#5a5548' }}>
                <input type="checkbox" checked={p.active} onChange={e => update(p.id, 'active', e.target.checked)} />
                Attivo
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={s.label}>Prezzo mensile (€)</label>
                <input type="number" style={s.input} value={p.price_eur} onChange={e => update(p.id, 'price_eur', +e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Prezzo annuale (€)</label>
                <input type="number" style={s.input} value={p.price_eur_annual} onChange={e => update(p.id, 'price_eur_annual', +e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Max portfolio</label>
                <input type="number" style={s.input} value={p.max_portfolios} onChange={e => update(p.id, 'max_portfolios', +e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Max tracce</label>
                <input type="number" style={s.input} value={p.max_tracks} onChange={e => update(p.id, 'max_tracks', +e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={s.label}>Storage (MB)</label>
                <input type="number" style={s.input} value={p.max_storage_mb} onChange={e => update(p.id, 'max_storage_mb', +e.target.value)} />
              </div>
            </div>

            <button onClick={() => savePlan(p)} disabled={saving === p.id}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: saving === p.id ? 'not-allowed' : 'pointer', border: `1px solid ${PLAN_COLORS[p.name] || '#c8a45a'}44`, background: (PLAN_COLORS[p.name] || '#c8a45a') + '12', color: PLAN_COLORS[p.name] || '#c8a45a', opacity: saving === p.id ? .6 : 1 }}>
              <Save size={12} /> {saving === p.id ? 'Salvo…' : 'Salva piano'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
