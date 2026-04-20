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
  const wsRef           = useRef<any>(null)
  const lastPlaySentRef  = useRef<number>(0)
  const shareLinkIdRef   = useRef<string | undefined>(shareLinkId)
  shareLinkIdRef.current = shareLinkId

  const [playing,  setPlaying]     = useState(false)
  const [ready,    setReady]       = useState(false)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [progress, setProgress]    = useState(0)

  useEffect(() => {
    if (!track.file_url) return
    let audio: HTMLAudioElement | null = new Audio(track.file_url)
    let destroyed = false

    audio.addEventListener('canplay', () => { if (!destroyed) setReady(true) })

    audio.addEventListener('timeupdate', () => {
      if (destroyed || !audio) return
      const t   = audio.currentTime
      const dur = audio.duration || 1
      setProgress(Math.round((t / dur) * 100))
      const s = Math.floor(t)
      setCurrentTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`)
    })

    audio.addEventListener('play', () => {
      if (destroyed) return
      const now = Date.now()
      if (now - lastPlaySentRef.current > 2000) {
        lastPlaySentRef.current = now
        trackEvent({ portfolio_id: portfolioId, track_id: track.id, event_type: 'play', play_position: Math.round(audio!.currentTime), share_link_id: shareLinkIdRef.current })
      }
    })

    audio.addEventListener('pause', () => {
      if (destroyed) return
      const pos = Math.round(audio!.currentTime)
      const dur = audio!.duration || 1
      trackEvent({ portfolio_id: portfolioId, track_id: track.id, event_type: 'pause', pause_position: pos, duration_pct: Math.round((pos / dur) * 100), share_link_id: shareLinkIdRef.current })
    })

    audio.addEventListener('ended', () => {
      if (destroyed) return
      setPlaying(false)
      setProgress(100)
      trackEvent({ portfolio_id: portfolioId, track_id: track.id, event_type: 'complete', duration_pct: 100, share_link_id: shareLinkIdRef.current })
    })

    wsRef.current = audio

    return () => {
      destroyed = true
      audio?.pause()
      audio = null
      wsRef.current = null
      setReady(false)
      setPlaying(false)
      setProgress(0)
      setCurrentTime('0:00')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.file_url, track.id])

  function handlePlay() {
    const audio = wsRef.current as HTMLAudioElement | null
    if (!audio || !ready) return
    if (audio.paused) {
      audio.play()
      setPlaying(true)
    } else {
      audio.pause()
      setPlaying(false)
    }
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

      <div style={{ minWidth:'70px', maxWidth:'130px', flexShrink:1, overflow:'hidden' }}>
        <div style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {track.title}
        </div>
        <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', color:text3, marginTop:'1px' }}>
          {track.genre || '—'}
        </div>
      </div>

      {/* Barra di progresso semplice — senza waveform */}
      <div style={{ flex:1, minWidth:0, cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'center', gap:'4px' }} onClick={handlePlay}>
        <div style={{ height:'3px', background:`${accentColor}20`, borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:accentColor, borderRadius:'2px', transition:'width .4s linear' }} />
        </div>
      </div>

      <div style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', color:text2, whiteSpace:'nowrap', flexShrink:0, minWidth:'36px', textAlign:'right' }}>
        {playing ? currentTime : (track.duration_label || '—')}
      </div>
    </div>
  )
}
