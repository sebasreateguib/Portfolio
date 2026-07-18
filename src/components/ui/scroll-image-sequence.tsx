'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const FRAME_COUNT = 240;
const SCROLL_SCREENS = 3;

const getImagePath = (i: number) =>
  `/kb/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

// Copy that evolves with scroll progress
const COPY_STAGES = [
  { threshold: 0, headline: "SEBASTIAN REATEGUI", sub: "Software Engineer" },
  { threshold: 0.3, headline: "FULL STACK DEVELOPER", sub: "Building modern web applications" },
  { threshold: 0.6, headline: "CLOUD NATIVE", sub: "AWS & Serverless Architecture" },
  { threshold: 0.9, headline: "PROBLEM SOLVER", sub: "Turning ideas into reality" },
];

export default function ScrollImageSequence() {
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
  const activeCopy = [...COPY_STAGES].reverse().find(s => scrollPct >= s.threshold) ?? COPY_STAGES[0];

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
    const ratio = Math.max(cw / iw, ch / ih);
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
  }, [loaded, drawFrame, syncSize]);

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
        style={{ height: `${SCROLL_SCREENS * 100}vh`, background: "#050505" }}
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
                  SEQUENCE_01 / PORTFOLIO INTRO
                </div>
                <div className="seq-hud" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.15em" }}>
                  FRAME {String(frameDisplay).padStart(3, "0")} / {FRAME_COUNT}
                </div>
              </div>

              {/* Scroll-driven copy — bottom left */}
              <div
                className="copy-fade"
                style={{
                  position: "absolute", bottom: 80, left: 32, zIndex: 15,
                }}
              >
                <div className="seq-hud" style={{
                  color: "rgba(255,255,255,0.22)", fontSize: "10px",
                  letterSpacing: "0.25em", marginBottom: "4px",
                }}>
                  {activeCopy.sub.toUpperCase()}
                </div>
                <div className="seq-body" style={{
                  color: "rgba(255,255,255,0.85)", fontSize: "28px",
                  fontWeight: 300, letterSpacing: "0.05em",
                }}>
                  {activeCopy.headline}
                </div>
              </div>

              {/* Scroll progress indicator — bottom right */}
              <div style={{
                position: "absolute", bottom: 80, right: 32, zIndex: 15,
                display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px",
              }}>
                <div className="seq-hud" style={{
                  color: "rgba(255,255,255,0.22)", fontSize: "10px", letterSpacing: "0.2em",
                }}>
                  PROGRESS
                </div>
                <div className="seq-hud" style={{
                  color: "rgba(255,255,255,0.7)", fontSize: "32px",
                }}>
                  {String(pct).padStart(3, "0")}<span style={{ fontSize: "14px", opacity: 0.4 }}>%</span>
                </div>
              </div>
            </>
          )}

          {/* Bottom progress bar */}
          {loaded && (
            <div style={{
              position: "absolute", bottom: 32, left: 32, right: 32, zIndex: 15,
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <div className="seq-hud" style={{
                color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.2em", whiteSpace: "nowrap",
              }}>
                SCROLL TO CONTINUE
              </div>
              <div className="prog-track" style={{ flex: 1 }}>
                <div className="prog-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="seq-hud" style={{
                color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.2em", whiteSpace: "nowrap",
              }}>
                {pct}%
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
