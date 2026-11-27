'use client'

import { useEffect, useRef } from 'react'
import { REACH_HAND, REACH_HAND_ASPECT } from '../../data/reach-hand'

/**
 * A dot-drawn arm that reaches in from the right edge and points at the
 * element `aimAt` selects (turning about the shoulder until the index lines up).
 * On reveal it slides in and swings up about a shoulder off to the right;
 * cells flicker as they first light. Once in, a pointer near the fingertip
 * draws the hand a little further along its aim. Drawn on a canvas that fills
 * `className`; the grid is right-aligned and vertically centred in it at `fit`
 * of its height (the rest is room to turn), and the arm carries on past the
 * right edge. Below it the arm is reflected, dim and thinning out, on a floor
 * line just under the fingers, fading out by the canvas's bottom edge.
 */

const GRID_W = REACH_HAND[0].length
const GRID_H = REACH_HAND.length
const ENTRY_MS = 2400
const ENTRY_DELAY_MS = 250
const FLICKER_MS = 240
const SLIDE_CELLS = 70
const SWING_RAD = 0.16
const REACH_CELLS = 1.6
// Columns that must fit across the canvas: the hand and a little forearm.
// The rest of the arm may run off the right edge, so a narrow canvas still
// gets a full-size hand.
const FIT_COLS = 58
// On wide screens the hand keeps the size it had when the whole grid had to fit
// in this share of the viewport; only narrower screens let it grow, up to
// cells of CAP_FLOOR_PX.
const CAP_VIEWPORT_SHARE = 0.52
const CAP_FLOOR_PX = 8
// The shoulder the arm swings in about, in grid cells (off to the right, near the top).
const PIVOT_C = GRID_W + 25
const PIVOT_R = 0
// The arm aims by turning whole about the same shoulder, but only a little
// (turned further, the dot raster loses the hand's shape); the rest of the aim
// comes from raising or lowering the arm.
const AIM_C = PIVOT_C
const AIM_R = PIVOT_R
const AIM_MAX = 0.1
// The middle of the hanging fingers, in grid columns: the floor is set under it.
const FINGERS_C = 22
// The reflection always runs at least this many rows, even on a short canvas.
const REFLECT_MIN_ROWS = 6
// Four sub-samples per cell, so the moving arm stays smooth.
const SUB = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]] as const

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
const easeOutBack = (t: number) => {
    t = clamp(t, 0, 1)
    return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)
}

function sample(c: number, r: number) {
    const ri = Math.floor(r)
    if (ri < 0 || ri >= GRID_H) return 0
    const ci = Math.min(Math.floor(c), GRID_W - 1)
    if (ci < 0) return 0
    const ch = REACH_HAND[ri][ci]
    return ch === '#' ? 1 : ch === '.' ? 0.42 : 0
}

// The fingertip: the leftmost drawn cell.
const TIP = (() => {
    let best = { c: GRID_W, r: 0 }
    REACH_HAND.forEach((line, r) => {
        const c = line.search(/\S/)
        if (c >= 0 && c < best.c) best = { c, r }
    })
    return best
})()

