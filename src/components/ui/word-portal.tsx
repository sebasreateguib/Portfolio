"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

const FONT = '"Arial Black", "Arial", sans-serif';

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
    const t = clamp((n - a) / (b - a));
    return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

type Ink = { x: number; y: number; radius: number };

/**
 * The largest disk that fits inside a letter's ink, in 100px text units.
 * Adapted from Glyph Portal (© 2026 Christian Katzmann, MIT): scan the glyph
 * at 3× for the largest opaque square, which works for bars, bowls and rings.
 */
function interior(char: string): Ink | null {
    const scan = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!scan) return null;
    const font = `900 300px ${FONT}`;
    scan.font = font;
    const m = scan.measureText(char);
    const pad = 8;
    const left = Math.ceil(m.actualBoundingBoxLeft);
    const ascent = Math.ceil(m.actualBoundingBoxAscent);
    scan.canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
    scan.canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
    scan.font = font;
    scan.fontKerning = "none";
    scan.fillText(char, pad + left, pad + ascent);
    const { width, height } = scan.canvas;
    const pixels = scan.getImageData(0, 0, width, height).data;
    const rows = new Uint16Array(width + 1);
    let size = 0, bx = 0, by = 0;
    for (let y = 0; y < height; y++) {
        let diagonal = 0;
        for (let x = 0; x < width; x++) {
            const above = rows[x + 1];
            rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245
                ? Math.min(above, rows[x], diagonal) + 1 : 0;
            diagonal = above;
            if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
        }
    }
    if (size < 3) return null;
    return {
        x: (bx + 1 - size / 2 - pad - left) / 3,
        y: (by + 1 - size / 2 - pad - ascent) / 3,
        radius: (size / 2 - 1) / 3,
    };
}

export type WordPortalProps = {
    /** The word cut out of the sheet. Short words read largest on phones. */
    word: string;
    /** The section that shows through the letters and that the camera lands on. */
    children: React.ReactNode;
    /** Sheet colour. */
    paper?: string;
    /** Caption colour on the sheet. */
    ink?: string;
    hint?: string;
    enterLabel?: string;
    /** Scroll travel through the word, in viewport heights. */
    scrollLength?: number;
};

/**
 * A sheet with a word cut out of it, laid over a section so the section shows
 * through the letters. The sheet arrives with the section; once it reaches the
 * top, scrolling holds the section still and flies the camera into the
 * thickest stroke of the word until it fills the screen, then the sheet is
 * gone and the page scrolls on from the section.
 */
