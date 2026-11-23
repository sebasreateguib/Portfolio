'use client'

import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { createThermalAvatar, glyphFromAscii, SEAM_MIN_CSS, type ThermalLayout, type ThermalRect } from './thermal-avatar'

/** Logical size of the pixel art: 96x96, one cell per pixel. */
const ART_SIZE = 96
/** Empty rows above the hair in the artwork. */
const EMPTY_TOP_ROWS = 3
/**
 * How far the avatar's section has to scroll up — as a fraction of its height —
 * for the scroll mosaic to reach its last step (see PIXELATE_AT).
 */
const PIXELATE_DISTANCE = 0.6

/*
 * Backdrop lattice: the art's own grid of cells, faintly lit, across the
 * section, so the field reads as the lit part of one larger pixel display. As
 * the face breaks into mosaics the lattice coarsens with it.
 */
const GRID_CELL_ALPHA = 0.04
/** Mosaic block (art px) per pixelate level, and the scroll progress where each level starts. */
const MOSAIC_BLOCKS = [1, 2, 4, 6, 12]
const PIXELATE_AT = [0.15, 0.35, 0.55, 0.75]
/** The entrance as [ms after reveal, level]: 12px, 6px, 4px, 2px blocks, then sharp. */
const INTRO_STEPS: [number, number][] = [[0, 4], [233, 3], [367, 2], [483, 1], [583, 0]]

/** Panel mode: columns of field kept left of the art, over which its left edge frays. */
const FIELD_LEFT_CELLS = 16
/** Ragged mode: cells of field added above and beside the art for the edges to fray into, and how many rows the top frays over (short of the hair). */
const RAGGED_PAD_TOP = 6
const RAGGED_PAD_SIDE = 10
const RAGGED_TOP_ROWS = 8
/** Ragged mode: the field reaches left behind the copy to this far (CSS px) from the section's left edge. */
const RAGGED_LEFT_GAP = 0
/** Ragged mode: columns the left edge frays over, short enough to leave solid field left of the copy. */
const RAGGED_LEFT_COLS = 8

const levelFor = (pixelate: number) => PIXELATE_AT.filter((at) => pixelate >= at).length

