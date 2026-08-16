"use client";

import { useEffect, useRef } from "react";

const ARROW_PATH = "M 0 0 L 0 20 L 4.5 15.5 L 8 22 L 10 21 L 6.5 14.5 L 12 14.5 Z";

export default function CustomCursor() {
  // Outer wrapper: ONLY JS sets transform here for mouse tracking
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const loop = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;
      }
      rafId.current = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMove);
    rafId.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }

        /* Outer wrapper: only JS touches transform (mouse position) */
        .gc-wrapper {
          position: fixed;
          top: 0; left: 0;
          width: 0; height: 0;
          pointer-events: none;
          z-index: 99999;
          will-change: transform;
        }

        /* Inner div: only CSS animation touches transform (glitch shake) */
        .gc-inner {
          position: absolute;
          top: 0; left: 0;
          width: 24px; height: 24px;
        }

        .gc-inner svg {
          position: absolute;
          top: 0; left: 0;
        }

        .gc-inner svg.cur-red  { mix-blend-mode: screen; opacity: 0; }
        .gc-inner svg.cur-blue { mix-blend-mode: screen; opacity: 0; }

        /* ── Keyframes — affect .gc-inner only ──────────────────── */
        @keyframes gc-shake {
          0%,79%,100% { transform: translate(0,0) skewX(0deg); }
          80%  { transform: translate(-2px, 0px) skewX(-5deg); }
          82%  { transform: translate(3px, -1px) skewX(5deg); }
          84%  { transform: translate(-1px, 1px) skewX(-3deg); }
          86%  { transform: translate(2px, 0px) skewX(3deg); }
          88%  { transform: translate(0, 0) skewX(0deg); }
        }

        @keyframes gc-red {
          0%,79%,100% { transform: translate(0,0); opacity: 0; }
          80%  { transform: translate(-4px, 1px); opacity: 0.8; }
          82%  { transform: translate(-6px, 0px); opacity: 0.9; }
          84%  { transform: translate(-3px,-1px); opacity: 0.7; }
          86%  { transform: translate(-5px, 2px); opacity: 0.85; }
          88%  { transform: translate(0,0); opacity: 0; }
        }

        @keyframes gc-blue {
          0%,79%,100% { transform: translate(0,0); opacity: 0; }
          80%  { transform: translate(4px,-1px); opacity: 0.8; }
          82%  { transform: translate(6px, 0px); opacity: 0.9; }
          84%  { transform: translate(3px, 1px); opacity: 0.7; }
          86%  { transform: translate(5px,-2px); opacity: 0.85; }
          88%  { transform: translate(0,0); opacity: 0; }
        }

        .gc-inner             { animation: gc-shake 3.5s infinite; }
        .gc-inner svg.cur-red  { animation: gc-red  3.5s infinite; }
        .gc-inner svg.cur-blue { animation: gc-blue 3.5s infinite; }
      `}</style>

      {/* Outer: JS moves this with mouse position */}
      <div ref={wrapperRef} className="gc-wrapper" aria-hidden="true">
        {/* Inner: CSS glitch animates only this */}
        <div className="gc-inner">
          <svg className="cur-blue" width="24" height="24" viewBox="0 0 13 23" fill="none">
            <path d={ARROW_PATH} fill="#00aaff" />
          </svg>
          <svg className="cur-red" width="24" height="24" viewBox="0 0 13 23" fill="none">
            <path d={ARROW_PATH} fill="#ff2244" />
          </svg>
          <svg className="cur-base" width="24" height="24" viewBox="0 0 13 23" fill="none">
            <path d={ARROW_PATH} fill="white" stroke="black" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </>
  );
}
