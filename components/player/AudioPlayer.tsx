'use client'

import { useEffect, useRef, useState } from 'react'
import type { Track } from '@/lib/supabase/types'
import { trackEvent } from '@/lib/utils/analytics'

interface Props {
  track:        Track
  accentColor:  string
  theme:        'dark' | 'ivory' | 'neon'
  portfolioId:  string
  shareLinkId?: string   // passato dalla landing se c'è ?ref=
}

const TRACK_BG = { dark:'#17171f', ivory:'#ede8df', neon:'#0e0e20' }
const BORDER   = { dark:'rgba(255,255,255,0.07)', ivory:'rgba(0,0,0,0.09)', neon:'rgba(148,110,255,0.14)' }
const TEXT2    = { dark:'#a09888', ivory:'#4a4540', neon:'#9890b8' }
const TEXT3    = { dark:'#5a5548', ivory:'#9a9590', neon:'#4a4870' }

export default function AudioPlayer({ track, accentColor, theme, portfolioId, shareLinkId }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const wsRef         = useRef<any>(null)
  const playTrackedRef = useRef(false)   // ← impedisce doppio invio play
  const mountedRef    = useRef(false)    // ← impedisce double-mount StrictMode

  const [playing,  setPlaying]     = useState(false)
  const [ready,    setReady]       = useState(false)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [progress, setProgress]    = useState(0)

  useEffect(() => {
    // StrictMode monta due volte — saltiamo il secondo mount
    if (mountedRef.current) return
    mountedRef.current = true

    if (!containerRef.current || !track.file_url) return
    let ws: any

    import('wavesurfer.js').then(({ default: WaveSurfer }) => {
      if (!containerRef.current) return
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

      ws.on('ready', () => setReady(true))

      ws.on('play', () => {
        // Invia evento play UNA SOLA VOLTA per sessione di ascolto
        if (!playTrackedRef.current) {
          playTrackedRef.current = true
          trackEvent({
            portfolio_id:  portfolioId,
            track_id:      track.id,
            event_type:    'play',
            play_position: Math.round(ws.getCurrentTime()),
            share_link_id: shareLinkId,
          })
        }
      })

      ws.on('pause', () => {
        // Reset: se fa pause e poi riplay, tracciamo di nuovo
        playTrackedRef.current = false
        const pos = Math.round(ws.getCurrentTime())
        const dur = ws.getDuration() || 1
        const pct = Math.round((pos / dur) * 100)
        trackEvent({
          portfolio_id:  portfolioId,
          track_id:      track.id,
          event_type:    'pause',
          pause_position: pos,
          duration_pct:  pct,
          share_link_id: shareLinkId,
        })
      })

      ws.on('finish', () => {
        playTrackedRef.current = false
        setPlaying(false)
        setProgress(100)
        trackEvent({
          portfolio_id: portfolioId,
          track_id:     track.id,
          event_type:   'complete',
          duration_pct: 100,
          share_link_id: shareLinkId,
        })
      })

      ws.on('audioprocess', () => {
        const t   = ws.getCurrentTime()
        const dur = ws.getDuration() || 1
        setProgress(Math.round((t / dur) * 100))
        const s = Math.floor(t)
        setCurrentTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
      })

      ws.on('seek', () => {
        trackEvent({
          portfolio_id:  portfolioId,
          track_id:      track.id,
          event_type:    'seek',
          play_position: Math.round(ws.getCurrentTime()),
          share_link_id: shareLinkId,
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
      ws?.destroy()
      wsRef.current = null
    }
  }, [track.file_url, accentColor, portfolioId, track.id, shareLinkId, track.waveform_data])

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
        style={{ width:'34px', height:'34px', borderRadius:'50%', background: playing ? `${accentColor}cc` : accentColor, display:'flex', alignItems:'center', justifyContent:'center', cursor: ready || !track.file_url ? 'pointer' : 'default', flexShrink:0, border:'none', fontSize: playing ? '10px' : '11px', color:'#09090f', opacity:(!ready && !!track.file_url) ? .5 : 1, transition:'all .15s' }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      <div style={{ width:'140px', flexShrink:0 }}>
        <div style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{track.title}</div>
        <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', color:text3, marginTop:'1px' }}>{track.genre || '—'}</div>
      </div>

      <div style={{ flex:1, position:'relative', cursor:'pointer' }} onClick={handlePlay}>
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
