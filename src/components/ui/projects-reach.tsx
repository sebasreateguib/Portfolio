'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { REACH_ASPECT, REACH_FOLDER, REACH_GRID, REACH_SPLIT } from '../../data/reach-hands'

/**
 * The opening of the projects section: two dot-drawn hands reach in from the
 * edges toward a folder (a desktop-style folder icon, drawn here in SVG), and
 * clicking the folder opens the projects the way a terminal would: under it
 * `cd ~/projects` and `ls` type themselves out while the hands lean in, and
 * as `ls` is entered `onOpen` runs to take the page to the projects.
 * The hands slide in and swing up about shoulders off screen once the block
 * scrolls into view; cells flicker as they first light. A pointer near the
 * folder draws both hands a little closer. Under them the arms are reflected,
 * dim and thinning out, on a floor line just under the lowest fingers.
 * On narrow screens only the right hand reaches, toward a folder on the left.
 * `controlRef.current.nudge()` makes both hands lunge at the folder once and
 * shows `hint` under it for a moment (for when the page won't scroll on).
 */

const COLS = REACH_GRID[0].length
const ROWS = REACH_GRID.length
const ENTRY_MS = 2400
const RIGHT_DELAY_MS = 250
const LEFT_DELAY_MS = 550
const FOLDER_DELAY_MS = 2300
const FOLDER_IN_MS = 800
const FLICKER_MS = 240
// The terminal: typing speed per character, the pause between commands and
// before the page goes on, and how long it stays after that (then it clears).
const TYPE_MS = 38
const TYPE_LS_MS = 70
const PAUSE_MS = 220
const BEFORE_OPEN_MS = 260
const CLEAR_AFTER_MS = 2600
const PROMPT_HOME = 'guest@sreategui:~$ '
const PROMPT_PROJECTS = 'guest@sreategui:~/projects$ '
// The folder icon's width: this many cells, within these bounds (CSS px).
const FOLDER_CELLS = 11
const FOLDER_MIN_PX = 56
const FOLDER_MAX_PX = 150
const NUDGE_MS = 900
const HINT_MS = 2400
const SLIDE_CELLS = 70
const SWING_RAD = 0.16
const REACH_CELLS = 1.6
// Columns that must fit across: both hands on wide screens, or the folder and
// the right hand (its arm may run off the edge) on narrow ones.
const WIDE_COLS = COLS - 8
const NARROW_LEAD = 10
const NARROW_COLS = 72
// Below this canvas width only the right hand is drawn.
const NARROW_BELOW_PX = 700
// How much of the height the hands may take; the rest is for the reflection.
const HANDS_SHARE = 0.62
const REFLECT_MIN_ROWS = 6
// The floor sits just under the lowest fingers (the right hand's).
const FLOOR = ROWS + 0.4
const SUB = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]] as const

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
const easeOutBack = (t: number) => {
    t = clamp(t, 0, 1)
    return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)
}

// One hand's cell at (c, r): 1 lit, 0.42 shadow, 0 empty. Past its outer
// edge the arm carries on, so the outermost column repeats.
function sample(side: -1 | 1, c: number, r: number) {
    const ri = Math.floor(r)
    if (ri < 0 || ri >= ROWS) return 0
    let ci = Math.floor(c)
    if (side < 0) {
        if (ci < 0) ci = 0
        if (ci >= REACH_SPLIT) return 0
    } else {
        if (ci >= COLS) ci = COLS - 1
        if (ci < REACH_SPLIT) return 0
    }
    const ch = REACH_GRID[ri][ci]
    return ch === '#' ? 1 : ch === '.' ? 0.42 : 0
}

