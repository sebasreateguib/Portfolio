'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Terminal, Code, Cpu, Globe } from 'lucide-react';
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";

const FRAME_COUNT = 240;

const getImagePath = (i: number) =>
  `/mac-3k-optimized/frame-${String(i + 1).padStart(3, "0")}.jpg`;

// Copy layout config (text comes from translations)
const COPY_STAGES_CONFIG = [
  {
    threshold: 0,
    translationKey: "stage1" as const,
    textColor: "text-green-400",
    cursorColor: "bg-green-400",
    position: "bottom-24 left-4 right-4 md:bottom-20 md:left-8 md:top-auto md:right-auto",
    animationClass: "slide-in-from-left-8"
  },
  {
    threshold: 0.25,
    translationKey: "stage2" as const,
    textColor: "text-amber-400",
    cursorColor: "bg-amber-400",
    position: "top-32 left-4 right-4 md:top-32 md:right-12 md:bottom-auto md:left-auto",
    animationClass: "slide-in-from-right-8"
  },
  {
    threshold: 0.5,
    translationKey: "stage3" as const,
    textColor: "text-cyan-400",
    cursorColor: "bg-cyan-400",
    position: "bottom-32 left-4 right-4 md:bottom-32 md:left-24 md:top-auto md:right-auto",
    animationClass: "slide-in-from-left-8"
  },
  {
    threshold: 0.75,
    translationKey: "stage4" as const,
    textColor: "text-purple-400",
    cursorColor: "bg-purple-400",
    position: "top-24 left-4 right-4 md:top-24 md:right-24 md:bottom-auto md:left-auto",
    animationClass: "slide-in-from-right-8"
  },
];

