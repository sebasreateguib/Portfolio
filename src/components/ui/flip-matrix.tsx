"use client";

import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { cn } from "../../lib/utils";

// Minimal 5x7 Font Definition
const GLYPH_W = 5;
const GLYPH_H = 7;

function glyphBitmap(ch: string, cols: number, rows: number): boolean[][] {
  const glyphs: Record<string, number[]> = {
    "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
    "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    "2": [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
    "3": [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
    "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
    "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
    "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
    "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
    "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
    "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
    ":": [0b00000, 0b00100, 0b00000, 0b00000, 0b00000, 0b00100, 0b00000],
    " ": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
    "A": [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    "B": [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
    "C": [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
    "D": [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
    "E": [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
    "F": [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
    "G": [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
    "H": [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    "I": [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
    "J": [0b00011, 0b00001, 0b00001, 0b00001, 0b10001, 0b10001, 0b01110],
    "K": [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
    "L": [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
    "M": [0b10001, 0b11011, 0b10101, 0b10001, 0b10001, 0b10001, 0b10001],
    "N": [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
    "O": [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    "P": [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
    "Q": [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b01110, 0b00001],
    "R": [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    "S": [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
    "T": [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
    "U": [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    "V": [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
    "W": [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
    "X": [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
    "Y": [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
    "Z": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  };

  const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
  const chars = ch.toUpperCase().split("");
  const totalW = chars.length * (GLYPH_W + 1) - 1;

  let ox = Math.max(0, Math.floor((cols - totalW) / 2));
  const oy = Math.max(0, Math.floor((rows - GLYPH_H) / 2));

  for (const c of chars) {
    const rowsBits = glyphs[c] || glyphs[" "];
    for (let y = 0; y < GLYPH_H; y++) {
      for (let x = 0; x < GLYPH_W; x++) {
        if (oy + y < rows && ox + x < cols) {
          grid[oy + y][ox + x] = !!(rowsBits[y] & (1 << (GLYPH_W - 1 - x)));
        }
      }
    }
    ox += GLYPH_W + 1;
  }
  return grid;
}

/** Columns needed to fit `n` glyphs, so a mode never renders clipped text. */
export function colsForChars(n: number): number {
  return n * (GLYPH_W + 1) - 1;
}

// Memoized Disk component
const Disk = memo(({ on, color, duration, delay }: { on: boolean; color: string; duration: number; delay: number }) => {
  const [peek, setPeek] = useState(false);

  // Single source of truth for the transform: the inline style would override any
  // hover:* utility class, so the hover state has to live here too.
  const angle = on ? 180 : peek ? 90 : 0;

  return (
    <div
      className="relative w-full aspect-square cursor-crosshair"
      style={{ perspective: "400px" }}
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
    >
      <div
        className="absolute inset-0 w-full h-full transition-transform ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${angle}deg)`,
          transitionDuration: `${peek && !on ? Math.min(duration, 100) : duration}ms`,
          // Column-staggered so the board falls left-to-right like the real thing.
          // Hover must react instantly, so it opts out.
          transitionDelay: peek ? "0ms" : `${delay}ms`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full bg-neutral-900 border border-neutral-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          style={{ backfaceVisibility: "hidden" }}
        />
        <div
          className="absolute inset-0 rounded-full shadow-[inset_0_-2px_6px_rgba(0,0,0,0.2)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
            backgroundColor: color,
            border: `1px solid ${color}`,
          }}
        />
      </div>
    </div>
  );
});
Disk.displayName = "Disk";

export type FlipDiskMode = "time" | "wave" | "text" | "noise";

export interface FlipDiskMatrixProps {
  /** Initial mode. When `showControls` is false this is the fixed mode. */
  mode?: FlipDiskMode;
  /** Text for `text` mode. Max 4 chars fit comfortably in the default 31 columns. */
  text?: string;
  /** IANA time zone for `time` mode. Defaults to the visitor's own zone. */
  timeZone?: string;
  cols?: number;
  rows?: number;
  /** Lit-disk color. */
  color?: string;
  /** Per-column flip delay in ms, for the cascade. Defaults to 0 on wave/noise. */
  stagger?: number;
  /** Renders the mode switcher + text input. Off by default (demo only). */
  showControls?: boolean;
  className?: string;
}

export function FlipDiskMatrix({
  mode: initialMode = "time",
  text: initialText = "FLIP",
  timeZone,
  cols = 31,
  rows = 11,
  color = "#E5FD52",
  stagger,
  showControls = false,
  className,
}: FlipDiskMatrixProps = {}) {
  const [uiMode, setUiMode] = useState<FlipDiskMode>(initialMode);
  const [uiText, setUiText] = useState<string>(initialText);

  const mode = showControls ? uiMode : initialMode;
  const text = showControls ? uiText : initialText;

  // Wave and noise repaint faster than a full cascade takes, so they stay flat.
  const ambient = mode === "wave" || mode === "noise";
  const flipStagger = stagger ?? (ambient ? 0 : 12);

  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [bits, setBits] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(false))
  );

  // Reset the grid when its dimensions change, otherwise the diff below indexes
  // into rows that no longer exist.
  useEffect(() => {
    setBits(Array.from({ length: rows }, () => Array(cols).fill(false)));
  }, [rows, cols]);

  // Only animate while on screen — 341 discs repainting behind the fold is pure waste.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const computeTarget = useCallback(
    (t: number): boolean[][] => {
      if (mode === "text" || mode === "time") {
        const display =
          mode === "time"
            ? new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone,
            })
            : text;
        return glyphBitmap(display, cols, rows);
      }
      if (mode === "wave") {
        return Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const v = Math.sin(x * 0.2 + t * 3) * Math.cos(y * 0.3 + t * 2);
            return v > 0.2;
          })
        );
      }
      // Noise pattern
      return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() > 0.6)
      );
    },
    [mode, text, timeZone, cols, rows]
  );

  const paint = useCallback((next: boolean[][]) => {
    setBits((prev) => {
      if (prev.length !== next.length || prev[0]?.length !== next[0]?.length) return next;
      let changed = false;
      const newBits = prev.map((row, y) =>
        row.map((cell, x) => {
          if (cell !== next[y][x]) changed = true;
          return next[y][x];
        })
      );
      return changed ? newBits : prev;
    });
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Nothing to animate: `text` only changes when the prop does, and ambient
    // modes are decoration we freeze when the visitor asked for reduced motion.
    // Either way, paint one frame and skip the rAF loop entirely.
    if (mode === "text" || (reduced && ambient)) {
      paint(computeTarget(0));
      return;
    }

    let raf = 0;
    let last = 0;

    const getInterval = () => {
      if (mode === "wave") return 150;
      if (mode === "noise") return 250;
      return 1000;
    };

    const loop = (now: number) => {
      if (now - last > getInterval()) {
        last = now;
        paint(computeTarget(now / 1000));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [computeTarget, paint, mode, ambient, visible, reduced]);

  return (
    <div
      ref={rootRef}
      className={cn("flex flex-col items-center gap-6 w-full", className)}
      style={{ "--flip-accent": color } as React.CSSProperties}
    >
      {showControls && (
        <>
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            {(["time", "text", "wave", "noise"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setUiMode(m)}
                className={`px-3 py-1.5 text-xs font-mono uppercase rounded-md transition-all ${uiMode === m
                    ? "text-black font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                  }`}
                style={uiMode === m ? { backgroundColor: color } : undefined}
              >
                {m}
              </button>
            ))}
          </div>

          {uiMode === "text" && (
            <div className="flex flex-col items-center gap-1.5">
              <input
                type="text"
                value={uiText}
                maxLength={4}
                onChange={(e) => {
                  // Strip out anything that is NOT a defined glyph character
                  setUiText(e.target.value.toUpperCase().replace(/[^A-Z0-9: ]/g, ""));
                }}
                placeholder="TYPE (MAX 4)"
                className="px-4 py-2 text-sm font-mono uppercase bg-neutral-900 border border-neutral-700 rounded-lg text-center tracking-[0.3em] text-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--flip-accent)]"
              />
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
                ONLY A-Z, 0-9, COLON &amp; SPACE (MAX 4)
              </span>
            </div>
          )}
        </>
      )}

      <div className="relative w-full p-2 md:p-5 rounded-2xl bg-[#0f0f0f] border border-neutral-800 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8),_0_20px_40px_rgba(0,0,0,0.5)]">
        {/* Inner Screen Bezel */}
        <div className="relative bg-black rounded-lg p-2 md:p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
          <div
            className="grid w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: "min(0.4vw, 3px)",
            }}
          >
            {bits.map((row, y) =>
              row.map((on, x) => (
                <Disk
                  key={`${x}-${y}`}
                  on={on}
                  color={color}
                  duration={reduced ? 0 : 600}
                  delay={reduced ? 0 : x * flipStagger}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