// A fixed 0..1 value per cell, so the reflection thins out the same way every frame.
function hash(k: number, j: number) {
    let h = Math.imul(k, 73856093) ^ Math.imul(j, 19349663)
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

type Pose = { dx: number; cos: number; sin: number; px: number; py: number }

// A hand's pose at entry progress t: it slides in from its side and swings up
// about a shoulder off screen; `reach` pulls it toward the folder.
function pose(t: number, side: -1 | 1, reach: number): Pose {
    const ang = lerp(side * -SWING_RAD, 0, easeOut(t))
    return {
        dx: lerp(side * SLIDE_CELLS, 0, easeOutBack(t)) - side * reach * REACH_CELLS,
        cos: Math.cos(-ang),
        sin: Math.sin(-ang),
        px: side < 0 ? -25 : COLS + 25,
        py: 2,
    }
}

// How lit hand `side` is around grid point (x, y), undoing its pose (in square units).
function lit(side: -1 | 1, p: Pose, x: number, y: number) {
    let v = 0
    for (const [ax, ay] of SUB) {
        const qx = x + ax - p.dx - p.px
        const qy = (y + ay - p.py) * REACH_ASPECT
        v += sample(side, qx * p.cos - qy * p.sin + p.px, (qx * p.sin + qy * p.cos) / REACH_ASPECT + p.py)
    }
    return v / 4
}

export type ProjectsReachControl = { nudge: () => void }

export function ProjectsReach({ label, openLabel, hint, touchHint, onOpen, controlRef, className }: {
    /** The folder's name, under it. */
    label: string
    /** Accessible name of the folder button. */
    openLabel: string
    /** Shown under the folder after a nudge; `touchHint` on touch screens. */
    hint: string
    touchHint: string
    onOpen: () => void
    controlRef?: MutableRefObject<ProjectsReachControl | null>
    className?: string
}) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const hintRef = useRef<HTMLSpanElement>(null)
    const folderRef = useRef<SVGSVGElement>(null)
    const termRef = useRef<HTMLDivElement>(null)

    const onOpenRef = useRef(onOpen)
    const openRef = useRef<() => void>(() => {})

    useEffect(() => { onOpenRef.current = onOpen }, [onOpen])

    useEffect(() => {
        const wrap = wrapRef.current
        const canvas = canvasRef.current
        const button = buttonRef.current
        const ctx = canvas?.getContext('2d')
        if (!wrap || !canvas || !button || !ctx) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        let W = 0, H = 0, cw = 0, ch = 0
        let narrow = false
        let gx0 = 0, gy0 = 0              // grid coordinates at the canvas's top-left
        let k0 = 0, k1 = 0, j0 = 0, j1 = 0
        let births = new Float32Array(0)
        let wasOn = new Uint8Array(0)
        let start: number | null = null
        let nudgedAt: number | null = null
        let opening = false
        let leaning = false
        let run = 0
        let clearTimer = 0
        let hintTimer = 0
        let reach = 0
        let pointer = { x: -1e9, y: -1e9 }
        let visible = false
        let raf = 0

        const kick = () => { if (!raf) raf = requestAnimationFrame(draw) }

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            W = canvas.clientWidth
            H = canvas.clientHeight
            canvas.width = Math.round(W * dpr)
            canvas.height = Math.round(H * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            narrow = W < NARROW_BELOW_PX
            cw = Math.min(W / (narrow ? NARROW_COLS : WIDE_COLS), (H * HANDS_SHARE) / (ROWS * REACH_ASPECT))
            ch = cw * REACH_ASPECT
            // wide: the folder in the middle; narrow: the folder near the left edge
            gx0 = narrow ? REACH_FOLDER.c - NARROW_LEAD : REACH_FOLDER.c - W / 2 / cw
            // the hands and the reflection under them, together, centred
            const reflectRows = Math.max(REFLECT_MIN_ROWS, 10)
            gy0 = -Math.max(0, (H - (FLOOR + reflectRows) * ch) / 2) / ch
            k0 = Math.floor(gx0) - 1
            k1 = Math.ceil(gx0 + W / cw) + 1
            j0 = Math.floor(gy0) - 1
            j1 = Math.ceil(gy0 + H / ch) + 1
            births = new Float32Array((k1 - k0) * (j1 - j0)).fill(-1e9)
            wasOn = new Uint8Array((k1 - k0) * (j1 - j0))

            // the folder's button: the icon centred in the gap, its name below it
            const fx = (REACH_FOLDER.c - gx0) * cw
            const fy = (REACH_FOLDER.r - gy0) * ch
            const fw = clamp(cw * FOLDER_CELLS, FOLDER_MIN_PX, FOLDER_MAX_PX)
            const bw = Math.max(fw * 1.6, 110)
            button.style.left = `${fx - bw / 2}px`
            button.style.top = `${fy - fw * 0.4}px`
            button.style.width = `${bw}px`
            button.style.fontSize = `${clamp(cw * 1.7, 12, 16)}px`
            if (folderRef.current) folderRef.current.style.width = `${fw}px`
            // keep the hint on screen when the folder sits near the left edge
            const hintEl = hintRef.current
            if (hintEl) {
                hintEl.textContent = window.matchMedia('(hover: none)').matches ? touchHint : hint
                const shift = Math.max(0, hintEl.offsetWidth / 2 - fx + 12)
                hintEl.style.transform = `translateX(${shift}px)`
            }
            // the terminal sits under the folder's name, centred, on wide screens; on narrow ones the
            // right hand's fingers are level with that, so it drops under the floor line, at the left
            const term = termRef.current
            if (term) {
                const below = button.offsetTop + button.offsetHeight + 6
                const underFloor = (FLOOR - gy0) * ch + 6
                term.style.top = `${narrow ? Math.max(below, underFloor) : below}px`
                term.style.left = narrow ? '8px' : `${fx}px`
                term.style.transform = narrow ? 'none' : 'translateX(-50%)'
            }
            kick()
        }

        const draw = (now: number): void => {
            raf = 0
            const time = start === null ? 0 : now - start
            const tR = reduced ? 1 : start === null ? 0 : clamp((time - RIGHT_DELAY_MS) / ENTRY_MS, 0, 1)
            const tL = reduced ? 1 : start === null ? 0 : clamp((time - LEFT_DELAY_MS) / ENTRY_MS, 0, 1)
            const entered = tR >= 1 && (narrow || tL >= 1)
            const folderIn = reduced ? 1 : start === null ? 0 : easeOut((time - FOLDER_DELAY_MS) / FOLDER_IN_MS)

            const rect = canvas.getBoundingClientRect()
            const fx = rect.left + (REACH_FOLDER.c - gx0) * cw
            const fy = rect.top + (REACH_FOLDER.r - gy0) * ch
            const near = clamp(1 - (Math.hypot(pointer.x - fx, pointer.y - fy) / cw - 6) / 20, 0, 1)
            const target = entered && !reduced ? (leaning ? 1 : near) : 0
            reach += (target - reach) * 0.08
            if (Math.abs(target - reach) < 0.002) reach = target
            // a nudge: one lunge at the folder and back
            const nudging = !reduced && nudgedAt !== null && now - nudgedAt < NUDGE_MS
            const lunge = nudging ? Math.sin((Math.PI * (now - nudgedAt!)) / NUDGE_MS) * 1.6 : 0
            const pull = Math.max(reach, lunge)

            const pr = pose(tR, 1, pull)
            const pl = pose(tL, -1, pull)
            const reflectRows = Math.max(REFLECT_MIN_ROWS, gy0 + H / ch - FLOOR - 0.5)
            const floorIn = easeOut(((narrow ? tR : Math.min(tR, tL)) - 0.35) / 0.65)

            ctx.clearRect(0, 0, W, H)
            let flickering = false
            const span = k1 - k0
            if (start !== null) {
                for (let j = j0; j < j1; j++) {
                    const y = j + 0.5
                    const sy = (y - gy0) * ch
                    const below = y - FLOOR
                    for (let k = k0; k < k1; k++) {
                        const x = k + 0.5
                        const sx = (x - gx0) * cw
                        const i = (j - j0) * span + (k - k0)

                        let v = lit(1, pr, x, y)
                        if (v < 0.2 && !narrow) v = lit(-1, pl, x, y)
                        let mirrored = false
                        if (v < 0.2 && below > 0 && below < reflectRows && floorIn > 0) {
                            const my = 2 * FLOOR - y
                            v = lit(1, pr, x, my)
                            if (v < 0.2 && !narrow) v = lit(-1, pl, x, my)
                            mirrored = true
                        }
                        if (v < 0.2) { wasOn[i] = 0; continue }
                        ctx.fillStyle = '#f4f4f4'

                        if (mirrored) {
                            // dimmer and smaller, and thinning out with depth
                            const fade = 1 - below / reflectRows
                            if (hash(k, j) > 0.25 + fade * 0.7) continue
                            ctx.globalAlpha = (v > 0.7 ? 0.5 : 0.3) * fade * floorIn
                            ctx.beginPath()
                            ctx.arc(sx, sy, (v > 0.7 ? cw * 0.4 : cw * 0.22) / 2, 0, Math.PI * 2)
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
                        ctx.arc(sx, sy, size / 2, 0, Math.PI * 2)
                        ctx.fill()
                    }
                }

                // the floor line: a faint dashed rule across the hands' span
                if (floorIn > 0) {
                    const ly = Math.round((FLOOR - gy0) * ch) + 0.5
                    ctx.fillStyle = '#f4f4f4'
                    ctx.globalAlpha = 0.16 * floorIn
                    for (let x = 0; x < W; x += cw * 1.5) ctx.fillRect(x, ly, cw * 0.75, 1)
                }
            }
            ctx.globalAlpha = 1
            button.style.opacity = String(folderIn)
            button.style.pointerEvents = folderIn > 0.5 ? 'auto' : 'none'

            const moving = (start !== null && (!entered || folderIn < 1)) || reach !== target || flickering || nudging
            if (moving) kick()
        }

        openRef.current = () => {
            const term = termRef.current
            if (opening) return
            if (reduced || !term) { onOpenRef.current(); return }
            opening = true
            const id = ++run
            const wait = (ms: number) => new Promise<boolean>((resolve) => window.setTimeout(() => resolve(id === run), ms))
            const [line1, line2] = Array.from(term.children) as HTMLElement[]
            const cmd1 = line1.lastElementChild as HTMLElement
            const cmd2 = line2.lastElementChild as HTMLElement
            const cursor = document.createElement('span')
            cursor.className = 'ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[2px] animate-pulse bg-blue-400'
            const type = async (into: HTMLElement, text: string, ms: number) => {
                into.textContent = ''
                into.after(cursor)
                for (const ch of text) {
                    into.textContent += ch
                    if (!(await wait(ms))) return false
                }
                return true
            }

            window.clearTimeout(clearTimer)
            window.clearTimeout(hintTimer)
            if (hintRef.current) hintRef.current.style.opacity = '0'
            cmd1.textContent = ''
            cmd2.textContent = ''
            line2.style.display = 'none'
            term.style.opacity = '1'
            folderRef.current?.animate(
                [{ transform: 'scale(1)' }, { transform: 'scale(0.93)' }, { transform: 'scale(1)' }],
                { duration: 180, easing: 'ease-out' },
            )
            // the hands lean in while it works
            leaning = true
            kick()

            ;(async () => {
                if (!(await type(cmd1, 'cd ~/projects', TYPE_MS)) || !(await wait(PAUSE_MS))) return
                line2.style.display = ''
                if (!(await type(cmd2, 'ls', TYPE_LS_MS)) || !(await wait(BEFORE_OPEN_MS))) return
                cursor.remove()
                onOpenRef.current()
                leaning = false
                kick()
                // clear the terminal once the page has gone on, for when it's scrolled back up
                clearTimer = window.setTimeout(() => {
                    term.style.opacity = '0'
                    opening = false
                }, CLEAR_AFTER_MS)
            })()
        }

        if (controlRef) {
            controlRef.current = {
                nudge: () => {
                    nudgedAt = performance.now()
                    kick()
                    if (!reduced) {
                        folderRef.current?.animate(
                            [{ transform: 'translateY(0)' }, { transform: 'translateY(-10%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-4%)' }, { transform: 'translateY(0)' }],
                            { duration: 620, easing: 'ease-out' },
                        )
                    }
                    const el = hintRef.current
                    if (!el) return
                    el.style.opacity = '1'
                    window.clearTimeout(hintTimer)
                    hintTimer = window.setTimeout(() => { el.style.opacity = '0' }, HINT_MS)
                },
            }
        }

        const onPointer = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' || !visible) return
            pointer = { x: e.clientX, y: e.clientY }
            kick()
        }

        // the hands come in the first time the block is well in view
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (entry.intersectionRatio >= 0.4 && start === null) {
                start = performance.now()
                kick()
            }
        }, { threshold: [0, 0.4] })

        const ro = new ResizeObserver(resize)
        ro.observe(canvas)
        io.observe(wrap)
        resize()
        window.addEventListener('pointermove', onPointer, { passive: true })
        return () => {
            ro.disconnect()
            io.disconnect()
            window.removeEventListener('pointermove', onPointer)
            cancelAnimationFrame(raf)
            window.clearTimeout(hintTimer)
            run++
            window.clearTimeout(clearTimer)
            if (controlRef) controlRef.current = null
        }
    }, [controlRef, hint, touchHint])

    return (
        <div ref={wrapRef} className={`relative ${className ?? ''}`}>
            <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
            <button
                ref={buttonRef}
                type="button"
                onClick={() => openRef.current()}
                aria-label={openLabel}
                style={{ opacity: 0 }}
                className="group absolute flex cursor-pointer flex-col items-center bg-transparent font-sans font-semibold tracking-tight text-white/90 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
            >
                <svg
                    ref={folderRef}
                    viewBox="0 0 120 96"
                    aria-hidden="true"
                    className="h-auto drop-shadow-[0_6px_18px_rgba(56,152,236,0.35)] transition-[transform,filter] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:brightness-110"
                >
                    <defs>
                        <linearGradient id="reach-folder-back" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#4aa6ef" />
                            <stop offset="1" stopColor="#2f86d8" />
                        </linearGradient>
                        <linearGradient id="reach-folder-front" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#7cc8fb" />
                            <stop offset="1" stopColor="#4ba9f1" />
                        </linearGradient>
                    </defs>
                    {/* back sheet with its tab */}
                    <path
                        d="M6 16a7 7 0 0 1 7-7h29c2.6 0 4.6.9 6.4 2.7L54.8 18H107a7 7 0 0 1 7 7v54a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7Z"
                        fill="url(#reach-folder-back)"
                    />
                    {/* front sheet, with a lit top edge */}
                    <rect x="6" y="27" width="108" height="61" rx="7" fill="url(#reach-folder-front)" />
                    <path d="M13 27.6h94" stroke="#c4e6ff" strokeOpacity="0.9" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="mt-[0.45em]">{label}</span>
                <span
                    ref={hintRef}
                    aria-hidden="true"
                    style={{ opacity: 0 }}
                    className="mt-2 whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.2em] text-blue-300/80 transition-opacity duration-300"
                >
                    {hint}
                </span>
            </button>
            {/* the terminal that opens the folder: cd, then ls */}
            <div
                ref={termRef}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="pointer-events-none absolute w-max max-w-[min(560px,calc(100vw-16px))] rounded-sm bg-black/85 px-2 py-1 font-mono text-[11px] leading-relaxed text-white transition-opacity duration-300 md:text-[13px]"
            >
                <div><span className="text-blue-400">{PROMPT_HOME}</span><span /></div>
                <div style={{ display: 'none' }}><span className="text-blue-400">{PROMPT_PROJECTS}</span><span /></div>
            </div>
        </div>
    )
}
