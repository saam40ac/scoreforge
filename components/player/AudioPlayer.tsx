'use client'

import { useEffect, useRef, useState } from 'react'
import type { Track } from '@/lib/supabase/types'
import { trackEvent } from '@/lib/utils/analytics'

interface Props {
  track:        Track
  accentColor:  string
  theme:        'dark' | 'ivory' | 'neon'
  portfolioId:  string
  shareLinkId?: string
}

const TRACK_BG = { dark:'#17171f', ivory:'#ede8df', neon:'#0e0e20' }
const BORDER   = { dark:'rgba(255,255,255,0.07)', ivory:'rgba(0,0,0,0.09)', neon:'rgba(148,110,255,0.14)' }
const TEXT2    = { dark:'#a09888', ivory:'#4a4540', neon:'#9890b8' }
const TEXT3    = { dark:'#5a5548', ivory:'#9a9590', neon:'#4a4870' }

export default function AudioPlayer({ track, accentColor, theme, portfolioId, shareLinkId }: Props) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const wsRef           = useRef<any>(null)
  const lastPlaySentRef  = useRef<number>(0)     // timestamp ultimo play inviato
  const shareLinkIdRef   = useRef<string | undefined>(shareLinkId)  // sempre aggiornato

  // Aggiorna il ref ogni volta che la prop cambia (risoluzione asincrona)
  shareLinkIdRef.current = shareLinkId

  const [playing,  setPlaying]     = useState(false)
  const [ready,    setReady]       = useState(false)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [progress, setProgress]    = useState(0)

  useEffect(() => {
    if (!containerRef.current || !track.file_url) return

    let ws: any
    let destroyed = false

    import('wavesurfer.js').then(({ default: WaveSurfer }) => {
      if (destroyed || !containerRef.current) return

      ws = WaveSurfer.create({
        container:     containerRef.current,
        waveColor:     `${accentColor}45`,
        progressColor: accentColor,
        cursorColor:   accentColor,
        height:        36,
        barWidth:      2,
        barGap:        1.5,
        barRadius:     2,
        backend:       'WebAudio',
      })

      ws.on('ready', () => { if (!destroyed) setReady(true) })

      ws.on('play', () => {
        if (destroyed) return
        // Debounce: invia evento play solo se sono passati almeno 2 secondi
        // dall'ultimo invio (evita doppio firing di WaveSurfer)
        const now = Date.now()
        if (now - lastPlaySentRef.current > 2000) {
          lastPlaySentRef.current = now
          trackEvent({
            portfolio_id:  portfolioId,
            track_id:      track.id,
            event_type:    'play',
            play_position: Math.round(ws.getCurrentTime()),
            share_link_id: shareLinkIdRef.current,
          })
        }
      })

      ws.on('pause', () => {
        if (destroyed) return
        const pos = Math.round(ws.getCurrentTime())
        const dur = ws.getDuration() || 1
        trackEvent({
          portfolio_id:  portfolioId,
          track_id:      track.id,
          event_type:    'pause',
          pause_position: pos,
          duration_pct:  Math.round((pos / dur) * 100),
          share_link_id: shareLinkIdRef.current,
        })
      })

      ws.on('finish', () => {
        if (destroyed) return
        setPlaying(false)
        setProgress(100)
        trackEvent({
          portfolio_id:  portfolioId,
          track_id:      track.id,
          event_type:    'complete',
          duration_pct:  100,
          share_link_id: shareLinkIdRef.current,
        })
      })

      ws.on('audioprocess', () => {
        if (destroyed) return
        const t   = ws.getCurrentTime()
        const dur = ws.getDuration() || 1
        setProgress(Math.round((t / dur) * 100))
        const s = Math.floor(t)
        setCurrentTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
      })

      ws.on('seek', () => {
        if (destroyed) return
        trackEvent({
          portfolio_id:  portfolioId,
          track_id:      track.id,
          event_type:    'seek',
          play_position: Math.round(ws.getCurrentTime()),
          share_link_id: shareLinkIdRef.current,
        })
      })

      if (track.waveform_data) {
        ws.load(track.file_url, [track.waveform_data])
      } else {
        ws.load(track.file_url)
      }

      wsRef.current = ws
    })

    return () => {
      destroyed = true
      ws?.destroy()
      wsRef.current = null
      setReady(false)
      setPlaying(false)
      setProgress(0)
      setCurrentTime('0:00')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.file_url, track.id])

  function handlePlay() {
    if (!wsRef.current || !ready) return
    wsRef.current.playPause()
    setPlaying(p => !p)
  }

  const bg     = TRACK_BG[theme]
  const border = BORDER[theme]
  const text2  = TEXT2[theme]
  const text3  = TEXT3[theme]

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'11px', padding:'10px 13px', borderRadius:'8px', border:`1px solid ${border}`, background:bg }}>
      <button
        onClick={handlePlay}
        disabled={!ready && !!track.file_url}
        style={{
          width:'34px', height:'34px', borderRadius:'50%',
          background: playing ? `${accentColor}cc` : accentColor,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor: ready || !track.file_url ? 'pointer' : 'default',
          flexShrink:0, border:'none',
          fontSize: playing ? '10px' : '11px',
          color:'#09090f',
          opacity: (!ready && !!track.file_url) ? .5 : 1,
          transition:'all .15s',
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      <div style={{ minWidth:'80px', maxWidth:'140px', flexShrink:1, overflow:'hidden' }}>
        <div style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {track.title}
        </div>
        <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', color:text3, marginTop:'1px' }}>
          {track.genre || '—'}
        </div>
      </div>

      <div style={{ flex:1, minWidth:0, position:'relative', cursor:'pointer' }} onClick={handlePlay}>
        <div ref={containerRef} style={{ width:'100%' }}>
          {!track.file_url && (
            <div style={{ height:'36px', display:'flex', alignItems:'center', gap:'1.5px' }}>
              {Array.from({ length:32 }, (_, i) => (
                <div key={i} style={{ flex:1, height:`${Math.round(8 + Math.sin(i * 0.9) * 10 + (i % 3) * 4)}px`, background:`${accentColor}35`, borderRadius:'1px' }} />
              ))}
            </div>
          )}
        </div>
        {playing && (
          <div style={{ position:'absolute', bottom:'-4px', left:0, right:0, height:'2px', background:`${accentColor}20`, borderRadius:'1px' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:accentColor, borderRadius:'1px', transition:'width .5s linear' }} />
          </div>
        )}
      </div>

      <div style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', color:text2, whiteSpace:'nowrap', flexShrink:0, minWidth:'36px', textAlign:'right' }}>
        {playing ? currentTime : (track.duration_label || '—')}
      </div>
    </div>
  )
}