export function WordPortal({
    word,
    children,
    paper = "#f2f0eb",
    ink = "#0a0a0a",
    hint = "Scroll to enter.",
    enterLabel = "Enter",
    scrollLength = 1.6,
}: WordPortalProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(true);
    const text = word.trim() || "HELLO";

    useLayoutEffect(() => {
        const context = canvasRef.current?.getContext("2d");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !context) {
            setEnabled(false);
            return;
        }

        const track = trackRef.current!;
        const spacer = spacerRef.current!;
        const overlay = overlayRef.current!;
        const canvas = canvasRef.current!;
        const caption = captionRef.current!;

        let W = 1, H = 1, dpr = 1, raf = 0, lastProgress = -1;
        let startScale = 1, endScale = 1;
        let center = { x: 0, y: 0 }, focus = { x: 0, y: 0 };

        // All geometry in the text's own units: a 100px line, baseline at 0.
        const measure = () => {
            context.font = `900 100px ${FONT}`;
            context.fontKerning = "none";
            const m = context.measureText(text);
            const left = -m.actualBoundingBoxLeft;
            const top = -m.actualBoundingBoxAscent;
            const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
            const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
            center = { x: left + width / 2, y: top + height / 2 };

            // Enter through the letter with the most room inside its ink.
            let best: Ink | null = null;
            for (let i = 0; i < text.length; i++) {
                const found = interior(text[i]);
                if (!found) continue;
                context.font = `900 100px ${FONT}`;
                const candidate = { ...found, x: found.x + context.measureText(text.slice(0, i)).width };
                if (!best || candidate.radius > best.radius ||
                    (candidate.radius === best.radius && Math.abs(candidate.x - center.x) < Math.abs(best.x - center.x))) {
                    best = candidate;
                }
            }
            focus = best ?? center;

            startScale = Math.min((W * 0.84) / width, (H * 0.38) / height);
            // The disk under the camera ends wider than the screen's diagonal.
            endScale = best ? Math.max(startScale, Math.hypot(W, H) / (best.radius * 1.35)) : startScale * 8;
        };

        const progress = () =>
            clamp(-track.getBoundingClientRect().top / Math.max(1, spacer.offsetHeight));

        const paint = (p: number) => {
            const eased = easeInOut(p);
            const scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
            // Glide from the word's centre to the stroke's at the rate the zoom
            // closes in, so the stroke stays put under the camera.
            const blend = endScale === startScale ? 0
                : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
            const cx = center.x + (focus.x - center.x) * blend;
            const cy = center.y + (focus.y - center.y) * blend;

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.globalCompositeOperation = "source-over";
            context.clearRect(0, 0, W, H);
            context.fillStyle = paper;
            context.fillRect(0, 0, W, H);
            context.globalCompositeOperation = "destination-out";
            context.translate(W / 2, H * (0.46 + 0.04 * eased));
            context.scale(scale, scale);
            context.translate(-cx, -cy);
            context.font = `900 100px ${FONT}`;
            context.fontKerning = "none";
            context.fillText(text, 0, 0);

            // A last fade covers any engine that will not paint text this large.
            overlay.style.opacity = String(1 - smooth(0.92, 1, p));
            overlay.style.visibility = p >= 1 ? "hidden" : "visible";
            overlay.style.background = "transparent";
            caption.style.opacity = String(1 - smooth(0.01, 0.12, p));
        };

        const frame = () => {
            raf = 0;
            const p = progress();
            if (p === lastProgress) return;
            lastProgress = p;
            paint(p);
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(frame);
        };
        const resize = () => {
            W = overlay.clientWidth || window.innerWidth;
            H = overlay.clientHeight || window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            measure();
            lastProgress = -1;
            frame();
        };

        resize();
        // A late font swap changes the metrics; remeasure once fonts settle.
        document.fonts?.ready.then(resize).catch(() => {});
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", resize);
        };
    }, [text, paper]);

    const enter = (event: React.MouseEvent) => {
        event.preventDefault();
        const track = trackRef.current;
        const spacer = spacerRef.current;
        if (!track || !spacer) return;
        const top = track.getBoundingClientRect().top + window.scrollY + spacer.offsetHeight;
        window.scrollTo({ top, behavior: "smooth" });
    };

    if (!enabled) return <>{children}</>;

    return (
        <div ref={trackRef} className="relative">
            {/* The section stays put while the camera travels the spacer below it */}
            <div className="sticky top-0 min-h-svh bg-black">
                {children}

                {/* One screen tall, pinned to the section's top. Solid until the
                    first paint, and it blocks clicks on the hidden section. */}
                <div
                    ref={overlayRef}
                    className="absolute inset-x-0 top-0 z-30 h-svh"
                    style={{ background: paper }}
                >
                    <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
                    <div
                        ref={captionRef}
                        className="absolute inset-x-[8%] bottom-[9%] flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest"
                        style={{ color: ink }}
                    >
                        <span aria-hidden>{hint}</span>
                        <a href="#" onClick={enter} className="inline-flex min-h-11 items-center gap-4">
                            {enterLabel}
                            <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 2l8 8M10 3.5V10H3.5" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div ref={spacerRef} aria-hidden style={{ height: `${scrollLength * 100}svh` }} />
        </div>
    );
}
