/**
 * Thermal renderer for the hero's pixel avatar: the 96x96 portrait drawn as a
 * grid of square cells coloured by heat, read like a thermal camera. Each
 * cell's heat is its tone in the art, plus slow drifting noise clouds and a
 * wandering hot core, so the colours keep rippling across the face while it
 * stays legible. Behind it a field of cooler clouds with holes in it, kept
 * apart from the figure by a ring of empty cells, fills the art square or, laid
 * out wider (ThermalLayout), a whole panel around it; field and shoulders drip
 * off at the bottom. The pointer leaves heat behind it, a click sends out a
 * ring of heat, and the eyes blink, the chest breathes and rows glitch now and
 * then, as in the Rive version.
 *
 * The noise field, the palette quantisation, the drips and the pointer heat are
 * adapted from "Pixel Heat Hero" (kiln), MIT License.
 */
import { AVATAR_BREATH_ROW, AVATAR_LIDS, AVATAR_ROWS, AVATAR_SLICES } from '../../data/avatar-grid'

const N = 96

/**
 * One colour per heat band, coolest first. The art's six tones sit in the
 * middle of bands 0–5, so at rest the portrait reads as it is drawn; the
 * clouds push regions a band up or down. Band 0 is drawn (near black), not
 * left empty, so nothing behind the avatar shows through its dark pixels.
 */
const PALETTE = ['#050505', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#fafafa']

/** How far the clouds move a cell's heat, as a share of the 0–1 range. */
const CLOUD_AMP = 0.2
/** Size of a cloud, in art pixels. */
const CLOUD_SIZE = 28
const CLOUD_SPEED = 0.45
/** The hot core drifting over the portrait: radius (art px) and strength. */
const CORE_RADIUS = 16
const CORE_STRENGTH = 0.14
/** Speckle, and how many times a second it reshuffles. */
const GRAIN = 0.03
const FLICKER = 1.2
/** Empty cells kept around the figure, so it reads against the field (art px). */
const RING = 2
/** Distances below this are tracked for background cells. */
const HALO = 2
/**
 * The field behind the figure: its resting heat, how sharply its clouds split
 * into colours and holes, the extra heat at the top fading to none at the
 * bottom, and its cap, kept below the face's bright bands so the face always
 * reads as the hottest thing in the square. Below FIELD_FLOOR a cell is a hole.
 */
const FIELD_WARMTH = 0.36
const FIELD_CONTRAST = 1.1
const FIELD_BODY = 0.08
const FIELD_CAP = 0.49
const FIELD_FLOOR = 1 / 6
/** The drips: how many rows up from the bottom they reach, their width in cells, their speed. */
const DRIP_ROWS = 12
const DRIP_WIDTH = 3
const DRIP_SPEED = 0.8
/** Ragged layouts also fray at the top (rows) and at both sides (columns). */
const RAGGED_ROWS = 12
const RAGGED_COLS = 20
/** Glyph (setGlyph): one flat blue (the hero's blue-400, like the ASCII logo) and its shadow. */
const GLYPH_BLUE = '#60a5fa'
const GLYPH_SHADOW = '#1e3a8a'
/** Dimmed areas (setDim): the field's bright grey drops to its dim one there, dithered over this many cells around. */
const DIM_FEATHER = 8
/** Below this many device pixels per cell there's no room for a seam between cells. */
const SEAM_MIN = 4
const FPS = 30

/**
 * The pointer, as in the reference: it leaves a trail of heat that cools off, a
 * click or tap sends out a ring of heat, and once the pointer has rested a while
 * a ghost brush wanders the field (not on touch screens). Sizes in CSS px.
 */
const CURSOR = {
    // Radius of the trail, and how hot it burns (0.45 lights the brightest bands at its centre)
    size: 90,
    strength: 0.45,
    // How hot the wandering ghost brush burns
    ghost: 0.24,
    // Share of the heat kept each frame at 60 fps: 0.97 = long glowing trail
    cool: 0.972,
    // A click's ring of heat: its widest reach and how long it takes, px and seconds
    burstReach: 340,
    burstTime: 1.1,
    // Seconds of stillness before the ghost brush starts
    idleAfter: 2.5,
}

// ---- noise (from the reference: hashed value noise, three octaves behind a domain warp)
const hash2 = (x: number, y: number, seed: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
    return n - Math.floor(n)
}
const smooth = (t: number) => t * t * (3 - 2 * t)
const noise2 = (x: number, y: number, seed: number) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = smooth(x - ix)
    const fy = smooth(y - iy)
    const a = hash2(ix, iy, seed)
    const b = hash2(ix + 1, iy, seed)
    const c = hash2(ix, iy + 1, seed)
    const d = hash2(ix + 1, iy + 1, seed)
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}
const clouds = (x: number, y: number, t: number, seed: number) => {
    const wx = x + (noise2(x * 0.45 + t * 0.06, y * 0.45, seed + 3) - 0.5) * 1.3
    const wy = y + (noise2(x * 0.45, y * 0.45 - t * 0.05, seed + 7) - 0.5) * 1.3
    const a = noise2(wx + t * 0.11, wy - t * 0.07, seed)
    const b = noise2(wx * 2.1 - t * 0.17, wy * 2.1 + t * 0.09, seed + 11)
    const c = noise2(wx * 4.3 + t * 0.23, wy * 4.3 + t * 0.19, seed + 19)
    return a * 0.58 + b * 0.29 + c * 0.13
}

