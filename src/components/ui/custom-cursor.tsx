"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Lerp factor — lower = more lag/smoothness
  const LERP = 0.15;

  const animate = useCallback(() => {
    // Interpolate ring position toward mouse
    ringPos.current.x += (mouse.current.x - ringPos.current.x) * LERP;
    ringPos.current.y += (mouse.current.y - ringPos.current.y) * LERP;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
    }

    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) scale(${
        isClicking ? 0.7 : isHovering ? 1.6 : 1
      })`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, [isHovering, isClicking]);

  useEffect(() => {
    // Only show custom cursor on devices with a fine pointer (no touch)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnterInteractive = () => setIsHovering(true);
    const handleMouseLeaveInteractive = () => setIsHovering(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    // Target only interactive elements
    const interactiveSelectors =
      "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

    const addListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnterInteractive);
        el.addEventListener("mouseleave", handleMouseLeaveInteractive);
      });
    };

    // Initial listener attachment
    addListeners();

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      addListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [animate, isVisible]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  return (
    <>
      {/* Global style to hide the default cursor */}
      <style jsx global>{`
        @media (pointer: fine) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Dot — precise center point */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="custom-cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? "10px" : "14px",
          height: isHovering ? "10px" : "14px",
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: "width 0.3s ease, height 0.3s ease, opacity 0.15s ease",
        }}
      />

      {/* Ring — follows with smooth delay */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="custom-cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: isHovering
            ? "1.5px solid rgba(0, 220, 255, 0.6)"
            : "1.5px solid rgba(255, 255, 255, 0.7)",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: isVisible ? 1 : 0,
          transition:
            "border-color 0.3s ease, opacity 0.15s ease, box-shadow 0.3s ease",
          boxShadow: isHovering
            ? "0 0 20px rgba(0, 220, 255, 0.25), 0 0 60px rgba(0, 220, 255, 0.08), inset 0 0 12px rgba(0, 220, 255, 0.06)"
            : "0 0 8px rgba(255, 255, 255, 0.04)",
        }}
      />
    </>
  );
}
