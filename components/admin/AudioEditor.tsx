'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { X, Play, Pause, Download, RotateCcw, Scissors } from 'lucide-react'

interface Props {
  fileUrl: string
  fileName: string
  onClose: () => void
  onSave?: (blob: Blob, newName: string) => void
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}`
}

export default function AudioEditor({ fileUrl, fileName, onClose, onSave }: Props) {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const containerRef   = useRef<HTMLDivElement>(null)
  const fiCanvasRef    = useRef<HTMLCanvasElement>(null)
  const foCanvasRef    = useRef<HTMLCanvasElement>(null)
  const [buffer,       setBuffer]      = useState<AudioBuffer | null>(null)
  const [selStart,     setSelStart]    = useState(0)
  const [selEnd,       setSelEnd]      = useState(1)
  const [fadeIn,       setFadeIn]      = useState(0)
  const [fadeOut,      setFadeOut]     = useState(0)
  const [isPlaying,    setIsPlaying]   = useState(false)
  const [playheadPct,  setPlayheadPct] = useState(0)
  const [exporting,    setExporting]   = useState(false)
  const [loading,      setLoading]     = useState(true)
  const draggingRef    = useRef<'start' | 'end' | null>(null)
  const dragStartX     = useRef(0)
  const dragStartVal   = useRef(0)
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null)
  const gainRef        = useRef<GainNode | null>(null)
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const animRef        = useRef<number>(0)
  const startTimeRef   = useRef(0)
  const selStartRef    = useRef(0)
  const selEndRef      = useRef(1)

  selStartRef.current = selStart
  selEndRef.current   = selEnd

  // Carica il file audio
  useEffect(() => {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = ac
    fetch(fileUrl)
      .then(r => r.arrayBuffer())
      .then(ab => ac.decodeAudioData(ab))
      .then(buf => { setBuffer(buf); setLoading(false) })
      .catch(() => { toast.error('Errore nel caricamento del file audio'); setLoading(false) })
    return () => { stopPlay(); ac.close() }
  }, [fileUrl])

  // Disegna waveform
  useEffect(() => {
    if (!buffer || !canvasRef.current || !containerRef.current) return
    const canvas  = canvasRef.current
    const W       = containerRef.current.clientWidth || 600
    const dpr     = window.devicePixelRatio || 1
    canvas.width  = W * dpr
    canvas.height = 80 * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = '80px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const data = buffer.getChannelData(0)
    const step = Math.ceil(data.length / W)
    ctx.fillStyle = '#3a3648'
    for (let i = 0; i < W; i++) {
      let max = 0
      for (let j = 0; j < step; j++) { const v = Math.abs(data[i * step + j] || 0); if (v > max) max = v }
      const barH = Math.max(1, max * 36)
      ctx.fillRect(i, 40 - barH, 1, barH * 2)
    }
  }, [buffer])

  // Disegna fade curves
  const drawFade = useCallback((canvasEl: HTMLCanvasElement | null, type: 'in' | 'out', dur: number) => {
    if (!canvasEl) return
    const W = canvasEl.parentElement?.clientWidth || 180
    canvasEl.width = W; canvasEl.height = 32
    const ctx = canvasEl.getContext('2d')!
    ctx.clearRect(0, 0, W, 32)
    if (dur === 0) {
      ctx.strokeStyle = '#3a3648'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(W, 8); ctx.stroke()
      return
    }
    ctx.strokeStyle = '#c8a45a'; ctx.lineWidth = 2; ctx.setLineDash([])
    ctx.beginPath()
    if (type === 'in') { ctx.moveTo(0, 32); ctx.lineTo(W, 6) }
    else               { ctx.moveTo(0, 6);  ctx.lineTo(W, 32) }
    ctx.stroke()
    ctx.fillStyle = '#c8a45a22'
    ctx.beginPath()
    if (type === 'in') { ctx.moveTo(0, 32); ctx.lineTo(W, 6); ctx.lineTo(W, 32); ctx.closePath() }
    else               { ctx.moveTo(0, 6); ctx.lineTo(W, 32); ctx.lineTo(0, 32); ctx.closePath() }
    ctx.fill()
  }, [])

  useEffect(() => { drawFade(fiCanvasRef.current, 'in', fadeIn) }, [fadeIn, drawFade])
  useEffect(() => { drawFade(foCanvasRef.current, 'out', fadeOut) }, [fadeOut, drawFade])

  // Play / Stop
  function stopPlay() {
    try { sourceRef.current?.stop() } catch {}
    setIsPlaying(false)
    cancelAnimationFrame(animRef.current)
    setPlayheadPct(0)
  }

  function startPlay() {
    if (!buffer || !audioCtxRef.current) return
    stopPlay()
    const ac  = audioCtxRef.current
    const src = ac.createBufferSource()
    const gn  = ac.createGain()
    src.buffer = buffer
    src.connect(gn); gn.connect(ac.destination)
    const dur  = buffer.duration
    const s    = selStartRef.current * dur
    const e    = selEndRef.current   * dur
    const selD = e - s
    startTimeRef.current = ac.currentTime
    src.start(0, s, selD)
    sourceRef.current = src; gainRef.current = gn
    setIsPlaying(true)
    src.onended = () => { setIsPlaying(false); setPlayheadPct(0) }
    const tick = () => {
      const elapsed = ac.currentTime - startTimeRef.current
      const pct = Math.min(elapsed / selD, 1)
      setPlayheadPct(pct)
      if (pct < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const W = containerRef.current.clientWidth
    const x = e.nativeEvent.offsetX / W
    const dS = Math.abs(x - selStart)
    const dE = Math.abs(x - selEnd)
    if (dS < 0.025)      { draggingRef.current = 'start'; dragStartX.current = e.clientX; dragStartVal.current = selStart }
    else if (dE < 0.025) { draggingRef.current = 'end';   dragStartX.current = e.clientX; dragStartVal.current = selEnd   }
    else                 { setSelStart(Math.max(0, Math.min(x, selEnd - 0.01))) }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return
      const W = containerRef.current.clientWidth
      const delta = (e.clientX - dragStartX.current) / W
      if (draggingRef.current === 'start') setSelStart(v => Math.max(0, Math.min(dragStartVal.current + delta, selEndRef.current - 0.01)))
      else setSelEnd(v => Math.min(1, Math.max(dragStartVal.current + delta, selStartRef.current + 0.01)))
    }
    const onUp = () => { draggingRef.current = null }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [])

  // Esporta
  async function exportAudio() {
    if (!buffer) return
    setExporting(true)
    try {
      const dur = buffer.duration
      const s   = selStart * dur; const e = selEnd * dur; const selD = e - s
      const sr  = buffer.sampleRate; const nCh = buffer.numberOfChannels
      const startSample = Math.floor(s * sr); const len = Math.floor(selD * sr)
      const offCtx = new OfflineAudioContext(nCh, len, sr)
      const srcBuf = offCtx.createBuffer(nCh, len, sr)
      for (let c = 0; c < nCh; c++) {
        const d = new Float32Array(len)
        buffer.copyFromChannel(d, c, startSample)
        srcBuf.copyToChannel(d, c)
      }
      const src = offCtx.createBufferSource()
      const gn  = offCtx.createGain()
      src.buffer = srcBuf; src.connect(gn); gn.connect(offCtx.destination)
      const now = offCtx.currentTime
      // Imposta sempre il valore iniziale esplicito — necessario per OfflineAudioContext
      gn.gain.setValueAtTime(fadeIn > 0 ? 0 : 1, now)
      // Fade-in: da 0 a 1
      if (fadeIn > 0) {
        gn.gain.linearRampToValueAtTime(1, now + Math.min(fadeIn, selD * 0.8))
      }
      // Fade-out: da 1 a 0 (schedula dopo il fade-in se presente)
      if (fadeOut > 0) {
        const foStart = Math.max(now + (fadeIn > 0 ? Math.min(fadeIn, selD * 0.8) : 0), now + selD - fadeOut)
        gn.gain.setValueAtTime(1, foStart)
        gn.gain.linearRampToValueAtTime(0.001, now + selD)
      }
      src.start(0)
      const rendered = await offCtx.startRendering()
      const blob = bufToWav(rendered)
      const base = fileName.replace(/\.[^.]+$/, '')
      const newName = `${base}_${s.toFixed(1)}-${e.toFixed(1)}.wav`
      if (onSave) {
        onSave(blob, newName)
        toast.success('File elaborato e pronto per il caricamento!')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = newName; a.click()
        URL.revokeObjectURL(url)
        toast.success('File scaricato!')
      }
    } catch (err) {
      toast.error('Errore durante l\'esportazione')
    }
    setExporting(false)
  }

  function bufToWav(buf: AudioBuffer): Blob {
    const nCh = buf.numberOfChannels; const sr = buf.sampleRate; const len = buf.length
    const ab = new ArrayBuffer(44 + len * nCh * 2); const v = new DataView(ab)
    const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
    w(0,'RIFF'); v.setUint32(4, 36 + len*nCh*2, true); w(8,'WAVE'); w(12,'fmt ')
    v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nCh,true)
    v.setUint32(24,sr,true); v.setUint32(28,sr*nCh*2,true); v.setUint16(32,nCh*2,true); v.setUint16(34,16,true)
    w(36,'data'); v.setUint32(40,len*nCh*2,true)
    let offset = 44
    for (let i = 0; i < len; i++) for (let c = 0; c < nCh; c++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]))
      v.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); offset += 2
    }
    return new Blob([ab], { type: 'audio/wav' })
  }

  const dur    = buffer?.duration || 0
  const selDur = (selEnd - selStart) * dur
  const W_pct  = (w: number) => `${w}%`

  const cS: React.CSSProperties = {
    background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '16px',
    padding: '24px', maxWidth: '100%', fontFamily: "'Outfit', sans-serif",
  }

  return (
    <div style={cS}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#f0ebe0', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Scissors size={14} color="#c8a45a" /> Editor Audio
          </div>
          <div style={{ fontSize: '11px', color: '#5a5548', fontFamily: 'DM Mono, monospace', marginTop: '3px' }}>{fileName}</div>
        </div>
        <button onClick={() => { stopPlay(); onClose() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a5548', padding: '2px' }}>
          <X size={16} />
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '32px', color: '#5a5548', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Caricamento waveform…</div>}

      {!loading && buffer && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Durata totale', val: fmt(dur) },
              { label: 'Selezione',     val: fmt(selDur) },
              { label: 'Inizio / Fine', val: `${fmt(selStart * dur)} → ${fmt(selEnd * dur)}` },
            ].map(s => (
              <div key={s.label} style={{ background: '#0a0a12', border: '1px solid #2a2830', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: '#c8a45a' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Waveform */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            style={{ position: 'relative', height: '80px', background: '#0a0a12', borderRadius: '8px', overflow: 'hidden', cursor: 'crosshair', border: '1px solid #2a2830', marginBottom: '8px' }}
          >
            <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />
            {/* Selection overlay */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: W_pct(selStart * 100), width: W_pct((selEnd - selStart) * 100), background: 'rgba(200,164,90,0.15)', borderLeft: '2px solid #c8a45a', borderRight: '2px solid #c8a45a', pointerEvents: 'none' }} />
            {/* Handles */}
            <div onMouseDown={e => { e.stopPropagation(); draggingRef.current = 'start'; dragStartX.current = e.clientX; dragStartVal.current = selStart }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${selStart * 100}% - 8px)`, width: '16px', cursor: 'ew-resize', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '3px', height: '28px', background: '#c8a45a', borderRadius: '2px' }} />
            </div>
            <div onMouseDown={e => { e.stopPropagation(); draggingRef.current = 'end'; dragStartX.current = e.clientX; dragStartVal.current = selEnd }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${selEnd * 100}% - 8px)`, width: '16px', cursor: 'ew-resize', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '3px', height: '28px', background: '#c8a45a', borderRadius: '2px' }} />
            </div>
            {/* Playhead */}
            {isPlaying && (
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', background: '#e2c47e', pointerEvents: 'none', left: `${(selStart + playheadPct * (selEnd - selStart)) * 100}%` }} />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#5a5548', marginBottom: '16px' }}>
            <span>IN: {fmt(selStart * dur)}</span>
            <span style={{ color: '#3a3648' }}>← trascina le maniglie per tagliare →</span>
            <span>OUT: {fmt(selEnd * dur)}</span>
          </div>

          {/* Fade controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Fade-in', val: fadeIn, set: setFadeIn, ref: fiCanvasRef, type: 'in' as const },
              { label: 'Fade-out', val: fadeOut, set: setFadeOut, ref: foCanvasRef, type: 'out' as const },
            ].map(f => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#5a5548', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em' }}>{f.label}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#c8a45a' }}>{f.val.toFixed(1)}s</span>
                </div>
                <input type="range" min={0} max={Math.min(8, selDur * 0.8)} step={0.1} value={f.val}
                  onChange={e => f.set(parseFloat(e.target.value))}
                  style={{ width: '100%', marginBottom: '6px' }} />
                <div style={{ height: '28px', background: '#0a0a12', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a2830' }}>
                  <canvas ref={f.ref} style={{ display: 'block', width: '100%', height: '28px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => isPlaying ? stopPlay() : startPlay()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#c8a45a20', border: '1px solid #c8a45a44', color: '#c8a45a', fontSize: '13px', cursor: 'pointer' }}>
              {isPlaying ? <><Pause size={13} /> Stop</> : <><Play size={13} /> Anteprima</>}
            </button>
            <button onClick={() => { setSelStart(0); setSelEnd(1); setFadeIn(0); setFadeOut(0); stopPlay() }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'none', border: '1px solid #2a2830', color: '#5a5548', fontSize: '13px', cursor: 'pointer' }}>
              <RotateCcw size={13} /> Reset
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={exportAudio} disabled={exporting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: '#c8a45a', border: 'none', color: '#07070d', fontSize: '13px', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? .7 : 1 }}>
              <Download size={13} /> {exporting ? 'Elaborazione…' : onSave ? 'Salva nel portfolio' : 'Scarica WAV'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