/** '#rrggbb' as one little-endian RGBA word, the layout ImageData's Uint32 view expects. */
const pack = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0
}

// ---- the art, decoded once: tone 0–5 per cell, -1 for background
const BG = -1
const ART = new Int8Array(N * N)
for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
        const ch = AVATAR_ROWS[y][x]
        ART[y * N + x] = ch === '.' ? BG : Number(ch)
    }
}
const LIDS = new Int8Array(N * N).fill(BG)
for (const [x, y, tone] of AVATAR_LIDS) LIDS[y * N + x] = tone

/**
 * Distance (Chebyshev, art px) from each cell to the nearest figure cell, capped
 * at HALO + 1, on a grid padded by HALO all round, so cells just outside the
 * art square (beside the shoulders) keep their ring too.
 */
const PAD = HALO
const PN = N + 2 * PAD
const NEAR = new Uint8Array(PN * PN).fill(HALO + 1)
for (let py = 0; py < PN; py++) {
    for (let px = 0; px < PN; px++) {
        const x = px - PAD
        const y = py - PAD
        const inside = x >= 0 && y >= 0 && x < N && y < N
        if (inside && ART[y * N + x] !== BG) {
            NEAR[py * PN + px] = 0
            continue
        }
        for (let d = 1; d <= HALO; d++) {
            let hit = false
            for (let dy = -d; dy <= d && !hit; dy++) {
                for (let dx = -d; dx <= d; dx++) {
                    const nx = x + dx
                    const ny = y + dy
                    if (nx >= 0 && ny >= 0 && nx < N && ny < N && ART[ny * N + nx] !== BG) {
                        hit = true
                        break
                    }
                }
            }
            if (hit) {
                NEAR[py * PN + px] = d
                break
            }
        }
    }
}
const nearAt = (x: number, y: number) => {
    const px = x + PAD
    const py = y + PAD
    return px < 0 || py < 0 || px >= PN || py >= PN ? HALO + 1 : NEAR[py * PN + px]
}

/** Spacing (cells) of the coarse lattice the clouds are sampled on; they're smooth, so the rest is interpolated. */
const CLOUD_STEP = 3

/**
 * The grid the canvas draws: `cols` x `rows` cells, with the art's top-left cell
 * at (`ox`, `oy`). The default is the art square alone.
 */
export type ThermalLayout = {
    cols: number
    rows: number
    ox: number
    oy: number
    /** Fray the field at the top and both sides too, not just drip off at the bottom. */
    ragged?: boolean
    /** Fray the field's left edge (over `raggedLeftCols`) like the bottom drips, without the rest of `ragged`. */
    frayLeft?: boolean
    /** Ragged layouts: how many rows the top frays over (default RAGGED_ROWS). */
    raggedRows?: number
    /** Ragged and frayLeft layouts: how many columns the left edge frays over (default RAGGED_COLS). */
    raggedLeftCols?: number
}