interface PixelAvatarProps {
    className?: string
    /**
     * While this media query matches, the visible art (hair to shoulders, without
     * the empty rows above the hair) is sized to the box's height instead of the
     * whole artboard fitting inside it: the top of the hair sits on the box's top
     * edge and the shoulders end within half a pixel step of its bottom edge.
     */
    fitArtQuery?: string
    /** Draw the cell lattice behind the avatar, across its section (see GRID_CELL_ALPHA). */
    backdropGrid?: boolean
    /**
     * The entrance (blocks sharpening into the face) waits for this. Pass false
     * while the avatar is still hidden behind a loader, then flip it to true.
     */
    revealed?: boolean
    /**
     * While this media query matches, the field is a panel rather than the art's
     * square: it runs from just left of the face to the section's right edge, and
     * from under the element marked `data-thermal-field-top` (else the section's
     * top) down to the shoulders. Its left edge frays; top and right stay straight.
     */
    fieldQuery?: string
    /**
     * While this media query matches (and `fieldQuery` doesn't), the field runs
     * from RAGGED_LEFT_GAP off the section's left edge (behind the copy) to
     * RAGGED_PAD_SIDE cells right of the art, RAGGED_PAD_TOP cells above it,
     * fraying at the top, sides and bottom instead of ending in straight edges.
     * Elements marked `data-thermal-dim` drop the field a tone behind them.
     */
    raggedQuery?: string
    /**
     * Ragged mode only: ASCII art (its '█' blocks) drawn in blue cells in the field,
     * stretched to fill the element marked `data-thermal-glyph` in the section (a
     * fixed-size box, so the result doesn't depend on fonts), shadow included.
     */
    glyph?: string
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * The hero's pixel-art portrait, drawn by the thermal renderer (thermal-avatar.ts)
 * from src/data/avatar-grid.ts: grey cells with drifting clouds, a blink, breath
 * and the occasional row-slice glitch.
 *
 * Every art pixel is a whole number of device pixels, so cells stay square and
 * sharp. On reveal the face resolves out of 12px blocks; as the section scrolls
 * away it steps back into blocks, and the backdrop lattice coarsens with it.
 */
export function PixelAvatar({
    className,
    fitArtQuery,
    backdropGrid = false,
    revealed = true,
    fieldQuery,
    raggedQuery,
    glyph,
}: PixelAvatarProps) {
    const boxRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    // Holds the art's place in the layout, while the canvas (which may reach well
    // past it) is positioned around it.
    const slotRef = useRef<HTMLDivElement>(null)
    const revealedRef = useRef(revealed)
    // Pushes `revealed` into the renderer; set by the main effect.
    const syncRevealed = useRef<(() => void) | null>(null)

    useEffect(() => {
        revealedRef.current = revealed
        syncRevealed.current?.()
    }, [revealed])

    useEffect(() => {
        const box = boxRef.current
        const canvas = canvasRef.current
        const slot = slotRef.current
        if (!box || !canvas || !slot) return

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const section = box.closest<HTMLElement>('section, main') ?? box

        // offsetTop ignores transforms: entrance animations (the loader slides
        // the page in) move on-screen rects without any scrolling, and would
        // leave the face stuck in blocks.
        const pageTop = (el: HTMLElement) => {
            let top = 0
            for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
                top += node.offsetTop
            }
            return top
        }
        const pageLeft = (el: HTMLElement) => {
            let left = 0
            for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
                left += node.offsetLeft
            }
            return left
        }

        const engine = createThermalAvatar(canvas, { motion: !reducedMotion })

        // ---- backdrop lattice, on the same device-pixel grid as the art
        const grid = gridRef.current
        let pixelDevice = 1 // device pixels per art pixel, set by fitCanvas
        let gridLevel = 0
        const drawGrid = () => {
            if (!grid) return
            const dpr = window.devicePixelRatio || 1
            const block = MOSAIC_BLOCKS[gridLevel]
            const cell = (pixelDevice * block) / dpr
            // the art's seams (when its cells are big enough): one device pixel at the right and bottom of each cell
            const seam = pixelDevice / dpr >= SEAM_MIN_CSS ? 1 / dpr : 0
            const size = canvas.offsetWidth
            // the layer reaches well past the box; the hero clips it
            const reach = Math.max(window.innerWidth, window.innerHeight) * 1.5
            const originX = reach + canvas.offsetLeft
            const originY = reach + canvas.offsetTop
            const tile =
                `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}'>` +
                `<rect width='${cell - seam}' height='${cell - seam}' fill='white' fill-opacity='${GRID_CELL_ALPHA}'/></svg>`
            grid.style.inset = `${-reach}px`
            grid.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(tile)}")`
            grid.style.backgroundSize = `${cell}px ${cell}px`
            grid.style.backgroundPosition = `${originX}px ${originY}px`
            // Fade out away from the face, reaching the whole section: across the
            // viewport, up to the section's top and down to its bottom.
            const centerX = originX + size / 2
            const centerY = originY + size * 0.42
            const sectionTop = reach + pageTop(section) - pageTop(box)
            const sectionBottom = sectionTop + section.offsetHeight
            const radiusX = Math.max(size * 1.15, window.innerWidth * 0.95)
            const radiusY = Math.max(size * 0.95, (centerY - sectionTop) * 1.25, (sectionBottom - centerY) * 1.05)
            const mask = `radial-gradient(${radiusX}px ${radiusY}px at ${centerX}px ${centerY}px, #000 60%, transparent 100%)`
            grid.style.maskImage = mask
            grid.style.webkitMaskImage = mask
        }
        const setGridLevel = (level: number) => {
            if (level === gridLevel) return
            gridLevel = level
            drawGrid()
            engine.setBlock(MOSAIC_BLOCKS[level])
        }

        // ---- crisp sizing: every art pixel is a whole number of device pixels
        const fitArt = fitArtQuery ? window.matchMedia(fitArtQuery) : null
        const fitCanvas = () => {
            const dpr = window.devicePixelRatio || 1
            let pixel: number // device pixels per art pixel
            if (fitArt?.matches) {
                // the visible art (below the empty rows) matches the box's
                // height, to the nearest whole step, without outgrowing its width
                pixel = Math.min(
                    Math.round((box.clientHeight * dpr) / (ART_SIZE - EMPTY_TOP_ROWS)),
                    Math.floor((box.clientWidth * dpr) / ART_SIZE),
                )
            } else {
                // the whole artboard fits inside the box
                pixel = Math.floor((Math.min(box.clientWidth, box.clientHeight) * dpr) / ART_SIZE)
            }
            pixel = Math.max(1, pixel)
            const cssSize = (pixel * ART_SIZE) / dpr
            slot.style.width = `${cssSize}px`
            slot.style.height = `${cssSize}px`
            slot.style.marginTop = fitArt?.matches ? `${(-pixel * EMPTY_TOP_ROWS) / dpr}px` : ''
            pixelDevice = pixel
            fitThermal(pixel / dpr, pixel, cssSize)
            // after the layout: the lattice lines up with where the canvas now sits
            drawGrid()
        }

