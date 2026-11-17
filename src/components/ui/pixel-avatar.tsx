'use client'

import { useEffect, useRef } from 'react'
import {
    Alignment,
    EventType,
    Fit,
    Layout,
    Rive,
    type ViewModelInstanceBoolean,
    type ViewModelInstanceNumber,
} from '@rive-app/canvas'
import { cn } from '../../lib/utils'

/** Logical size of the pixel art: the artboard is 96x96, one unit per pixel. */
const ART_SIZE = 96
/** Empty rows above the hair in the artwork. */
const EMPTY_TOP_ROWS = 3
/**
 * How far the avatar's section has to scroll up — as a fraction of its height —
 * for `pixelate` to reach 1. The file steps through its mosaics at 0.15, 0.35,
 * 0.55 and 0.75 of that.
 */
const PIXELATE_DISTANCE = 0.6
/**
 * In-flow mode: `pixelate` starts once the avatar's top edge rises past this
 * fraction of the viewport height, and reaches 1 one avatar-height later.
 */
const IN_FLOW_PIXELATE_START = 0.2
/** In-flow mode: how much of the avatar must have scrolled into view for the entrance. */
const IN_FLOW_REVEAL_RATIO = 0.7

/*
 * Backdrop grid: a faint dot lattice on the avatar's own pixel grid, so the art
 * sits on its canvas. While the face is sharp there is a dot every GRID_STEP art
 * pixels; as the face breaks into mosaics the lattice coarsens with it.
 */
const GRID_STEP = 4
const GRID_DOT_ALPHA = 0.2
/** Mosaic block (art px) per pixelate level, and where each level starts.
 *  Mirrors MOSAIC_BLOCKS / PIXELATE_AT in src/design/avatar-rive/tools/generate_scene.py. */
const MOSAIC_BLOCKS = [1, 2, 4, 6, 12]
const PIXELATE_AT = [0.15, 0.35, 0.55, 0.75]
/** The file's "Intro" timeline as [ms after reveal, level]: 12px, 6px, 4px, 2px,
 *  sharp at frames 0, 14, 22, 29 and 35 (60 fps). */
const INTRO_STEPS: [number, number][] = [[0, 4], [233, 3], [367, 2], [483, 1], [583, 0]]

const levelFor = (pixelate: number) => PIXELATE_AT.filter((at) => pixelate >= at).length