export type ThermalAvatar = {
    /** Device pixels per cell (= per art pixel), and the grid around the art. */
    resize: (pixelDevice: number, layout?: ThermalLayout) => void
    /** Mosaic block in art pixels: 1 = sharp, then 2, 4, 6, 12. */
    setBlock: (block: number) => void
    /** Hidden until revealed (the loader covers the hero until then). */
    setRevealed: (revealed: boolean) => void
    /** Animate only while on screen. */
    setPlaying: (playing: boolean) => void
    /** Cells drawn in blue over the field, e.g. a logo (see glyphFromAscii); null for none. */
    setGlyph: (glyph: ThermalGlyph | null) => void
    /** Areas, as [x0, y0, x1, y1] in cells (x1, y1 exclusive), where the field's bright grey drops a tone, e.g. behind copy. */
    setDim: (rects: ThermalRect[]) => void
    destroy: () => void
}

export type ThermalRect = [number, number, number, number]

/** A shape set into the grid at (`x`, `y`): `mask` is `cols` x `rows`, 2 = solid, 1 = shadow, 0 = none. */
export type ThermalGlyph = { mask: Uint8Array; cols: number; rows: number; x: number; y: number }

/**
 * ASCII art as a glyph: each '█' covers `sx` x `sy` cells (fractions allowed, so
 * the glyph can match the art's rendered size exactly; the other characters are
 * dropped), with a shadow `dx` cells right and `dy` down, standing in for the
 * art's box-drawing outline.
 */
export function glyphFromAscii(
    art: string,
    sx: number,
    sy: number,
    dx: number,
    dy: number,
): Omit<ThermalGlyph, 'x' | 'y'> {
    // Every line counts, blank ones too, so the glyph lines up with the art as rendered.
    const lines = art.split('\n')
    const cols = Math.ceil(Math.max(...lines.map((line) => line.length)) * sx) + dx
    const rows = Math.ceil(lines.length * sy) + dy
    const mask = new Uint8Array(cols * rows)
    for (let y = 0; y < rows; y++) {
        const line = lines[Math.floor(y / sy)] ?? ''
        for (let x = 0; x < cols; x++) if (line[Math.floor(x / sx)] === '█') mask[y * cols + x] = 2
    }
    for (let y = rows - 1; y >= dy; y--) {
        for (let x = cols - 1; x >= dx; x--) {
            if (mask[y * cols + x] === 0 && mask[(y - dy) * cols + x - dx] === 2) mask[y * cols + x] = 1
        }
    }
    return { mask, cols, rows }
}