export default function ScrollImageSequence() {
  const { language } = useLanguage();
  const t = translations[language].motivation;

  const copyStages = COPY_STAGES_CONFIG.map(config => ({
    ...config,
    cmd: t[config.translationKey].cmd,
    headline: t[config.translationKey].headline,
    description: t[config.translationKey].description,
  }));

  const [scrollScreens, setScrollScreens] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setScrollScreens(window.innerWidth < 768 ? 3 : 4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const frameIdx = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [frameDisplay, setFrameDisplay] = useState(1);

  // Active copy stage
  const activeCopy = [...copyStages].reverse().find(s => scrollPct >= s.threshold) ?? copyStages[0];

  // ─── Draw a frame (0-based index) ────────────────────────────────────────
  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images.current[Math.max(0, Math.min(idx, FRAME_COUNT - 1))];
    if (!img || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const cw = canvas.width;
    const ch = canvas.height;
    // Fix mobile detection: use window.innerWidth instead of cw, as cw is scaled by devicePixelRatio
    const isMobile = window.innerWidth < 768;
    const zoomMultiplier = isMobile ? 0.52 : 0.85;
    const ratio = Math.max(cw / iw, ch / ih) * zoomMultiplier;
    const dx = (cw - iw * ratio) / 2;
    const dy = (ch - ih * ratio) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, iw * ratio, ih * ratio);
  }, []);

  // ─── Sync canvas size to viewport ───────────────────────────────────────
  const syncSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    drawFrame(frameIdx.current);
  }, [drawFrame]);

  // ─── Phase 1: preload ────────────────────────────────────────────────────
  useEffect(() => {
    let done = 0;
    images.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      const tick = () => {
        done++;
        setProgress(Math.round((done / FRAME_COUNT) * 100));
        if (done === FRAME_COUNT) setLoaded(true);
      };
      img.onload = tick;
      img.onerror = tick;
      img.src = getImagePath(i);
      return img;
    });
  }, []);

  // ─── Phase 2: canvas + ScrollTrigger ────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    gsap.registerPlugin(ScrollTrigger);

    const rafId = requestAnimationFrame(() => {
      syncSize();
      drawFrame(0);
      window.addEventListener("resize", syncSize);

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate(self) {
          const f = Math.round(self.progress * (FRAME_COUNT - 1));
          frameIdx.current = f;
          drawFrame(f);
          setScrollPct(self.progress);
          setFrameDisplay(f + 1);
        },
      });

      return () => st.kill();
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", syncSize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loaded, drawFrame, syncSize, scrollScreens]);

  const pct = Math.round(scrollPct * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;600&display=swap');

        .seq-hud { font-family: 'Share Tech Mono', monospace; }
        .seq-body { font-family: 'Barlow', sans-serif; }

        /* Scanlines overlay */
        .scanlines::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.07) 2px,
            rgba(0,0,0,0.07) 4px
          );
          z-index: 10;
        }

        /* Progress bar track */
        .prog-track {
          background: rgba(255,255,255,0.08);
          height: 2px;
          border-radius: 1px;
          overflow: hidden;
        }
        .prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.4) 100%);
          transition: width 0.1s linear;
          border-radius: 1px;
        }

        /* Copy fade transition */
        .copy-fade {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
      `}</style>

      {/* ── Outer scroll container ─────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ height: `${scrollScreens * 100}vh`, background: "#050505" }}
      >
        {/* ── Sticky viewport ─────────────────────────────────────────── */}
        <div
          ref={stickyRef}
          className="scanlines"
          style={{
            position: "sticky",
            top: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {/* Loading overlay */}
          {!loaded && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#000", color: "#fff", gap: "16px",
            }}>
              {/* Custom loading bar */}
              <div style={{ width: "200px" }}>
                <div className="seq-hud" style={{
                  color: "rgba(255,255,255,0.4)", fontSize: "9px",
                  letterSpacing: "0.25em", marginBottom: "8px", textAlign: "center",
                }}>
                  LOADING FRAMES — {progress}%
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <canvas ref={canvasRef} style={{ display: "block" }} />

          {/* Overlays */}
          {loaded && (
            <>
              {/* Top metadata bar */}
              <div style={{
                position: "absolute", top: 32, left: 32, right: 32, zIndex: 15,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div className="seq-hud" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.2em" }}>
                  SEQUENCE_01 // MOTIVATION
                </div>
                <div className="seq-hud" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.15em" }}>
                  FRAME {String(frameDisplay).padStart(3, "0")} / {FRAME_COUNT}
                </div>
              </div>

              {/* Scroll-driven copy — CLI cards */}
              <div
                key={activeCopy.headline}
                className={`copy-fade absolute z-[15] w-auto md:w-[380px] scale-90 md:scale-100 transition-all duration-700 ease-out animate-in fade-in ${activeCopy.animationClass} ${activeCopy.position}`}
              >
                <div className="p-3 md:p-4 border border-white/10 bg-black/80 backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 md:mb-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="text-[8px] md:text-[9px] text-white/30 tracking-widest uppercase truncate max-w-[150px] md:max-w-none">
                      BASH ~ sebastian
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div className="flex flex-col gap-2 md:gap-2.5">
                    <div className="text-white/40 text-xs md:text-sm tracking-wider">
                      <span className="text-white/20 pr-2">❯</span>
                      {activeCopy.cmd}
                    </div>
                    <div className={`text-base md:text-lg font-bold ${activeCopy.textColor} tracking-tight`}>
                      {activeCopy.headline}
                    </div>
                    <div className="text-white/70 text-[11px] md:text-xs leading-relaxed border-l border-white/10 pl-3 py-1 mt-0.5">
                      {activeCopy.description}

                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll progress indicator — bottom right */}
              <div className="absolute top-24 right-4 md:top-auto md:bottom-20 md:right-8 z-[15] hidden md:flex flex-col items-end gap-1.5">
                <div className="seq-hud text-white/20 text-[10px] tracking-[0.2em]">
                  PROGRESS
                </div>
                <div className="seq-hud text-white/70 text-3xl">
                  {String(pct).padStart(3, "0")}<span className="text-sm opacity-40">%</span>
                </div>
              </div>
            </>
          )}

          {/* Bottom progress bar */}
          {loaded && (
            <div className="absolute bottom-6 left-4 right-4 md:bottom-8 md:left-8 md:right-8 z-[15] flex items-center gap-3">
              <div className="seq-hud text-white/20 text-[9px] tracking-[0.2em] whitespace-nowrap hidden md:block">
                SCROLL TO CONTINUE
              </div>
              <div className="seq-hud text-white/20 text-[9px] tracking-[0.2em] whitespace-nowrap md:hidden">
                SCROLL
              </div>
              <div className="prog-track flex-1">
                <div className="prog-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="seq-hud text-white/20 text-[9px] tracking-[0.2em] whitespace-nowrap">
                {pct}%
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
