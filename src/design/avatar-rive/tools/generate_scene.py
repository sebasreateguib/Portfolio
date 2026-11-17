#!/usr/bin/env python3
"""Generate scene.rml for the pixel-art avatar from ../../avatar.png.

The source PNG is 960x960 but every logical pixel is a 10x10 block, so it is
read as a 96x96 grid. Each run of identical, 4-connected pixels becomes one
closed vector contour (a PointsPath), and every contour of the same colour in
the same layer shares one Shape, so the file stays light to render.

Layers (front to back, which is RML declaration order):
    Full:      Glitch slices  >  Lids (blink)  >  Pupils (clipped to the eye
               openings)  >  Eye openings  >  Head  >  Upper body (breathes)
               >  Lower body (static)
    Mosaics:   the same picture at 2, 4, 6 and 12px blocks, each a static layer

State machine "Avatar" (view model "Avatar"):
    Gaze     wanders on its own while autoLook is true (lookX/lookY still work)
    Blink    every 3-5s, sometimes twice
    Breathe  1px rise, 4s loop
    Resolve  once `revealed` turns true the picture resolves from 12px blocks
             to full resolution; after that `pixelate` (0..1, the page's scroll)
             steps it back down through the mosaics
    Glitch   every 8-17s one of four short slice/jitter glitches
    `motion` false (prefers-reduced-motion) skips the intro and the glitches.

Run from anywhere:  python3 tools/generate_scene.py
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
SRC = PROJECT.parent / "avatar.png"
OUT = PROJECT / "scene.rml"

N = 96            # logical grid size
BREATH_ROW = 84   # rows above this rise 1px on the inhale

BLACK = 0
COLOR_NAMES = {0: "Black", 42: "Ink", 85: "Shadow", 138: "Midtone", 200: "Skin", 242: "Highlight"}
PALETTE = sorted(COLOR_NAMES)

# Pixelation: block size per level, and the `pixelate` value each level starts at.
MOSAIC_BLOCKS = [2, 4, 6, 12]
MOSAIC_MIN_ART = 0.3  # a block is drawn when at least this much of it is art
PIXELATE_AT = [0.15, 0.35, 0.55, 0.75]

# Glitch tint: the site's accent blue (tailwind blue-400) ramped from black.
ACCENT = (0x60, 0xA5, 0xFA)
ACCENT_LIGHT = (0xDB, 0xEA, 0xFE)

# Eye geometry (logical pixel coordinates), read off the source grid.
EYE_BOX_L = (35, 33, 40, 35)   # x0, y0, x1, y1 inclusive
EYE_BOX_R = (53, 33, 59, 34)
# Gaze retouch, applied to the grid as it is read: in the source the right
# glint sits against the outer corner and the left one leans the other way,
# so the eyes diverge. Both glints are moved to the middle of their opening.
EYE_RETOUCH = {(37, 35): 42, (38, 35): 242, (56, 34): 242, (57, 34): BLACK}
PUPIL_L = {(37, 35): 42, (38, 35): 242}   # iris glint, left eye (retouched)
PUPIL_R = {(56, 34): 242}                 # iris glint, right eye (retouched)
# The eyes are only 2-3px tall, so pupils track the cursor horizontally
# (+-2px) and the head carries the vertical part (+-1px). Lifting a glint 1px
# is only used in wander glances where it stays inside both openings.


# --------------------------------------------------------------------------
# Reading the grid
# --------------------------------------------------------------------------
def load_grid() -> list[list[int]]:
    im = Image.open(SRC).convert("L")
    w, h = im.size
    scale = w // N
    assert w == h == N * scale, f"expected a {N}x{N} grid, got {w}x{h}"
    px = im.load()
    grid = [[px[x * scale, y * scale] for x in range(N)] for y in range(N)]
    # every block must be a single flat colour
    for y in range(N):
        for x in range(N):
            c = grid[y][x]
            for dy in range(scale):
                for dx in range(scale):
                    assert px[x * scale + dx, y * scale + dy] == c, (x, y)
    for (x, y), c in EYE_RETOUCH.items():
        grid[y][x] = c
    return grid


def neighbours4(x, y):
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < N and 0 <= ny < N:
            yield nx, ny


def background(grid) -> set:
    """Black pixels 4-connected to the border: left transparent."""
    seen = set()
    q = deque()
    for i in range(N):
        for p in ((i, 0), (i, N - 1), (0, i), (N - 1, i)):
            if grid[p[1]][p[0]] == BLACK and p not in seen:
                seen.add(p)
                q.append(p)
    while q:
        x, y = q.popleft()
        for n in neighbours4(x, y):
            if n not in seen and grid[n[1]][n[0]] == BLACK:
                seen.add(n)
                q.append(n)
    return seen


def head_mask(grid, bg) -> set:
    """Hair, face and ears: everything above the jaw line."""
    head = {(x, y) for y in range(56) for x in range(N) if (x, y) not in bg}
    # Below row 55 the jaw is fenced from the neck by a diagonal black line;
    # flood through non-black pixels inside the jaw's column span.
    q = deque(p for p in head if p[1] == 55)
    while q:
        x, y = q.popleft()
        for nx, ny in neighbours4(x, y):
            p = (nx, ny)
            if p in head or grid[ny][nx] == BLACK:
                continue
            if 56 <= ny <= 63 and 36 <= nx <= 60:
                head.add(p)
                q.append(p)
    # The black jaw line itself belongs to the head.
    for y in range(56, 64):
        for x in range(35, 62):
            if grid[y][x] == BLACK and (x, y) not in bg:
                if any((x + dx, y + dy) in head for dx in (-1, 0, 1) for dy in (-1, 0, 1)):
                    head.add((x, y))
    return head


# --------------------------------------------------------------------------
# Pixels -> contours
# --------------------------------------------------------------------------
def components(pixels: dict) -> list[tuple[int, set]]:
    """4-connected runs of identical colour: [(colour, {(x,y)})]."""
    seen = set()
    out = []
    for p in sorted(pixels, key=lambda t: (t[1], t[0])):
        if p in seen:
            continue
        c = pixels[p]
        comp = {p}
        seen.add(p)
        q = deque([p])
        while q:
            x, y = q.popleft()
            for n in neighbours4(x, y):
                if n not in seen and pixels.get(n) == c:
                    seen.add(n)
                    comp.add(n)
                    q.append(n)
        out.append((c, comp))
    return out


def contours(comp: set) -> list[list[tuple[int, int]]]:
    """Trace closed outlines around a pixel set.

    Edges run with the interior on their right (y grows downward), so outer
    outlines come out clockwise and holes counter-clockwise; with the nonZero
    rule that fills exactly the pixels of the set.
    """
    edges = {}
    for x, y in comp:
        if (x, y - 1) not in comp:
            edges.setdefault((x, y), []).append((x + 1, y))
        if (x + 1, y) not in comp:
            edges.setdefault((x + 1, y), []).append((x + 1, y + 1))
        if (x, y + 1) not in comp:
            edges.setdefault((x + 1, y + 1), []).append((x, y + 1))
        if (x - 1, y) not in comp:
            edges.setdefault((x, y + 1), []).append((x, y))

    loops = []
    while edges:
        start = min(edges)
        loop = [start]
        prev = None
        cur = start
        while True:
            outs = edges[cur]
            if len(outs) == 1:
                nxt = outs[0]
            else:
                # pinch point: prefer the right turn so a loop hugs its pixel
                dx, dy = (cur[0] - prev[0], cur[1] - prev[1]) if prev else (1, 0)
                right = (cur[0] - dy, cur[1] + dx)
                nxt = right if right in outs else outs[0]
            outs.remove(nxt)
            if not outs:
                del edges[cur]
            prev, cur = cur, nxt
            if cur == start and (start not in edges):
                break
            if cur == start:
                break
            loop.append(cur)
        loops.append(simplify(loop))
    return loops


def simplify(loop):
    """Drop vertices in the middle of straight runs."""
    out = []
    n = len(loop)
    for i in range(n):
        a, b, c = loop[i - 1], loop[i], loop[(i + 1) % n]
        if (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) != 0:
            out.append(b)
    return out


def signed_area(loop):
    s = 0
    for i in range(len(loop)):
        x1, y1 = loop[i]
        x2, y2 = loop[(i + 1) % len(loop)]
        s += x1 * y2 - x2 * y1
    return s / 2  # > 0 means clockwise on a y-down canvas


# --------------------------------------------------------------------------
# RML emission
# --------------------------------------------------------------------------
class Ids:
    def __init__(self, start=10):
        self.n = start

    def __call__(self):
        self.n += 1
        return f"0:{self.n}"


def hexcolor(v: int) -> str:
    return f"FF{v:02X}{v:02X}{v:02X}"


def accent_hex(v: int) -> str:
    """Grey level -> the same lightness on the accent-blue ramp."""
    if v <= 200:
        t = v / 200
        r, g, b = (round(c * t) for c in ACCENT)
    else:
        t = (v - 200) / 55
        r, g, b = (round(a + (l - a) * t) for a, l in zip(ACCENT, ACCENT_LIGHT))
    return f"FF{r:02X}{g:02X}{b:02X}"


def mosaic(grid, bg, block: int) -> dict:
    """The picture at `block`-px blocks: each block takes the palette colour
    nearest the mean of its art pixels, and is left empty when less than
    MOSAIC_MIN_ART of it is art."""
    out = {}
    for by in range(0, N, block):
        for bx in range(0, N, block):
            cells = [(x, y) for y in range(by, by + block) for x in range(bx, bx + block)]
            art = [grid[y][x] for x, y in cells if (x, y) not in bg]
            if len(art) < MOSAIC_MIN_ART * len(cells):
                continue
            mean = sum(art) / len(art)
            c = min(PALETTE, key=lambda v: abs(v - mean))
            for p in cells:
                out[p] = c
    return out


def shapes_xml(pixels: dict, label: str, indent: str, tint=hexcolor) -> tuple[str, int]:
    """One Shape per colour; one PointsPath per contour of each run."""
    by_colour: dict[int, list[set]] = {}
    for c, comp in components(pixels):
        by_colour.setdefault(c, []).append(comp)
    lines = []
    total_runs = 0
    # lighter colours first so they read on top in the editor's layer list;
    # draw order between colours is irrelevant (runs never overlap in a layer)
    for c in sorted(by_colour, reverse=True):
        comps = by_colour[c]
        total_runs += len(comps)
        lines.append(f'{indent}<Shape name="{label} {COLOR_NAMES[c]}">')
        for i, comp in enumerate(comps):
            for j, loop in enumerate(contours(comp)):
                cw = "true" if signed_area(loop) > 0 else "false"
                kind = "Run" if j == 0 else "Hole"
                lines.append(
                    f'{indent}    <PointsPath isClosed="true" isClockwise="{cw}" '
                    f'name="{kind} {i + 1}">'
                )
                for x, y in loop:
                    lines.append(f'{indent}        <StraightVertex x="{x}" y="{y}"/>')
                lines.append(f"{indent}    </PointsPath>")
        lines.append(f'{indent}    <Fill name="Fill">')
        lines.append(f'{indent}        <SolidColor colorValue="{tint(c)}" name="Color"/>')
        lines.append(f"{indent}    </Fill>")
        lines.append(f"{indent}</Shape>")
    return "\n".join(lines), total_runs


def in_box(p, box):
    x0, y0, x1, y1 = box
    return x0 <= p[0] <= x1 and y0 <= p[1] <= y1


def build():
    grid = load_grid()
    bg = background(grid)
    head = head_mask(grid, bg)

    pupils = {**PUPIL_L, **PUPIL_R}
    for (x, y), c in pupils.items():
        assert grid[y][x] == c, f"pupil pixel {(x, y)} is {grid[y][x]}, expected {c}"

    # Eye openings: the black almond of each eye plus the glint pixels,
    # which become black underneath the movable pupils.
    eyes = {}
    for y in range(N):
        for x in range(N):
            p = (x, y)
            if (in_box(p, EYE_BOX_L) or in_box(p, EYE_BOX_R)) and (
                (grid[y][x] == BLACK and p not in bg) or p in pupils
            ):
                eyes[p] = BLACK

    head_px = {p: grid[p[1]][p[0]] for p in head if p not in eyes}

    # Body = everything else that is not background.
    body = {
        (x, y): grid[y][x]
        for y in range(N)
        for x in range(N)
        if (x, y) not in bg and (x, y) not in head
    }

    # Neck underlay: extend each neck column 3px up under the jaw so a 1px
    # head move never opens a hole between chin and neck.
    for x in range(34, 64):
        top = next(
            (y for y in range(50, N) if (x, y) in body and grid[y][x] != BLACK and (x, y) not in head),
            None,
        )
        if top is None or top > 70:
            continue
        for y in range(top - 3, top):
            if (x, y) in head:
                body[(x, y)] = grid[top][x]

    upper = {p: c for p, c in body.items() if p[1] < BREATH_ROW}
    # lower keeps one duplicated row so the inhale never opens a gap
    lower = {p: c for p, c in body.items() if p[1] >= BREATH_ROW - 1}

    # Blink lids, drawn over the eye openings (colours from the face).
    SH, MID, INK = 85, 138, 42
    lid_half = {}
    lid_closed = {}
    for p in eyes:
        x, y = p
        if in_box(p, EYE_BOX_L):
            if y == 33:
                lid_half[p] = MID
                lid_closed[p] = MID
            elif y == 34:
                lid_half[p] = INK
                lid_closed[p] = MID
            else:
                lid_closed[p] = INK
        else:
            if y == 33:
                lid_half[p] = INK
                lid_closed[p] = MID
            else:
                lid_closed[p] = INK

    ids = Ids()
    I = {k: ids() for k in [
        "artboard", "style", "sm", "vm", "vmi", "pLookX", "pLookY", "pAuto",
        "breath", "headWander", "headTrack", "lidHalf", "lidClosed", "pupils",
        "pupilWander", "pupilTrack", "eyes",
        "cEaseFast", "cEaseSlow", "cMapPupilX", "cMapUnit", "cRound",
        "gPupilX", "gHeadX", "gHeadY",
        "pPixelate", "pMotion", "pRevealed", "full",
    ]}
    for b in MOSAIC_BLOCKS:
        I[f"m{b}"] = ids()

    def bind(prop, key, conv):
        return (f'<DataBindContext sourcePathIds="{I["vm"]}-{I[prop]}" '
                f'propertyKey="{key}" converterId="{I[conv]}"/>')

    stats = {}
    ind = " " * 4

    def layer(pixels, label, depth, tint=hexcolor):
        xml, runs = shapes_xml(pixels, label, ind * depth, tint)
        stats[label] = (len(pixels), runs)
        return xml

    # ---------------------------------------------------------------- scene
    # Glitch slices: a band of rows, shifted sideways, drawn over a black
    # copy of the band that blanks the original underneath.
    full_px = {(x, y): grid[y][x] for y in range(N) for x in range(N) if (x, y) not in bg}

    def band(y0, y1):
        return {p: c for p, c in full_px.items() if y0 <= p[1] <= y1}

    def shifted(px, dx):
        return {(x + dx, y): c for (x, y), c in px.items() if 0 <= x + dx < N}

    # name, rows, dx, tinted
    slices = [
        ("Slice Hair", (21, 25), 5, False),
        ("Slice Brow", (28, 31), -3, False),
        ("Slice Mouth", (49, 52), 4, False),
        ("Slice Eyes Blue", (32, 36), 3, True),
        ("Slice Chin", (58, 60), -3, False),
    ]
    glitch_xml = [f'{ind * 3}<Node name="Glitch">']
    for name, (y0, y1), dx, tinted in slices:
        I[name] = ids()
        src = band(y0, y1)
        glitch_xml.append(f'{ind * 4}<Node opacity="0" name="{name}" id="{I[name]}">')
        glitch_xml.append(layer(shifted(src, dx), name, 5, accent_hex if tinted else hexcolor))
        glitch_xml.append(layer({p: BLACK for p in src}, f"{name} Erase", 5))
        glitch_xml.append(f"{ind * 4}</Node>")
    glitch_xml.append(f"{ind * 3}</Node>")

    scene = f"""
        <Node name="Full" id="{I['full']}">
        <Node name="Breath" id="{I['breath']}">
{chr(10).join(glitch_xml)}
            <Node name="Head Wander" id="{I['headWander']}">
                <Node name="Head Track" id="{I['headTrack']}">
                    {bind('pLookX', 13, 'gHeadX')}
                    {bind('pLookY', 14, 'gHeadY')}
                    <Node name="Lids">
                        <Node opacity="0" name="Lid Closed" id="{I['lidClosed']}">
{layer(lid_closed, 'Lid Closed', 7)}
                        </Node>
                        <Node opacity="0" name="Lid Half" id="{I['lidHalf']}">
{layer(lid_half, 'Lid Half', 7)}
                        </Node>
                    </Node>
                    <Node name="Pupils" id="{I['pupils']}">
                        <ClippingShape sourceId="{I['eyes']}" name="Eye Clip"/>
                        <Node name="Pupil Wander" id="{I['pupilWander']}">
                            <Node name="Pupil Track" id="{I['pupilTrack']}">
                                {bind('pLookX', 13, 'gPupilX')}
{layer(PUPIL_L, 'Pupil L', 8)}
{layer(PUPIL_R, 'Pupil R', 8)}
                            </Node>
                        </Node>
                    </Node>