export function createThermalAvatar(canvas: HTMLCanvasElement, { motion }: { motion: boolean }): ThermalAvatar {
    const ctx = canvas.getContext('2d')
    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d')
    if (!ctx || !offCtx) {
        return { resize() {}, setBlock() {}, setRevealed() {}, setPlaying() {}, setGlyph() {}, setDim() {}, destroy() {} }
    }

    const palette = PALETTE.map(pack)
    const glyphBlue = pack(GLYPH_BLUE)
    const glyphShadow = pack(GLYPH_SHADOW)
    let dim: ThermalRect[] = []
    /** Whether the field drops a tone here: inside a dimmed area, or dithered in its feather. */
    const dimmed = (x: number, y: number) => {
        let dist = Infinity
        for (const [x0, y0, x1, y1] of dim) {
            const dx = Math.max(x0 - x, 0, x - (x1 - 1))
            const dy = Math.max(y0 - y, 0, y - (y1 - 1))
            dist = Math.min(dist, Math.max(dx, dy))
        }
        if (dist === 0) return true
        return dist <= DIM_FEATHER && hash2(x, y, seed + 13) < 1 - dist / (DIM_FEATHER + 1)
    }
    let glyph: ThermalGlyph | null = null
    /** 2 solid, 1 shadow, -1 the empty ring around the glyph, 0 elsewhere. */
    const glyphAt = (x: number, y: number) => {
        if (!glyph) return 0
        const gx = x - glyph.x
        const gy = y - glyph.y
        if (gx < -1 || gy < -1 || gx > glyph.cols || gy > glyph.rows) return 0
        const at = (cx: number, cy: number) =>
            cx < 0 || cy < 0 || cx >= glyph!.cols || cy >= glyph!.rows ? 0 : glyph!.mask[cy * glyph!.cols + cx]
        const own = at(gx, gy)
        if (own) return own
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(gx + dx, gy + dy)) return -1
        return 0
    }
    const seed = Math.random() * 100

    let pixel = 1
    let layout: ThermalLayout = { cols: N, rows: N, ox: 0, oy: 0 }
    let image = offCtx.createImageData(N, N)
    let pixels = new Uint32Array(image.data.buffer)
    let coarse = new Float32Array(0)
    let coarseW = 0
    let block = 1
    let revealed = false
    let playing = false
    let time = seed
    let raf = 0
    let last = 0
    let pending = 0

    // Pointer heat, one value per grid cell, cooling every frame.
    let heat = new Float32Array(N * N)
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let pointerX = -1
    let pointerY = -1
    let lastMove = -Infinity
    let ghostX = -1
    let ghostY = -1
    const waves: { x: number; y: number; age: number }[] = []

    // Blink, breath and glitch schedules, in seconds of `time`.
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    let blinkAt = time + rand(1.5, 4)
    let glitchAt = time + rand(8, 17)
    let glitch: { y0: number; y1: number; dx: number; until: number } | null = null

    /** The tone an art cell shows this frame, after breath, blink and glitch; BG for empty or off the art. */
    const toneAt = (x: number, y: number, inhale: number, blinking: boolean) => {
        if (x < 0 || y < 0 || x >= N || y >= N) return BG
        let sx = x
        let sy = y
        if (glitch && y >= glitch.y0 && y <= glitch.y1) {
            sx = x - glitch.dx
            if (sx < 0 || sx >= N) return BG
        }
        // The upper body rises one row on the inhale; row 83 then reads row 84.
        if (inhale && sy < AVATAR_BREATH_ROW) sy += 1
        const i = sy * N + sx
        if (blinking && LIDS[i] !== BG) return LIDS[i]
        return ART[i]
    }

    /** Cloud value (about -0.5..0.5) at a grid position, bilinear from the coarse lattice. */
    const cloudAt = (gx: number, gy: number) => {
        const fx = gx / CLOUD_STEP
        const fy = gy / CLOUD_STEP
        const ix = Math.max(0, Math.floor(fx))
        const iy = Math.max(0, Math.floor(fy))
        const tx = fx - ix
        const ty = fy - iy
        const i = iy * coarseW + ix
        const a = coarse[i]
        const b = coarse[i + 1]
        const c = coarse[i + coarseW]
        const d = coarse[i + coarseW + 1]
        return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
    }

    /** A soft round dab of heat (grid cells) that raises cells to its level, so a lingering brush never boils over. */
    const deposit = (x: number, y: number, amount: number, radius: number) => {
        const { cols, rows } = layout
        const inv = 1 / (2 * (radius * 0.5) ** 2)
        const c0 = Math.max(0, Math.floor(x - radius))
        const c1 = Math.min(cols - 1, Math.ceil(x + radius))
        const r0 = Math.max(0, Math.floor(y - radius))
        const r1 = Math.min(rows - 1, Math.ceil(y + radius))
        for (let row = r0; row <= r1; row++) {
            for (let col = c0; col <= c1; col++) {
                const dx = col + 0.5 - x
                const dy = row + 0.5 - y
                const w = Math.exp(-(dx * dx + dy * dy) * inv)
                if (w < 0.02) continue
                const i = row * cols + col
                heat[i] = Math.max(heat[i], amount * w)
            }
        }
    }

    /** CSS px per grid cell, as the canvas is drawn right now. */
    const cellSize = () => canvas.getBoundingClientRect().width / layout.cols || 1

    /** Dabs along a segment (grid cells), so a fast flick leaves a continuous trail. */
    const stroke = (x0: number, y0: number, x1: number, y1: number, amount: number) => {
        const radius = CURSOR.size / cellSize()
        const steps = Math.max(1, Math.min(40, Math.round(Math.hypot(x1 - x0, y1 - y0) / 0.8)))
        for (let i = 1; i <= steps; i++) {
            const f = i / steps
            deposit(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, amount, radius)
        }
    }

    /** A pointer position in grid cells, or null when it's well away from the canvas. */
    const toGrid = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect()
        const margin = CURSOR.size
        if (
            clientX < rect.left - margin ||
            clientX > rect.right + margin ||
            clientY < rect.top - margin ||
            clientY > rect.bottom + margin
        ) {
            return null
        }
        const size = rect.width / layout.cols || 1
        return { x: (clientX - rect.left) / size, y: (clientY - rect.top) / size }
    }

    const handlePointerMove = (event: PointerEvent) => {
        if (!finePointer || !raf) return
        const p = toGrid(event.clientX, event.clientY)
        if (!p) {
            pointerX = -1
            return
        }
        const now = performance.now()
        if (pointerX >= 0 && now - lastMove < 120) stroke(pointerX, pointerY, p.x, p.y, CURSOR.strength)
        else deposit(p.x, p.y, CURSOR.strength, CURSOR.size / cellSize())
        pointerX = p.x
        pointerY = p.y
        lastMove = now
    }

    const handlePointerDown = (event: PointerEvent) => {
        if (!raf || (event.target as HTMLElement | null)?.closest?.('a, button, input, textarea')) return
        const p = toGrid(event.clientX, event.clientY)
        if (p) waves.push({ x: p.x, y: p.y, age: 0 })
    }

    // Touch screens get neither the trail nor the tap's ring of heat: only a mouse plays with it.
    if (motion && finePointer) {
        window.addEventListener('pointermove', handlePointerMove, { passive: true })
        window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    }

    const render = () => {
        const { cols, rows, ox, oy } = layout
        if (!revealed) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            return
        }

        const inhale = motion && Math.sin(time * ((2 * Math.PI) / 4.2)) > 0.35 ? 1 : 0
        const blinking = motion && time >= blinkAt && time < blinkAt + 0.13
        const speckleBeat = Math.floor(time * FLICKER)
        const t = time * CLOUD_SPEED
        const coreX = ox + N * (0.5 + 0.28 * Math.sin(time * 0.13))
        const coreY = oy + N * (0.42 + 0.2 * Math.sin(time * 0.11 + 1))
        const coreInv = 1 / (2 * (CORE_RADIUS * 0.5) ** 2)
        const bands = PALETTE.length

        // The clouds on the coarse lattice, once per frame.
        const coarseH = Math.ceil(rows / CLOUD_STEP) + 2
        for (let j = 0; j < coarseH; j++) {
            for (let i = 0; i < coarseW; i++) {
                coarse[j * coarseW + i] =
                    clouds((i * CLOUD_STEP) / CLOUD_SIZE, (j * CLOUD_STEP) / CLOUD_SIZE, t, seed) - 0.5
            }
        }

        // Blocks are aligned to the art's origin, so the mosaic cuts the face the same way at any layout.
        const startX = ox - Math.ceil(ox / block) * block
        const startY = oy - Math.ceil(oy / block) * block

        for (let by = startY; by < rows; by += block) {
            const y0 = Math.max(0, by)
            const y1 = Math.min(rows, by + block)
            for (let bx = startX; bx < cols; bx += block) {
                const x0 = Math.max(0, bx)
                const x1 = Math.min(cols, bx + block)

                // A block takes the mean tone of its art cells, if at least 30% of it is art.
                let sum = 0
                let count = 0
                let cells = 0
                for (let y = by; y < by + block; y++) {
                    for (let x = bx; x < bx + block; x++) {
                        cells++
                        const tone = toneAt(x - ox, y - oy, inhale, blinking)
                        if (tone !== BG) {
                            sum += tone
                            count++
                        }
                    }
                }

                const cx = bx + block / 2
                const cy = by + block / 2
                const cloud = cloudAt(Math.max(0, cx), Math.max(0, cy))
                const grain = (hash2(bx, by, seed + speckleBeat) - 0.5) * 2 * GRAIN
                const warm = heat[Math.min(rows - 1, Math.max(0, by)) * cols + Math.min(cols - 1, Math.max(0, bx))]

                // Drips: the bottom rows fray away in columns that grow and shrink (in a
                // ragged layout the top rows and the side columns do too, in rows).
                const drip = (depth: number, group: number, salt: number) => {
                    if (depth <= 0) return false
                    const ooze = noise2(group * 0.9 + seed, time * 0.12 * DRIP_SPEED, seed + salt)
                    const reach = 0.25 + 0.9 * ooze * ooze + warm * 0.6
                    const fray = hash2(bx, by, seed + salt + 10 + Math.floor(speckleBeat / 2)) * 0.2
                    return depth > reach - fray
                }
                const column = Math.floor(bx / DRIP_WIDTH)
                const row = Math.floor(by / DRIP_WIDTH)
                let dripped = drip((by - (rows - DRIP_ROWS)) / DRIP_ROWS, column, 31)
                const topRows = layout.raggedRows ?? RAGGED_ROWS
                const leftCols = layout.raggedLeftCols ?? RAGGED_COLS
                if ((layout.ragged || layout.frayLeft) && !dripped) dripped = drip((leftCols - bx) / leftCols, row, 83)
                if (layout.ragged && !dripped) {
                    dripped =
                        drip((topRows - by) / topRows, column, 57) ||
                        drip((bx - (cols - RAGGED_COLS)) / RAGGED_COLS, row, 109)
                }

                let h = -1
                let field = false
                if (dripped) {
                    // a hole
                } else if (count / cells >= (block === 1 ? 1 : 0.3)) {
                    // The figure: its tone, rippled by the clouds and the drifting core. Dark
                    // tones barely ripple, so hair and jacket stay a dark silhouette against
                    // the field instead of melting into its blues.
                    const tone = sum / count
                    const lift = 0.2 + 0.8 * (tone / (bands - 1))
                    const dx = cx - coreX
                    const dy = cy - coreY
                    h = (tone + 0.5) / bands + (cloud * 2 * CLOUD_AMP + grain) * lift
                    h += CORE_STRENGTH * lift * Math.exp(-(dx * dx + dy * dy) * coreInv)
                    h = Math.max(0, h + warm)
                } else if (block > 1 || nearAt(bx - ox, by - oy) > RING) {
                    // The field: cooler clouds, denser at the top, with holes where they thin out,
                    // dissolving at its left edge when it reaches past the art.
                    h = FIELD_WARMTH + cloud * FIELD_CONTRAST + FIELD_BODY * (1 - cy / rows) + grain
                    // The cap holds the clouds below the face's bright bands; the pointer's heat
                    // goes on top, so the trail can light the brightest bands and fill holes.
                    h = Math.min(FIELD_CAP, h) + warm
                    if (h < FIELD_FLOOR) h = -1
                    field = true
                }

                let colour = 0
                // In the mosaic a block takes the glyph's cell at its centre.
                const g = glyph ? (block === 1 ? glyphAt(bx, by) : glyphAt(Math.floor(cx), Math.floor(cy))) : 0
                if (g === 2) {
                    colour = glyphBlue
                } else if (g === 1) {
                    colour = glyphShadow
                } else if (g === -1) {
                    // the ring around the glyph stays empty
                } else if (h >= 0) {
                    const band = Math.max(0, Math.min(bands - 1, Math.floor(h * bands)))
                    colour = palette[band === 2 && field && dim.length > 0 && dimmed(bx, by) ? 1 : band]
                }
                for (let y = y0; y < y1; y++) pixels.fill(colour, y * cols + x0, y * cols + x1)
            }
        }

        offCtx.putImageData(image, 0, 0)
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(off, 0, 0, canvas.width, canvas.height)

        // Seams between cells (or blocks), cleared so the page shows through like the reference's grid.
        if (pixel >= SEAM_MIN) {
            const step = pixel * block
            for (let s = (startX + block) * pixel; s < canvas.width; s += step) ctx.clearRect(s - 1, 0, 1, canvas.height)
            for (let s = (startY + block) * pixel; s < canvas.height; s += step) ctx.clearRect(0, s - 1, canvas.width, 1)
        }
    }

    const advance = (dt: number) => {
        time += dt

        const keep = Math.pow(CURSOR.cool, dt * 60)
        for (let i = 0; i < heat.length; i++) heat[i] *= keep

        // The ghost brush: wanders the field once the mouse has rested. Touch screens
        // don't get it: with nothing to steer it, its glare just sweeps over the copy.
        const { cols, rows } = layout
        if (finePointer && performance.now() - lastMove > CURSOR.idleAfter * 1000) {
            const targetX = cols * (0.5 + 0.4 * Math.sin(time * 0.31))
            const targetY = rows * (0.42 + 0.3 * Math.sin(time * 0.47 + 1))
            if (ghostX < 0) {
                ghostX = pointerX >= 0 ? pointerX : targetX
                ghostY = pointerX >= 0 ? pointerY : targetY
            }
            const follow = 1 - Math.exp(-dt * 1.2)
            const nextX = ghostX + (targetX - ghostX) * follow
            const nextY = ghostY + (targetY - ghostY) * follow
            stroke(ghostX, ghostY, nextX, nextY, CURSOR.ghost)
            ghostX = nextX
            ghostY = nextY
        } else {
            ghostX = -1
        }

        // Click rings: a circle of dabs spreading out and cooling as it goes.
        const size = cellSize()
        for (let w = waves.length - 1; w >= 0; w--) {
            const wave = waves[w]
            wave.age += dt
            const p = wave.age / CURSOR.burstTime
            if (p >= 1) {
                waves.splice(w, 1)
                continue
            }
            const radius = (CURSOR.burstReach / size) * (1 - Math.pow(1 - p, 3))
            const dots = Math.max(8, Math.ceil((2 * Math.PI * radius) / 1.4))
            for (let d = 0; d < dots; d++) {
                const a = (d / dots) * Math.PI * 2
                deposit(wave.x + Math.cos(a) * radius, wave.y + Math.sin(a) * radius, 0.5 * (1 - p), 2.2)
            }
        }

        if (time > blinkAt + 0.13) blinkAt = time + rand(2.5, 6)
        if (glitch && time > glitch.until) glitch = null
        if (time > glitchAt) {
            const [y0, y1, dx] = AVATAR_SLICES[Math.floor(Math.random() * AVATAR_SLICES.length)]
            glitch = { y0, y1, dx, until: time + 0.12 }
            glitchAt = time + rand(8, 17)
        }
    }

    const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        const dt = Math.min(0.1, (now - last) / 1000)
        last = now
        pending += dt
        if (pending < 1 / FPS) return
        advance(Math.min(pending, 0.25))
        pending = 0
        render()
    }

    const sync = () => {
        const run = motion && playing && revealed
        if (run && !raf) {
            last = performance.now()
            raf = requestAnimationFrame(frame)
        } else if (!run && raf) {
            cancelAnimationFrame(raf)
            raf = 0
        }
        if (!raf) render()
    }

    return {
        resize(next, nextLayout = { cols: N, rows: N, ox: 0, oy: 0 }) {
            pixel = Math.max(1, next)
            layout = nextLayout
            canvas.width = layout.cols * pixel
            canvas.height = layout.rows * pixel
            off.width = layout.cols
            off.height = layout.rows
            image = offCtx.createImageData(layout.cols, layout.rows)
            pixels = new Uint32Array(image.data.buffer)
            heat = new Float32Array(layout.cols * layout.rows)
            coarseW = Math.ceil(layout.cols / CLOUD_STEP) + 2
            coarse = new Float32Array(coarseW * (Math.ceil(layout.rows / CLOUD_STEP) + 3))
            render()
        },
        setBlock(next) {
            block = next
            if (!raf) render()
        },
        setRevealed(next) {
            revealed = next
            sync()
        },
        setPlaying(next) {
            playing = next
            sync()
        },
        setDim(next) {
            dim = next
            if (!raf) render()
        },
        setGlyph(next) {
            glyph = next
            if (!raf) render()
        },
        destroy() {
            cancelAnimationFrame(raf)
            raf = 0
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerdown', handlePointerDown)
        },
    }
}
