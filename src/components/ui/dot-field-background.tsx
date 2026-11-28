'use client';

import { useEffect, useRef } from 'react';

// A grid of tiny dots whose brightness comes from a slowly drifting 3D value-noise
// field: dots light up in soft clusters that breathe and wander, like the UIMIX hero.
// Canvas 2D, no dependencies. Pauses off-screen; a single static frame under
// prefers-reduced-motion.

interface DotFieldBackgroundProps {
    /** Distance between dots, in CSS px. */
    spacing?: number;
    /** Dot side, in CSS px. */
    dotSize?: number;
    /** Brightest a dot gets (0–1). */
    maxAlpha?: number;
    /** Faint alpha every dot keeps, so the grid is always barely there. */
    baseAlpha?: number;
    /** Size of the clusters: smaller = bigger blobs. */
    scale?: number;
    /** How fast the field drifts. 0 = static. */
    speed?: number;
    className?: string;
}

// Integer hash -> [0, 1)
function hash3(x: number, y: number, z: number) {
    let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function valueNoise3(x: number, y: number, z: number) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
    const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi);
    const c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
    const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1);
    const c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
    return lerp(
        lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
        lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
        w,
    );
}

const BUCKETS = 10;

export function DotFieldBackground({
    spacing = 13,
    dotSize = 2,
    maxAlpha = 0.55,
    baseAlpha = 0.025,
    scale = 0.09,
    speed = 0.06,
    className = '',
}: DotFieldBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let cols = 0, rows = 0, dpr = 1;
        let jitter = new Float32Array(0);
        let raf: number | null = null;
        let last = 0;
        let time = 0;
        const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            cols = Math.ceil(rect.width / spacing) + 1;
            rows = Math.ceil(rect.height / spacing) + 1;
            // Per-dot speckle so clusters look grainy instead of like smooth blobs.
            jitter = new Float32Array(cols * rows);
            for (let i = 0; i < jitter.length; i++) jitter[i] = hash3(i, 17, 91);
            draw();
        };

        const draw = () => {
            for (const b of buckets) b.length = 0;
            const z = time * speed;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Two octaves; the second drifts the other way for a less mechanical flow.
                    const n =
                        valueNoise3(c * scale, r * scale, z) * 0.7 +
                        valueNoise3(c * scale * 2.3 + 40, r * scale * 2.3, -z * 1.4) * 0.3;
                    let a = Math.min(1, Math.max(0, (n - 0.47) / 0.25));
                    a *= 0.3 + 0.7 * jitter[r * cols + c];
                    const alpha = baseAlpha + a * (maxAlpha - baseAlpha);
                    const bi = Math.min(BUCKETS - 1, Math.floor((alpha / maxAlpha) * BUCKETS));
                    buckets[bi].push(c, r);
                }
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            const offset = (spacing - dotSize) / 2;
            for (let i = 0; i < BUCKETS; i++) {
                const cells = buckets[i];
                if (!cells.length) continue;
                ctx.globalAlpha = ((i + 0.5) / BUCKETS) * maxAlpha;
                ctx.beginPath();
                for (let k = 0; k < cells.length; k += 2) {
                    ctx.rect(cells[k] * spacing + offset, cells[k + 1] * spacing + offset, dotSize, dotSize);
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        // ~30fps is plenty for something this slow.
        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (now - last < 33) return;
            time += last ? (now - last) / 1000 : 0;
            last = now;
            draw();
        };

        const start = () => {
            if (raf !== null || reduced || speed === 0) return;
            last = 0;
            raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            if (raf !== null) cancelAnimationFrame(raf);
            raf = null;
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
        io.observe(canvas);

        return () => {
            stop();
            ro.disconnect();
            io.disconnect();
        };
    }, [spacing, dotSize, maxAlpha, baseAlpha, scale, speed]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
        />
    );
}