        // Lays the renderer's grid out around the art's slot: the art square alone,
        // the panel (fieldQuery) or the ragged field (raggedQuery).
        const wideField = fieldQuery ? window.matchMedia(fieldQuery) : null
        const ragged = raggedQuery ? window.matchMedia(raggedQuery) : null
        const glyphEl = glyph ? section.querySelector<HTMLElement>('[data-thermal-glyph]') : null
        const dimEls = Array.from(section.querySelectorAll<HTMLElement>('[data-thermal-dim]'))
        // Ragged mode: page position of the grid's top-left cell and the cell size, for placeDim.
        let gridOrigin: { x: number; y: number; cell: number } | null = null
        /** Drops the field a tone behind the elements marked `data-thermal-dim` (copy that sits on it). */
        const placeDim = () => {
            if (!gridOrigin) return engine.setDim([])
            const { x: originX, y: originY, cell } = gridOrigin
            const rects: ThermalRect[] = []
            for (const el of dimEls) {
                if (el.offsetWidth === 0 || el.offsetHeight === 0) continue
                const x = pageLeft(el) - originX
                const y = pageTop(el) - originY
                rects.push([
                    Math.floor(x / cell),
                    Math.floor(y / cell),
                    Math.ceil((x + el.offsetWidth) / cell),
                    Math.ceil((y + el.offsetHeight) / cell),
                ])
            }
            engine.setDim(rects)
        }
        /** Ragged mode: sets the glyph into the grid over its element, given the page position of the grid's top-left cell. */
        const placeGlyph = (originX: number, originY: number, cell: number) => {
            if (!glyph || !glyphEl) return engine.setGlyph(null)
            // The art's rows with blocks in them fill the box, shadow included: it falls
            // half a character right and a bit over half a line down, like the art's outline.
            const lines = glyph.split('\n').filter((line) => line.includes('█')).map((line) => line.trimEnd())
            const artCols = Math.max(...lines.map((line) => line.length))
            const sx = glyphEl.offsetWidth / cell / (artCols + 0.5)
            const sy = glyphEl.offsetHeight / cell / (lines.length + 0.6)
            const shape = glyphFromAscii(lines.join('\n'), sx, sy, Math.max(1, Math.round(sx * 0.5)), Math.max(1, Math.round(sy * 0.6)))
            engine.setGlyph({
                ...shape,
                x: Math.round((pageLeft(glyphEl) - originX) / cell),
                y: Math.round((pageTop(glyphEl) - originY) / cell),
            })
        }
        const fieldTop = section.querySelector<HTMLElement>('[data-thermal-field-top]')
        const fitThermal = (cell: number, pixel: number, cssSize: number) => {
            let layout: ThermalLayout = { cols: ART_SIZE, rows: ART_SIZE, ox: 0, oy: 0 }
            if (wideField?.matches) {
                const boxLeft = pageLeft(box)
                const boxTop = pageTop(box)
                const right = pageLeft(section) + section.offsetWidth - boxLeft
                // The face sits in the hero's parallax layer and the header doesn't: take
                // out how far that layer is shifted from the section right now, so the
                // field starts flush under the header. (The section, not the header: the
                // header has its own entrance slide; the loader's transform cancels out.)
                const shift =
                    box.getBoundingClientRect().top - boxTop - (section.getBoundingClientRect().top - pageTop(section))
                const top =
                    (fieldTop ? pageTop(fieldTop) + fieldTop.offsetHeight : pageTop(section)) - boxTop - shift
                const ox = FIELD_LEFT_CELLS
                const oy = Math.max(0, Math.floor((slot.offsetTop - top) / cell))
                const extra = Math.max(0, Math.ceil((right - slot.offsetLeft - cssSize) / cell))
                // The panel's left edge frays away like its bottom drips; the edges against
                // the page's frame (top, under the header, and right) stay straight.
                layout = {
                    cols: ox + ART_SIZE + extra,
                    rows: oy + ART_SIZE,
                    ox,
                    oy,
                    frayLeft: true,
                    raggedLeftCols: FIELD_LEFT_CELLS,
                }
            } else if (ragged?.matches) {
                const left = pageLeft(section) - pageLeft(box) + RAGGED_LEFT_GAP
                const ox = Math.max(RAGGED_PAD_SIDE, Math.floor((slot.offsetLeft - left) / cell))
                layout = {
                    cols: ox + ART_SIZE + RAGGED_PAD_SIDE,
                    rows: ART_SIZE + RAGGED_PAD_TOP,
                    ox,
                    oy: RAGGED_PAD_TOP,
                    ragged: true,
                    raggedRows: RAGGED_TOP_ROWS,
                    raggedLeftCols: RAGGED_LEFT_COLS,
                }
            }
            canvas.style.left = `${slot.offsetLeft - layout.ox * cell}px`
            canvas.style.top = `${slot.offsetTop - layout.oy * cell}px`
            canvas.style.width = `${layout.cols * cell}px`
            canvas.style.height = `${layout.rows * cell}px`
            engine.resize(pixel, layout)

            if (ragged?.matches && !wideField?.matches) {
                gridOrigin = {
                    x: pageLeft(box) + slot.offsetLeft - layout.ox * cell,
                    y: pageTop(box) + slot.offsetTop - layout.oy * cell,
                    cell,
                }
                placeGlyph(gridOrigin.x, gridOrigin.y, cell)
            } else {
                gridOrigin = null
                engine.setGlyph(null)
            }
            placeDim()
        }
        fitCanvas()
        // The copy's lines grow as they're typed out: keep the dimmed area in step.
        const dimObserver = new ResizeObserver(placeDim)
        dimEls.forEach((el) => dimObserver.observe(el))
        const resizeObserver = new ResizeObserver(fitCanvas)
        resizeObserver.observe(box)
        // the field and the lattice reach the section's edges, which move as it resizes
        resizeObserver.observe(section)
        fitArt?.addEventListener('change', fitCanvas)
        wideField?.addEventListener('change', fitCanvas)
        ragged?.addEventListener('change', fitCanvas)