"""
    eye_xml, _ = shapes_xml(eyes, "Eye Openings", ind * 5)
    stats["Eye Openings"] = (len(eyes), len(components(eyes)))
    # the clip source needs the id, so tag the single black Shape
    eye_xml = eye_xml.replace('<Shape name="Eye Openings Black">',
                              f'<Shape name="Eye Openings" id="{I["eyes"]}">', 1)
    scene += eye_xml + "\n"
    scene += layer(head_px, "Head", 5) + "\n"
    scene += """                </Node>
            </Node>
"""
    scene += layer(upper, "Upper Body", 3) + "\n"
    scene += "        </Node>\n"
    scene += layer(lower, "Lower Body", 2) + "\n"
    scene += "        </Node>\n"
    for b in MOSAIC_BLOCKS:
        scene += f'        <Node opacity="0" name="Mosaic {b}px" id="{I[f"m{b}"]}">\n'
        scene += layer(mosaic(grid, bg, b), f"Mosaic {b}px", 3) + "\n"
        scene += "        </Node>\n"

    # ---------------------------------------------------------- animations
    anims = []
    aid = {}

    def hold(v, f):
        return f'<KeyFrameDouble value="{v}" frame="{f}" interpolationType="hold"/>'

    def anim(name, duration, keyed: dict, loop=False):
        """keyed: {objectKey: {property: [(frame, value), ...]}}"""
        aid[name] = ids()
        loopattr = ' loopValue="loop"' if loop else ""
        body_ = []
        for obj, props in keyed.items():
            body_.append(f'            <KeyedObject objectId="{I[obj]}">')
            for prop, keys in props.items():
                body_.append(f'                <KeyedProperty property="{prop}">')
                for f, v in keys:
                    body_.append(f"                    {hold(v, f)}")
                body_.append("                </KeyedProperty>")
            body_.append("            </KeyedObject>")
        anims.append(
            f'        <LinearAnimation{loopattr} duration="{duration}" name="{name}" id="{aid[name]}">\n'
            + "\n".join(body_)
            + "\n        </LinearAnimation>"
        )

    # Breathing: 4s loop, rise 1px for ~1.7s.
    anim("Breathe", 240, {"breath": {"y": [(0, 0), (100, -1), (200, 0)]}}, loop=True)

    lids_open = {"lidHalf": {"opacity": [(0, 0)]}, "lidClosed": {"opacity": [(0, 0)]}}
    anim("Blink Pick", 1, lids_open)
    waits = [180, 210, 240, 270, 300]  # 3.0 - 5.0 s
    for w in waits:
        anim(f"Blink Wait {w / 60:.1f}s", w, lids_open)
    anim("Blink", 14, {
        "lidHalf": {"opacity": [(0, 1), (2, 0), (7, 1), (10, 0)]},
        "lidClosed": {"opacity": [(0, 0), (2, 1), (7, 0)]},
    })
    anim("Double Blink", 30, {
        "lidHalf": {"opacity": [(0, 1), (2, 0), (6, 1), (9, 0), (16, 1), (18, 0), (22, 1), (25, 0)]},
        "lidClosed": {"opacity": [(0, 0), (2, 1), (6, 0), (18, 1), (22, 0)]},
    })

    centre = {
        "headWander": {"x": [(0, 0)], "y": [(0, 0)]},
        "pupilWander": {"x": [(0, 0)], "y": [(0, 0)]},
    }
    anim("Gaze Track", 10, centre)
    anim("Gaze Pick", 1, {})

    # Glances: the eyes move first, the head follows 6 frames later.
    glances = [
        # name, duration, pupil (x, y), head (x, y), weight
        ("Look Centre", 150, (0, 0), (0, 0), 3),
        ("Look Left", 130, (-2, 0), (-1, 0), 2),
        ("Look Right", 140, (2, 0), (1, 0), 2),
        ("Look Up", 110, (0, -1), (0, -1), 1),
        ("Look Up Left", 110, (-1, -1), (-1, -1), 1),
        ("Look Up Right", 120, (1, 0), (1, -1), 1),
        ("Look Down Left", 100, (-2, 0), (-1, 1), 1),
        ("Look Down Right", 110, (1, 0), (1, 1), 1),
    ]
    for name, dur, (px_, py_), (hx, hy), _w in glances:
        anim(name, dur, {
            "pupilWander": {"x": [(0, px_)], "y": [(0, py_)]},
            "headWander": {"x": [(0, 0), (6, hx)], "y": [(0, 0), (6, hy)]},
        })
    # A quick scan from one side to the other.
    anim("Look Around", 150, {
        "pupilWander": {"x": [(0, -2), (45, 0), (60, 2)], "y": [(0, 0)]},
        "headWander": {"x": [(0, 0), (6, -1), (51, 0), (66, 1)], "y": [(0, 0)]},
    })
    glances.append(("Look Around", 150, None, None, 1))

    # Resolve: one level of detail visible at a time.
    levels = ["full"] + [f"m{b}" for b in MOSAIC_BLOCKS]

    def only(which):
        return {o: {"opacity": [(0, 1 if o == which else 0)]} for o in levels}

    anim("Hidden", 1, only(None))
    for i, o in enumerate(levels):
        anim(f"Pixel {i}", 1, only(o))
    # The coarsest mosaic flickers on like a CRT, then sharpens step by step.
    m = [f"m{b}" for b in MOSAIC_BLOCKS]
    intro = [(0, m[3]), (3, None), (6, m[3]), (14, m[2]), (22, m[1]), (29, m[0]), (35, "full")]
    anim("Intro", 36, {o: {"opacity": [(f, 1 if o == w else 0) for f, w in intro]} for o in levels})

    # Glitch: slices that blink on for a few frames, and a sideways jitter.
    def flick(dur, *spans):
        keys = {0: 0, dur: 0}
        for a, b in spans:
            keys[a] = 1
            keys[b] = 0
        return {"opacity": sorted(keys.items())}

    calm = {name: {"opacity": [(0, 0)]} for name, *_ in slices}
    calm["full"] = {"x": [(0, 0)]}
    anim("Glitch Pick", 1, calm)
    glitch_waits = [480, 660, 840, 1020]  # 8 - 17 s
    for w in glitch_waits:
        anim(f"Glitch Wait {w / 60:.0f}s", w, calm)
    glitch_variants = [
        # name, duration, keyed, weight
        ("Glitch Tear", 10, {
            "Slice Hair": flick(10, (0, 4), (6, 9)),
            "Slice Mouth": flick(10, (2, 7)),
        }, 3),
        ("Glitch Split", 9, {
            "Slice Brow": flick(9, (0, 5)),
            "Slice Chin": flick(9, (3, 8)),
        }, 3),
        ("Glitch Blue", 9, {
            "Slice Eyes Blue": flick(9, (0, 3), (5, 8)),
            "full": {"x": [(0, 0), (5, 1), (8, 0)]},
        }, 2),
        ("Glitch Jitter", 6, {
            "full": {"x": [(0, 1), (2, -1), (4, 1), (5, 0)]},
        }, 2),
    ]
    for name, dur, keyed, _w in glitch_variants:
        anim(name, dur, keyed)

    # -------------------------------------------------------- state machine
    def bool_is(prop, value):
        return f"""<TransitionViewModelCondition>
                        <TransitionPropertyViewModelComparator>
                            <BindablePropertyBoolean>
                                <DataBindContext sourcePathIds="{I['vm']}-{I[prop]}" propertyKey="634"/>
                            </BindablePropertyBoolean>
                        </TransitionPropertyViewModelComparator>
                        <TransitionValueBooleanComparator value="{value}"/>
                    </TransitionViewModelCondition>"""

    def auto_is(value):
        return bool_is("pAuto", value)

    def number_is(prop, op, value):
        return f"""<TransitionViewModelCondition opValue="{op}">
                        <TransitionPropertyViewModelComparator>
                            <BindablePropertyNumber>
                                <DataBindContext sourcePathIds="{I['vm']}-{I[prop]}" propertyKey="636"/>
                            </BindablePropertyNumber>
                        </TransitionPropertyViewModelComparator>
                        <TransitionValueNumberComparator value="{value}"/>
                    </TransitionViewModelCondition>"""

    def after_end(to, weight=None, extra=""):
        w = f' randomWeight="{weight}"' if weight else ""
        return (f'<StateTransition stateToId="{to}" enableExitTime="true" '
                f'exitTimeIsPercetange="true" exitTime="100"{w}>{extra}</StateTransition>')

    S = {k: ids() for k in ["track", "gazePick", "blinkPick", "blink", "dblink", "breathe"]}
    for name, *_ in glances:
        S[name] = ids()
    for w in waits:
        S[f"wait{w}"] = ids()

    gaze = []
    gaze.append(f'<EntryState x="0" y="0"><StateTransition stateToId="{S["track"]}"/></EntryState>')
    gaze.append(
        f'<AnimationState x="160" y="0" animationId="{aid["Gaze Track"]}" id="{S["track"]}">'
        f'<StateTransition stateToId="{S["gazePick"]}">{auto_is("true")}</StateTransition>'
        f"</AnimationState>"
    )
    pick_out = [f'<StateTransition stateToId="{S["track"]}">{auto_is("false")}</StateTransition>']
    for name, _d, _p, _h, weight in glances:
        pick_out.append(after_end(S[name], weight))
    gaze.append(
        f'<AnimationState x="320" y="0" random="true" animationId="{aid["Gaze Pick"]}" '
        f'id="{S["gazePick"]}">' + "".join(pick_out) + "</AnimationState>"
    )
    for i, (name, *_rest) in enumerate(glances):
        gaze.append(
            f'<AnimationState x="{160 + 160 * i}" y="200" animationId="{aid[name]}" id="{S[name]}">'
            f'<StateTransition stateToId="{S["track"]}">{auto_is("false")}</StateTransition>'
            + after_end(S["gazePick"])
            + "</AnimationState>"
        )

    blink = []
    blink.append(f'<EntryState x="0" y="0"><StateTransition stateToId="{S["blinkPick"]}"/></EntryState>')
    blink.append(
        f'<AnimationState x="160" y="0" random="true" animationId="{aid["Blink Pick"]}" '
        f'id="{S["blinkPick"]}">' + "".join(after_end(S[f"wait{w}"]) for w in waits) + "</AnimationState>"
    )
    for i, w in enumerate(waits):
        blink.append(
            f'<AnimationState x="{160 * i}" y="200" random="true" '
            f'animationId="{aid[f"Blink Wait {w / 60:.1f}s"]}" id="{S[f"wait{w}"]}">'
            + after_end(S["blink"], 6) + after_end(S["dblink"], 1)
            + "</AnimationState>"
        )
    blink.append(
        f'<AnimationState x="160" y="400" animationId="{aid["Blink"]}" id="{S["blink"]}">'
        + after_end(S["blinkPick"]) + "</AnimationState>"
    )
    blink.append(
        f'<AnimationState x="480" y="400" animationId="{aid["Double Blink"]}" id="{S["dblink"]}">'
        + after_end(S["blinkPick"]) + "</AnimationState>"
    )

    breathe = [
        f'<EntryState x="0" y="0"><StateTransition stateToId="{S["breathe"]}"/></EntryState>',
        f'<AnimationState x="160" y="0" animationId="{aid["Breathe"]}" id="{S["breathe"]}"/>',
    ]

    # Resolve: hidden until revealed, the intro, then one state per level of
    # detail, each stepping to its neighbour as `pixelate` crosses a threshold.
    R = {k: ids() for k in ["hidden", "intro"] + [f"p{i}" for i in range(len(levels))]}
    resolve = [
        f'<EntryState x="0" y="0"><StateTransition stateToId="{R["hidden"]}"/></EntryState>',
        f'<AnimationState x="160" y="0" animationId="{aid["Hidden"]}" id="{R["hidden"]}">'
        f'<StateTransition stateToId="{R["p0"]}">{bool_is("pMotion", "false")}</StateTransition>'
        f'<StateTransition stateToId="{R["intro"]}">{bool_is("pRevealed", "true")}</StateTransition>'
        "</AnimationState>",
        f'<AnimationState x="320" y="0" animationId="{aid["Intro"]}" id="{R["intro"]}">'
        f'<StateTransition stateToId="{R["p0"]}">{bool_is("pMotion", "false")}</StateTransition>'
        + after_end(R["p0"]) + "</AnimationState>",
    ]
    for i in range(len(levels)):
        out = []
        if i + 1 < len(levels):
            out.append(f'<StateTransition stateToId="{R[f"p{i + 1}"]}">'
                       f'{number_is("pPixelate", "greaterThanOrEqual", PIXELATE_AT[i])}</StateTransition>')
        if i > 0:
            out.append(f'<StateTransition stateToId="{R[f"p{i - 1}"]}">'
                       f'{number_is("pPixelate", "lessThan", PIXELATE_AT[i - 1])}</StateTransition>')
        resolve.append(
            f'<AnimationState x="{160 + 160 * i}" y="200" animationId="{aid[f"Pixel {i}"]}" '
            f'id="{R[f"p{i}"]}">' + "".join(out) + "</AnimationState>"
        )

    # Glitch: wait 8-17s, then (with motion allowed) one weighted variant.
    G = {k: ids() for k in ["pick"] + [f"w{w}" for w in glitch_waits] + [v[0] for v in glitch_variants]}
    glitch = [
        f'<EntryState x="0" y="0"><StateTransition stateToId="{G["pick"]}"/></EntryState>',
        f'<AnimationState x="160" y="0" random="true" animationId="{aid["Glitch Pick"]}" '
        f'id="{G["pick"]}">' + "".join(after_end(G[f"w{w}"]) for w in glitch_waits) + "</AnimationState>",
    ]
    for i, w in enumerate(glitch_waits):
        glitch.append(
            f'<AnimationState x="{160 * i}" y="200" random="true" '
            f'animationId="{aid[f"Glitch Wait {w / 60:.0f}s"]}" id="{G[f"w{w}"]}">'
            + "".join(after_end(G[name], weight, bool_is("pMotion", "true"))
                      for name, _d, _k, weight in glitch_variants)
            + "</AnimationState>"
        )
    for i, (name, *_rest) in enumerate(glitch_variants):
        glitch.append(
            f'<AnimationState x="{160 * i}" y="400" animationId="{aid[name]}" id="{G[name]}">'
            + after_end(G["pick"]) + "</AnimationState>"
        )

    def sm_layer(name, items):
        any_exit = '<AnyState x="0" y="-160"/><ExitState x="160" y="-160"/>'
        return (f'            <StateMachineLayer name="{name}" id="{ids()}">\n'
                f"                {any_exit}\n"
                + "\n".join("                " + s for s in items)
                + "\n            </StateMachineLayer>")

    sm = (f'        <StateMachine name="Avatar" id="{I["sm"]}">\n'
          + sm_layer("Gaze", gaze) + "\n"
          + sm_layer("Blink", blink) + "\n"
          + sm_layer("Breathe", breathe) + "\n"
          + sm_layer("Resolve", resolve) + "\n"
          + sm_layer("Glitch", glitch) + "\n"
          + "        </StateMachine>")

    # ----------------------------------------------------------- converters
    converters = f"""
    <DataConverterInterpolator interpolationType="linear" duration="0.12" name="Ease Eyes" id="{I['cEaseFast']}"/>
    <DataConverterInterpolator interpolationType="linear" duration="0.35" name="Ease Head" id="{I['cEaseSlow']}"/>
    <DataConverterRangeMapper minInput="-1" maxInput="1" minOutput="-2" maxOutput="2" clampLower="true" clampUpper="true" name="Pupil X Range" id="{I['cMapPupilX']}"/>
    <DataConverterRangeMapper minInput="-1" maxInput="1" minOutput="-1" maxOutput="1" clampLower="true" clampUpper="true" name="Head Range" id="{I['cMapUnit']}"/>
    <DataConverterRounder decimals="0" name="Whole Pixels" id="{I['cRound']}"/>
