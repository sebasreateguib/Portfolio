"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface WaveformProps extends React.HTMLAttributes<HTMLDivElement> {
  bars?: number
  playing?: boolean
  variant?: "default" | "success" | "warning" | "danger"
  label?: string
  intensity?: "low" | "medium" | "high"
  audioSrc?: string
  compact?: boolean
}

const variantColor: Record<string, string> = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
}

const variantGlow: Record<string, string> = {
  default: "shadow-[0_0_6px_var(--primary)]",
  success: "shadow-[0_0_6px_rgba(34,197,94,0.5)]",
  warning: "shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  danger: "shadow-[0_0_6px_rgba(239,68,68,0.5)]",
}

const intensityRange = {
  low: { min: 8, max: 28 },
  medium: { min: 10, max: 40 },
  high: { min: 14, max: 48 },
}

const CONTAINER_HEIGHT = 52
const COMPACT_HEIGHT = 16

const compactIntensityRange = {
  low: { min: 4, max: 15 },
  medium: { min: 6, max: 16 },
  high: { min: 8, max: 16 },
}

export function Waveform({
  bars = 24,
  playing = true,
  variant = "default",
  label,
  intensity = "medium",
  audioSrc,
  compact = false,
  className,
  ...props
}: WaveformProps) {
  const [heights, setHeights] = React.useState<number[]>(() =>
    Array.from({ length: bars }, () => 4)
  )
  const rafRef = React.useRef<number>(0)
  const frameRef = React.useRef(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const containerHeight = compact ? COMPACT_HEIGHT : CONTAINER_HEIGHT
  const range = compact ? compactIntensityRange[intensity] : intensityRange[intensity]

  React.useEffect(() => {
    if (!playing) {
      setHeights(Array.from({ length: bars }, () => 4))
      cancelAnimationFrame(rafRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    if (audioSrc && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    function animate() {
      frameRef.current++
      const f = frameRef.current
      setHeights(
        Array.from({ length: bars }, (_, i) => {
          const wave1 = Math.sin(f * 0.06 + i * 0.5) * 0.5 + 0.5
          const wave2 = Math.sin(f * 0.1 + i * 0.3 + 2) * 0.3 + 0.3
          const noise = Math.random() * 0.2
          const combined = (wave1 + wave2 + noise) / 1.5
          return range.min + (range.max - range.min) * combined
        })
      )
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [playing, bars, range.min, range.max, audioSrc])

  return (
    <div
      data-slot="tron-waveform"
      className={cn(
        "relative overflow-hidden",
        compact
          ? "p-0"
          : "rounded border border-primary/30 bg-card/80 p-3 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {!compact && (
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
      )}

      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-foreground/80">
            {label}
          </span>
          <span className={cn("text-[9px] uppercase tracking-widest", playing ? "text-green-500 animate-pulse" : "text-foreground/40")}>
            {playing ? "LIVE" : "IDLE"}
          </span>
        </div>
      )}

      <div
        className="flex items-end justify-center gap-[2px]"
        style={{ height: containerHeight }}
      >
        {heights.map((h, i) => (
          <div
            key={i}
            className={cn(
              compact ? "w-1 rounded-none" : "w-1.5 rounded-t-sm",
              compact ? "bg-white/30" : variantColor[variant],
              !compact && playing && variantGlow[variant]
            )}
            style={{
              height: Math.max(2, h),
              opacity: playing ? 0.5 + (h / containerHeight) * 0.5 : 0.2,
            }}
          />
        ))}
      </div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} loop preload="auto" />
      )}

      {!compact && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary/50" />
          <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary/50" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary/50" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary/50" />
        </>
      )}
    </div>
  )
}

export default Waveform;