// A fixed 0..1 value per cell, so the reflection thins out the same way every frame.
function hash(k: number, j: number) {
    let h = Math.imul(k, 73856093) ^ Math.imul(j, 19349663)
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// Rotate grid point (c, r) by `ang` about (pc, pr), measured in square units.
function turn(c: number, r: number, pc: number, pr: number, cos: number, sin: number) {
    const x = c - pc
    const y = (r - pr) * REACH_HAND_ASPECT
    return [x * cos - y * sin + pc, (x * sin + y * cos) / REACH_HAND_ASPECT + pr] as const
}

export function ReachHand({ revealed, aimAt, fit = 1, className }: {
    revealed: boolean
    /** Selector (searched in the document) of what the finger points at. */
    aimAt?: string
    /** Share of the canvas height the hand takes at rest. */
    fit?: number
    className?: string
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const revealedRef = useRef(revealed)
    const kickRef = useRef<() => void>(() => {})

    useEffect(() => {
        revealedRef.current = revealed
        kickRef.current()
    }, [revealed])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        let W = 0, H = 0, cw = 0, ch = 0, ox = 0, oy = 0
        let k0 = 0, k1 = 0, j0 = 0, j1 = 0
        let births = new Float32Array(0)
        let wasOn = new Uint8Array(0)
        let start: number | null = null
        let reach = 0
        let pointer = { x: -1e9, y: -1e9 }
        let raf = 0

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            W = canvas.clientWidth
            H = canvas.clientHeight
            canvas.width = Math.round(W * dpr)
            canvas.height = Math.round(H * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            const byHeight = (H * fit) / (GRID_H * REACH_HAND_ASPECT)
            const wideSize = Math.min((window.innerWidth * CAP_VIEWPORT_SHARE) / GRID_W, byHeight)
            cw = Math.min(W / FIT_COLS, byHeight, Math.max(wideSize, CAP_FLOOR_PX))
            ch = cw * REACH_HAND_ASPECT
            // right-aligned, unless that would push the fingertip off the left
            ox = Math.max(0, W - GRID_W * cw)
            oy = (H - GRID_H * ch) / 2
            // every cell centre that lands on the canvas, in grid cells
            k0 = Math.floor(-ox / cw) - 1
            k1 = Math.ceil((W - ox) / cw)
            j0 = Math.floor(-oy / ch) - 1
            j1 = Math.ceil((H - oy) / ch)
            births = new Float32Array((k1 - k0) * (j1 - j0)).fill(-1e9)
            wasOn = new Uint8Array((k1 - k0) * (j1 - j0))
            kick()
        }

        // How to point the index finger (straight left at rest) at the target:
        // a small turn about the shoulder, then a shift in rows that puts the
        // target on the finger's line.
        const aimPose = (): [number, number] => {
            const el = aimAt ? document.querySelector<HTMLElement>(aimAt) : null
            if (!el) return [0, 0]
            const rect = canvas.getBoundingClientRect()
            const box = el.getBoundingClientRect()
            const tc = (box.left + box.width / 2 - rect.left - ox) / cw
            const tr = (box.top + box.height / 2 - rect.top - oy) / ch
            const [c0, r0] = turn(TIP.c, TIP.r + 0.5, AIM_C, AIM_R, 1, 0)
            const ang = clamp(Math.atan2(-(tr - r0) * REACH_HAND_ASPECT, -(tc - c0)), -AIM_MAX, AIM_MAX)
            const [c, r] = turn(TIP.c, TIP.r + 0.5, AIM_C, AIM_R, Math.cos(ang), Math.sin(ang))
            const want = tr + ((c - tc) * Math.tan(ang)) / REACH_HAND_ASPECT
            return [ang, want - r]
        }

        const draw = (now: number) => {
            raf = 0
            if (start === null && revealedRef.current) start = now
            const t = reduced ? 1 : start === null ? 0 : clamp((now - start - ENTRY_DELAY_MS) / ENTRY_MS, 0, 1)
            const entered = t >= 1

            const [aimAng, aimRows] = aimPose()
            const aim = aimAng * easeOut(t)
            const lift = aimRows * easeOut(t)
            const aimCos = Math.cos(aim), aimSin = Math.sin(aim)
            const rect = canvas.getBoundingClientRect()
            const [tipC, tipR0] = turn(TIP.c + 0.5, TIP.r + 0.5, AIM_C, AIM_R, aimCos, aimSin)
            const tipR = tipR0 + lift
            const tipX = rect.left + ox + tipC * cw
            const tipY = rect.top + oy + tipR * ch
            const near = clamp(1 - (Math.hypot(pointer.x - tipX, pointer.y - tipY) / cw - 4) / 22, 0, 1)
            const target = entered && !reduced ? near : 0
            reach += (target - reach) * 0.08
            if (Math.abs(target - reach) < 0.002) reach = target

            // slide in from the right, then lean along the aim on hover
            const dx = lerp(SLIDE_CELLS, 0, easeOutBack(t)) - reach * REACH_CELLS * aimCos
            const dy = lift - (reach * REACH_CELLS * aimSin) / REACH_HAND_ASPECT
            const ang = lerp(-SWING_RAD, 0, easeOut(t))
            const cos = Math.cos(-ang), sin = Math.sin(-ang)
            const unAimCos = Math.cos(-aim), unAimSin = Math.sin(-aim)

            // How lit the posed arm is at grid point (x, y), averaging four sub-samples.
            const posed = (x: number, y: number, flip: number) => {
                let v = 0
                for (const [ax, ay] of SUB) {
                    const py = flip ? 2 * flip - (y + ay) : y + ay
                    // undo the pose: the slide, the swing about the shoulder, then the aim
                    const [sc, sr] = turn(x + ax - dx, py - dy, PIVOT_C, PIVOT_R, cos, sin)
                    const [lc, lr] = turn(sc, sr, AIM_C, AIM_R, unAimCos, unAimSin)
                    v += sample(lc, lr)
                }
                return v / 4
            }
            // The floor sits just under the resting fingers (the bottom of the
            // grid under the hand, turned and lifted); it doesn't follow the hover.
            const floor = turn(FINGERS_C, GRID_H, AIM_C, AIM_R, aimCos, aimSin)[1] + lift + 0.4
            const floorIn = easeOut((t - 0.35) / 0.65)
            // the reflection fades out by the bottom of the canvas
            const reflectRows = Math.max(REFLECT_MIN_ROWS, (H - oy) / ch - floor - 0.5)

            ctx.clearRect(0, 0, W, H)
            ctx.fillStyle = '#f4f4f4'
            let flickering = false
            const span = k1 - k0
            if (start !== null || reduced) {
                for (let j = j0; j < j1; j++) {
                    const below = j + 0.5 - floor
                    for (let k = k0; k < k1; k++) {
                        let v = posed(k + 0.5, j + 0.5, 0)
                        let mirrored = false
                        if (v < 0.2 && below > 0 && below < reflectRows && floorIn > 0) {
                            v = posed(k + 0.5, j + 0.5, floor)
                            mirrored = true
                        }
                        const i = (j - j0) * span + (k - k0)
                        if (v < 0.2) { wasOn[i] = 0; continue }

                        if (mirrored) {
                            // dimmer and smaller, and thinning out with depth
                            const fade = 1 - below / reflectRows
                            if (hash(k, j) > 0.25 + fade * 0.7) continue
                            ctx.globalAlpha = (v > 0.7 ? 0.5 : 0.3) * fade * floorIn
                            ctx.beginPath()
                            ctx.arc(ox + (k + 0.5) * cw, oy + (j + 0.5) * ch, (v > 0.7 ? cw * 0.4 : cw * 0.22) / 2, 0, Math.PI * 2)
                            ctx.fill()
                            continue
                        }
                        if (!wasOn[i]) { births[i] = now; wasOn[i] = 1 }

                        let size = v > 0.7 ? cw * 0.62 : cw * 0.26
                        let alpha = v > 0.7 ? 0.96 : 0.7
                        if (!reduced && now - births[i] < FLICKER_MS) {
                            flickering = true
                            const n = Math.random()
                            size = n < 0.5 ? cw * 0.26 : cw * 0.62
                            alpha = 0.5 + n * 0.5
                        }
                        ctx.globalAlpha = alpha
                        ctx.beginPath()
                        ctx.arc(ox + (k + 0.5) * cw, oy + (j + 0.5) * ch, size / 2, 0, Math.PI * 2)
                        ctx.fill()
                    }
                }

                // the floor line: a faint dashed rule from under the fingertip to the edge
                if (floorIn > 0) {
                    const y = Math.round(oy + floor * ch) + 0.5
                    const x0 = ox + (tipC - 2) * cw
                    ctx.globalAlpha = 0.16 * floorIn
                    for (let x = Math.max(0, x0); x < W; x += cw * 1.5) {
                        ctx.fillRect(x, y, cw * 0.75, 1)
                    }
                }
            }
            ctx.globalAlpha = 1

            const moving = (start !== null && !entered) || reach !== target || flickering
            if (moving || (start === null && revealedRef.current)) kick()
        }

        function kick() {
            if (!raf) raf = requestAnimationFrame(draw)
        }
        kickRef.current = kick

        const onPointer = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            pointer = { x: e.clientX, y: e.clientY }
            kick()
        }
        const onLeave = () => { pointer = { x: -1e9, y: -1e9 }; kick() }

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)
        resize()
        window.addEventListener('pointermove', onPointer, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)
        return () => {
            observer.disconnect()
            window.removeEventListener('pointermove', onPointer)
            document.documentElement.removeEventListener('pointerleave', onLeave)
            cancelAnimationFrame(raf)
            kickRef.current = () => {}
        }
    }, [aimAt, fit])

    return (
        <div aria-hidden="true" className={className}>
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        </div>
    )
}