interface PixelAvatarProps {
    src?: string
    className?: string
    /**
     * While this media query matches, the visible art (hair to shoulders, without
     * the empty rows above the hair) is sized to the box's height instead of the
     * whole artboard fitting inside it: the top of the hair sits on the box's top
     * edge and the shoulders end within half a pixel step of its bottom edge.
     */
    fitArtQuery?: string
    /**
     * While this media query matches, the avatar is a block in the page flow
     * rather than a backdrop: the entrance waits until it scrolls into view, and
     * it breaks into blocks as it leaves the top of the viewport, measured from
     * its own position rather than its section's.
     */
    inFlowQuery?: string
    /** Draw the dot lattice behind the avatar (see GRID_STEP). */
    backdropGrid?: boolean
    /**
     * While this media query matches, the lattice is a backdrop for the whole
     * section rather than a halo around the avatar: it spans the viewport's
     * width and reaches up to the section's top edge.
     */
    wideGridQuery?: string
    /** Classes for the art alone (the canvas), e.g. to dim it without dimming the lattice. */
    artClassName?: string
    /**
     * The entrance (blocks sharpening into the face) waits for this. Pass false
     * while the avatar is still hidden behind a loader, then flip it to true.
     */
    revealed?: boolean
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * Pixel-art avatar driven by the "Avatar" state machine in /avatar.riv
 * (source: src/design/avatar-rive).
 *
 * The file renders into a 96x96 drawing surface — exactly one canvas pixel per
 * art pixel — and CSS scales it up with nearest-neighbour sampling, sized to a
 * whole multiple of 96 device pixels so every art pixel stays square and sharp.
 *
 * View model "Avatar":
 *   revealed   true = play the entrance: 12px blocks resolving into the face
 *   pixelate   0..1, scroll progress; the face steps back into blocks as it rises
 *   motion     false = prefers-reduced-motion: no entrance, no glitches
 *   autoLook   always set false: the pupils and head hold still, centred
 *              (lookX / lookY stay in the file, unused)
 * Blinking, breathing and the occasional row-slice glitch run inside the file.
 */
export function PixelAvatar({
    src = '/avatar.riv',
    className,
    fitArtQuery,
    inFlowQuery,
    backdropGrid = false,
    wideGridQuery,
    artClassName,
    revealed = true,
}: PixelAvatarProps) {
    const boxRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const revealedRef = useRef(revealed)
    // Pushes `revealed` (and, in flow, whether the avatar has been seen) into the
    // file; set by the main effect once the file has loaded.
    const syncRevealed = useRef<(() => void) | null>(null)

    useEffect(() => {
        revealedRef.current = revealed
        syncRevealed.current?.()
    }, [revealed])

    useEffect(() => {
        const box = boxRef.current
        const canvas = canvasRef.current
        if (!box || !canvas) return

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const section = box.closest<HTMLElement>('section, main') ?? box
        const inFlow = inFlowQuery ? window.matchMedia(inFlowQuery) : null
        const wideGrid = wideGridQuery ? window.matchMedia(wideGridQuery) : null

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

        // ---- backdrop grid, drawn on the same device-pixel lattice as the art
        const grid = gridRef.current
        let pixelDevice = 1 // device pixels per art pixel, set by fitCanvas
        let gridLevel = 0
        const drawGrid = () => {
            if (!grid) return
            const dpr = window.devicePixelRatio || 1
            const cell = (pixelDevice * Math.max(GRID_STEP, MOSAIC_BLOCKS[gridLevel])) / dpr
            const dot = Math.max(1, Math.round(pixelDevice / 3)) / dpr
            const size = canvas.offsetWidth
            // the layer reaches well past the box; the hero clips it
            const reach = Math.max(window.innerWidth, window.innerHeight) * 1.5
            const originX = reach + canvas.offsetLeft
            const originY = reach + canvas.offsetTop
            const tile =
                `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}'>` +
                `<rect width='${dot}' height='${dot}' fill='white' fill-opacity='${GRID_DOT_ALPHA}'/></svg>`
            grid.style.inset = `${-reach}px`
            grid.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(tile)}")`
            grid.style.backgroundSize = `${cell}px ${cell}px`
            grid.style.backgroundPosition = `${originX}px ${originY}px`
            // Fade out away from the face. Beside the copy (desktop) the lattice
            // stays around the avatar; in flow (below the copy) it reaches up to
            // the top of the section so the copy sits on it too.
            const centerX = originX + size / 2
            const centerY = originY + size * 0.42
            let radiusX = size * 1.15
            let radiusY = size * 0.95
            let solid = 40 // % of the radius drawn at full strength
            if (inFlow?.matches || wideGrid?.matches) {
                const sectionTop = reach + pageTop(section) - pageTop(box)
                radiusX = Math.max(radiusX, window.innerWidth * 0.95)
                radiusY = Math.max(radiusY, (centerY - sectionTop) * 1.25)
                solid = 60
            }
            const mask =
                `radial-gradient(${radiusX}px ${radiusY}px at ${centerX}px ${centerY}px, ` +
                `#000 ${solid}%, transparent 100%)`
            grid.style.maskImage = mask
            grid.style.webkitMaskImage = mask
        }
        const setGridLevel = (level: number) => {
            if (level === gridLevel) return
            gridLevel = level
            drawGrid()
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
            canvas.style.width = `${cssSize}px`
            canvas.style.height = `${cssSize}px`
            canvas.style.marginTop = fitArt?.matches ? `${(-pixel * EMPTY_TOP_ROWS) / dpr}px` : ''
            pixelDevice = pixel
            drawGrid()
        }
        fitCanvas()
        const resizeObserver = new ResizeObserver(fitCanvas)
        resizeObserver.observe(box)
        // the in-flow mask reaches the section's top, which moves as it resizes
        if (backdropGrid) resizeObserver.observe(section)
        fitArt?.addEventListener('change', fitCanvas)
        wideGrid?.addEventListener('change', drawGrid)

        const rive = new Rive({
            src,
            canvas,
            stateMachine: 'Avatar',
            autoplay: true,
            autoBind: true,
            // The file has no pointer listeners; skip Rive's canvas listeners.
            shouldDisableRiveListeners: true,
            layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        })

        // The runtime resizes its drawing surface to CSS size x devicePixelRatio
        // whenever the canvas is (re)shown. Keep it at 96x96 instead: one drawing
        // pixel per art pixel, upscaled by CSS with `image-rendering: pixelated`.
        rive.resizeDrawingSurfaceToCanvas = () => {
            const width = canvas.clientWidth
            if (width === 0) return
            rive.devicePixelRatioUsed = ART_SIZE / width
            canvas.width = ART_SIZE
            canvas.height = ART_SIZE
            rive.resizeToCanvas()
            rive.drawFrame()
        }

        // ---- scroll: the face breaks back down into blocks as it scrolls away
        let pixelate: ViewModelInstanceNumber | null = null
        let revealedInput: ViewModelInstanceBoolean | null = null
        let seen = false
        let introTimers: number[] = []
        let introRunning = false
        let introPlayed = false
        let frame = 0

        // How much of the avatar is above the bottom of the viewport, by layout
        // position, so the loader's slide-in can't count as being on screen.
        const shownRatio = () => {
            const height = box.offsetHeight
            return height === 0 ? 0 : (window.scrollY + window.innerHeight - pageTop(box)) / height
        }

        const applyScroll = () => {
            frame = 0
            syncRevealed.current?.()
            if (!pixelate) return
            if (inFlow?.matches) {
                const height = box.offsetHeight
                if (height === 0) return
                const passed = window.scrollY + window.innerHeight * IN_FLOW_PIXELATE_START - pageTop(box)
                pixelate.value = clamp01(passed / height)
            } else {
                const height = section.offsetHeight
                if (height === 0) return
                pixelate.value = clamp01((window.scrollY - pageTop(section)) / (height * PIXELATE_DISTANCE))
            }
            if (!introRunning) setGridLevel(levelFor(pixelate.value))
        }

        // The grid appears with the face (in flow: as soon as the hero shows, since
        // it backs the copy too) and steps through the intro with it.
        const showGrid = (withIntro: boolean) => {
            if (!grid) return
            grid.style.opacity = '1'
            if (!withIntro || introPlayed || reducedMotion) return
            introPlayed = true
            introRunning = true
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

        // In flow, the entrance also waits for the avatar to be on screen. Once
        // it has started it stays started.
        syncRevealed.current = () => {
            if (!revealedInput) return
            if (!seen && revealedRef.current) {
                seen = !inFlow?.matches || shownRatio() >= IN_FLOW_REVEAL_RATIO
            }
            revealedInput.value = seen
            if (seen) showGrid(true)
            else if (revealedRef.current && inFlow?.matches) showGrid(false)
        }
        const onModeChange = () => {
            drawGrid()
            syncRevealed.current?.()
            applyScroll()
        }
        inFlow?.addEventListener('change', onModeChange)

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(applyScroll)
        }

        rive.on(EventType.Load, () => {
            rive.resizeDrawingSurfaceToCanvas()
            const vm = rive.viewModelInstance
            const motion = vm?.boolean('motion')
            if (motion) motion.value = !reducedMotion
            // The pupils never move: no wandering gaze, on any screen size.
            const autoLook = vm?.boolean('autoLook')
            if (autoLook) autoLook.value = false
            pixelate = vm?.number('pixelate') ?? null
            revealedInput = vm?.boolean('revealed') ?? null
            syncRevealed.current?.()
            applyScroll()
        })

        if (!reducedMotion) {
            window.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', onScroll, { passive: true })
        }

        // ---- only animate while the hero is on screen
        const visibility = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) rive.startRendering()
            else rive.stopRendering()
        })
        visibility.observe(box)


        return () => {
            cancelAnimationFrame(frame)
            introTimers.forEach((timer) => window.clearTimeout(timer))
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            syncRevealed.current = null
            inFlow?.removeEventListener('change', onModeChange)
            visibility.disconnect()
            resizeObserver.disconnect()
            fitArt?.removeEventListener('change', fitCanvas)
            wideGrid?.removeEventListener('change', drawGrid)
            rive.cleanup()
        }
    }, [src, fitArtQuery, inFlowQuery, wideGridQuery, backdropGrid])

    return (
        <div ref={boxRef} className={cn('relative flex items-center justify-center', className)}>
            {backdropGrid && (
                <div
                    ref={gridRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute bg-repeat opacity-0 transition-opacity duration-500"
                />
            )}
            <canvas
                ref={canvasRef}
                width={ART_SIZE}
                height={ART_SIZE}
                aria-hidden="true"
                className={cn('relative block select-none [image-rendering:pixelated]', artClassName)}
            />
        </div>
    )
}