        // ---- scroll: the face breaks back down into blocks as it scrolls away
        let seen = false
        let introTimers: number[] = []
        let introRunning = false
        let introPlayed = false
        let frame = 0

        const applyScroll = () => {
            frame = 0
            syncRevealed.current?.()
            const height = section.offsetHeight
            if (height === 0) return
            const value = clamp01((window.scrollY - pageTop(section)) / (height * PIXELATE_DISTANCE))
            if (!introRunning) setGridLevel(levelFor(value))
        }

        // The lattice appears with the face and steps through the entrance with it.
        const showFace = () => {
            if (grid) grid.style.opacity = '1'
            if (introPlayed || reducedMotion) return
            introPlayed = true
            introRunning = true
            // The face starts in its biggest blocks, before its first frame shows.
            setGridLevel(INTRO_STEPS[0][1])
            introTimers = INTRO_STEPS.map(([ms, level]) =>
                window.setTimeout(() => {
                    setGridLevel(level)
                    if (level === 0) {
                        introRunning = false
                        applyScroll()
                    }
                }, ms),
            )
        }

        // Once revealed it stays revealed.
        syncRevealed.current = () => {
            if (!seen && revealedRef.current) seen = true
            // The hero has settled by the time it's revealed; lay the field out against it.
            if (seen && !introPlayed) fitCanvas()
            if (seen) showFace()
            engine.setRevealed(seen)
        }

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(applyScroll)
        }
        if (!reducedMotion) {
            window.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', onScroll, { passive: true })
        }

        // ---- only animate while the hero is on screen
        const visibility = new IntersectionObserver(([entry]) => engine.setPlaying(entry.isIntersecting))
        visibility.observe(box)

        syncRevealed.current()
        applyScroll()
        engine.setPlaying(true)

        return () => {
            cancelAnimationFrame(frame)
            introTimers.forEach((timer) => window.clearTimeout(timer))
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            syncRevealed.current = null
            visibility.disconnect()
            resizeObserver.disconnect()
            dimObserver.disconnect()
            fitArt?.removeEventListener('change', fitCanvas)
            wideField?.removeEventListener('change', fitCanvas)
            ragged?.removeEventListener('change', fitCanvas)
            engine.destroy()
        }
    }, [fitArtQuery, backdropGrid, fieldQuery, raggedQuery, glyph])

    return (
        <div ref={boxRef} className={cn('relative flex items-center justify-center', className)}>
            {backdropGrid && (
                <div
                    ref={gridRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute bg-repeat opacity-0 transition-opacity duration-500"
                />
            )}
            <div ref={slotRef} aria-hidden="true" className="block shrink-0" />
            <canvas
                ref={canvasRef}
                width={ART_SIZE}
                height={ART_SIZE}
                aria-hidden="true"
                className="absolute left-0 top-0 block max-w-none select-none [image-rendering:pixelated]"
            />
        </div>
    )
}
