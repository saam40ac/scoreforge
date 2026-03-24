'use client'

import { useEffect, useRef, useState } from 'react'
import type { Track } from '@/lib/supabase/types'

interface Props {
  track: Track
  accentColor: string
  theme: 'dark' | 'ivory' | 'neon'
}

const TRACK_BG = { dark: '#17171f', ivory: '#ede8df', neon: '#0e0e20' }
const BORDER   = { dark: 'rgba(255,255,255,0.07)', ivory: 'rgba(0,0,0,0.09)', neon: 'rgba(148,110,255,0.14)' }
const TEXT2    = { dark: '#a09888', ivory: '#4a4540', neon: '#9890b8' }
const TEXT3    = { dark: '#5a5548', ivory: '#9a9590', neon: '#4a4870' }

export default function AudioPlayer({ track, accentColor, theme }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef        = useRef<unknown>(null)
  const [playing,    setPlaying]   = useState(false)
  const [ready,      setReady]     = useState(false)
  const [currentTime, setCurrentTime] = useState('0:00')

  useEffect(() => {
    if (!containerRef.current || !track.file_url) return

    let ws: { playPause:()=>void; destroy:()=>void; on:(e:string, cb:(...a:unknown[])=>void)=>void; getCurrentTime:()=>number }

    import('wavesurfer.js').then(({ default: WaveSurfer }) => {
      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: `${accentColor}50`,
        progressColor: accentColor,
        cursorColor: accentColor,
        height: 36,
        barWidth: 2,
        barGap: 1.5,
        barRadius: 2,
        backend: 'WebAudio',
      }) as typeof ws

      ws.on('ready', () => setReady(true))
      ws.on('finish', () => { setPlaying(false); setCurrentTime('0:00') })
      ws.on('audioprocess', () => {
        const t = Math.floor(ws.getCurrentTime())
        setCurrentTime(`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`)
      })

      if (track.waveform_data) {
        ws.load(track.file_url!, [track.waveform_data as unknown as number[]])
      } else {
        ws.load(track.file_url!)
      }

      wsRef.current = ws
    })

    return () => { ws?.destroy() }
  }, [track.file_url, accentColor, track.waveform_data])

  function handlePlay() {
    if (!wsRef.current) return
    const ws = wsRef.current as { playPause:()=>void }
    ws.playPause()
    setPlaying(p => !p)
  }

  const bg     = TRACK_BG[theme]
  const border = BORDER[theme]
  const text2  = TEXT2[theme]
  const text3  = TEXT3[theme]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 13px', borderRadius: '8px', border: `1px solid ${border}`, background: bg }}>
      <button
        onClick={handlePlay}
        disabled={!ready && !!track.file_url}
        style={{ width: '32px', height: '32px', borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: track.file_url ? 'pointer' : 'default', flexShrink: 0, border: 'none', fontSize: '11px', color: '#09090f', opacity: (!ready && !!track.file_url) ? .5 : 1, transition: 'transform .15s' }}
      >
        {playing ? '⏸' : '▶'}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.title}
        </div>
        <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: text3, marginTop: '1px' }}>
          {track.genre}
        </div>
      </div>

      {/* Waveform canvas */}
      <div ref={containerRef} style={{ flex: 1, minWidth: 0 }}>
        {!track.file_url && (
          <div style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} style={{ flex: 1, height: `${Math.round(8 + Math.sin(i * 0.8) * 10 + Math.random() * 10)}px`, background: `${accentColor}40`, borderRadius: '1px' }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: text2, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {playing ? currentTime : (track.duration_label || '—')}
      </div>
    </div>
  )
}