"""
    for g, a, b in [("gPupilX", "cEaseFast", "cMapPupilX"),
                    ("gHeadX", "cEaseSlow", "cMapUnit"), ("gHeadY", "cEaseSlow", "cMapUnit")]:
        label = {"gPupilX": "Pupil X", "gHeadX": "Head X", "gHeadY": "Head Y"}[g]
        converters += (f'    <DataConverterGroup name="{label}" id="{I[g]}">\n'
                       f'        <DataConverterGroupItem converterId="{I[a]}"/>\n'
                       f'        <DataConverterGroupItem converterId="{I[b]}"/>\n'
                       f'        <DataConverterGroupItem converterId="{I["cRound"]}"/>\n'
                       f"    </DataConverterGroup>\n")

    viewmodel = f"""
    <ViewModel defaultInstanceId="{I['vmi']}" name="Avatar" id="{I['vm']}">
        <ViewModelPropertyNumber name="lookX" id="{I['pLookX']}"/>
        <ViewModelPropertyNumber name="lookY" id="{I['pLookY']}"/>
        <ViewModelPropertyBoolean name="autoLook" id="{I['pAuto']}"/>
        <ViewModelPropertyNumber name="pixelate" id="{I['pPixelate']}"/>
        <ViewModelPropertyBoolean name="motion" id="{I['pMotion']}"/>
        <ViewModelPropertyBoolean name="revealed" id="{I['pRevealed']}"/>
        <ViewModelInstance exports="true" name="Default" id="{I['vmi']}">
            <ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{I['pLookX']}"/>
            <ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{I['pLookY']}"/>
            <ViewModelInstanceBoolean propertyValue="true" viewModelPropertyId="{I['pAuto']}"/>
            <ViewModelInstanceNumber propertyValue="0" viewModelPropertyId="{I['pPixelate']}"/>
            <ViewModelInstanceBoolean propertyValue="true" viewModelPropertyId="{I['pMotion']}"/>
            <ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="{I['pRevealed']}"/>
        </ViewModelInstance>
    </ViewModel>
"""

    rml = f"""<!-- Generated by tools/generate_scene.py from ../avatar.png. Edit the generator, not this file. -->
<Rive version="1" kind="fragment">
    <Artboard clip="true" viewModelId="{I['vm']}" viewModelInstanceId="{I['vmi']}" defaultStateMachineId="{I['sm']}" styleId="{I['style']}" width="{N}" height="{N}" name="Avatar" id="{I['artboard']}">
        <LayoutComponentStyle name="Artboard Style" id="{I['style']}"/>
{sm}
{scene}
{chr(10).join(anims)}
    </Artboard>
{viewmodel}{converters}</Rive>
"""
    OUT.write_text(rml)

    print(f"wrote {OUT.relative_to(PROJECT.parent.parent.parent)}")
    for k, (n, r) in stats.items():
        print(f"  {k:<14} {n:5d} px  -> {r:4d} runs")
    total = sum(r for _, r in stats.values())
    print(f"  total runs: {total}")


if __name__ == "__main__":
    build()
