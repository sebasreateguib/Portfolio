"""Writes src/data/thinker-ascii.ts for the hero's ASCII Thinker (ascii-thinker.tsx).

Rodin's Thinker, mirrored so he faces the hero copy, drawn as text filled with
the word BUILD (upper case in the highlights, lower case in the half tones,
empty shadows), looking at a laptop on the floor in front of him. The laptop is
a small flat-shaded 3D model (laptop3d.py) rendered at three-quarters and turned
toward him; its screen lights the front of his body with a pale blue tint and a
soft halo around it.

Source photo: le-penseur-louvre-cc0.jpg, "Paris 1er - Musée du Louvre -
Exposition Michel-Ange Rodin - Corps vivants - Le Penseur (Auguste Rodin) 01" by
Romainbehar, Wikimedia Commons, CC0 (public domain dedication):
https://commons.wikimedia.org/wiki/File:Paris_1er_-_Mus%C3%A9e_du_Louvre_-_Exposition_Michel-Ange_Rodin_-_Corps_vivants_-_Le_Penseur_(Auguste_Rodin)_01.jpg

Output: one string per grid row for the glyphs, the colour class and the alpha
(see the header of the generated file).

Re-run after changing anything here:  python3 src/design/thinker/export_thinker.py
"""
import math
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

import laptop3d

HERE = Path(__file__).resolve().parent
SRC = HERE / "le-penseur-louvre-cc0.jpg"
OUT = HERE.parents[2] / "src" / "data" / "thinker-ascii.ts"

WORD = "BUILD"
CW, CH = 6, 10                       # layout cell, px (the component rescales)
COLOURS = ["#e5e5e5", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#d4d4d4"]
FIGURE_TINT = True                   # screen light tinting the front of his body a pale blue (off: plain white figure)
SCREEN_GLOW = False                  # soft blue halo around the laptop + reflection on the floor (off: only the screen is blue)

# ---------------------------------------------------------------- figure mask
im = ImageOps.mirror(Image.open(SRC).convert("RGB"))   # face left, toward the copy
W0, H0 = im.size
rgb = np.asarray(im, dtype=np.float32)
L = np.asarray(im.convert("L"), dtype=np.float32)


def flood(seed_mask):
    out = np.zeros_like(seed_mask)
    q = deque()
    h, w = seed_mask.shape
    for x in range(w):
        for y in (0, h - 1):
            if seed_mask[y, x] and not out[y, x]:
                out[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if seed_mask[y, x] and not out[y, x]:
                out[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and seed_mask[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True; q.append((ny, nx))
    return out


def largest_blob(m):
    lab = np.zeros(m.shape, np.int32); best = (0, 0); cur = 0
    for sy in range(0, m.shape[0], 8):
        for sx in range(0, m.shape[1], 8):
            if m[sy, sx] and not lab[sy, sx]:
                cur += 1; n = 0; q = deque([(sy, sx)]); lab[sy, sx] = cur
                while q:
                    y, x = q.popleft(); n += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < m.shape[0] and 0 <= nx < m.shape[1] and m[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = cur; q.append((ny, nx))
                if n > best[0]: best = (n, cur)
    return lab == best[1]


background = flood(L > 150)                         # the wall, connected to the border
sat = rgb.max(-1) - rgb.min(-1)
hole = (L > 175) & (sat < 22)                       # wall seen between arm and torso
mask = ~(background | hole)
mask[:, W0 - 70:] = False                           # wall shadow beside the rock (it touches the base)
mask[1340:, :] = False                              # plinth
mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7))) > 127
mask = largest_blob(mask)

# bronze tone: global level mixed with local contrast so muscles read in shadow
vals = L[mask]
lo, hi = np.percentile(vals, [15, 99.5])
tone_g = np.clip((L - lo) / (hi - lo), 0, 1)
Lm = np.where(mask, L, np.float32(vals.mean()))
blur = np.asarray(Image.fromarray(Lm.astype(np.uint8)).filter(ImageFilter.GaussianBlur(28)), dtype=np.float32)
loc = L - blur
tone_l = np.clip(0.5 + 0.5 * loc / np.percentile(np.abs(loc[mask]), 92), 0, 1)
tone = np.clip(0.45 * tone_g + 0.75 * tone_l - 0.12, 0, 1) ** 1.3

# ---------------------------------------------------------------- layout (px)
X0c, Y0c, X1c, Y1c = W0 - 880, 285, W0 - 45, 1345   # crop of the photo
TARGET_H = 735
s = TARGET_H / (Y1c - Y0c)
cols, rows = int((X1c - X0c) * s / CW), int(TARGET_H / CH)
ox, oy = 1572 - cols * CW, 508 - rows * CH / 2       # figure grid origin
floor_y = oy + rows * CH - 2

cells = {}   # (x, y) px -> (glyph, alpha, colour index)


def put(px, py, ch, a, col):
    cells[(round(px), round(py))] = (ch, a, col)


def cell_slices(r, c):
    y0 = Y0c + r * CH / s; y1 = Y0c + (r + 1) * CH / s
    x0 = X0c + c * CW / s; x1 = X0c + (c + 1) * CW / s
    return slice(int(y0), max(int(y0) + 1, int(y1))), slice(int(x0), max(int(x0) + 1, int(x1)))


# ---------------------------------------------------------------- laptop
LP = laptop3d.render(Wpx=640, Hpx=440, ss=3, yaw_deg=86, lid_back_deg=40, zoom=1.15)
lum, emi, rimm, glw, SSl = LP["lum"], LP["emi"], LP["rim"], LP["glow"], LP["ss"]
ys_, xs_ = np.where(lum > 0.01)
bx1, by1 = xs_.max() / SSl, ys_.max() / SSl
LX = round((1118 - bx1 - ox) / CW) * CW + ox          # its right end a little short of his feet
LY = round((floor_y - by1 - oy) / CH) * CH + oy
screen_c = (LX + LP["screen_c"][0], LY + LP["screen_c"][1])
sn = LP["screen_n"]

laptop_cells, floor_glow = {}, {}
for r in range(int(lum.shape[0] / SSl / CH)):
    for c in range(int(lum.shape[1] / SSl / CW)):
        ys = slice(int(r * CH * SSl), int((r + 1) * CH * SSl)); xs = slice(int(c * CW * SSl), int((c + 1) * CW * SSl))
        cell_l = lum[ys, xs]
        cov = float((cell_l > 0.01).mean())
        e = float(emi[ys, xs].mean()); rm = float(rimm[ys, xs].mean()); g = float(glw[ys, xs].mean())
        px, py = LX + c * CW, LY + r * CH
        if e > 0.45:                                    # lit screen, code rows brighter
            v = float(cell_l[emi[ys, xs] > 0.5].mean())
            laptop_cells[(round(px), round(py))] = ("=", 1.0, 3) if v > 0.86 else (":", 0.6, 4)
        elif cov > 0.3:
            v = float(cell_l[cell_l > 0.01].mean())
            if rm > 0.1:                                # edge: glyph follows the stroke
                yy_, xx_ = np.nonzero(rimm[ys, xs] > 0.5)
                if len(xx_) > 3:
                    cv = np.cov(np.vstack([xx_ / CW, yy_ / CH]))
                    ang = (math.degrees(0.5 * math.atan2(2 * cv[0, 1], cv[0, 0] - cv[1, 1])) + 180) % 180
                    ch = "_" if ang < 20 or ang > 160 else "\\" if ang < 70 else "|" if ang < 110 else "/"
                else:
                    ch = "."
                laptop_cells[(round(px), round(py))] = (ch, 0.9, 5)
            else:
                laptop_cells[(round(px), round(py))] = (" .·:-=+*"[max(2, min(7, int(v * 10)))], 0.5 + 0.45 * v, 5)
        elif g > 0.06 and py < floor_y + 24:
            floor_glow[(round(px), round(py))] = ("." if g < 0.3 else ":", 0.12 + 0.55 * g, 4)

# ---------------------------------------------------------------- figure
left_edge, right_edge = {}, {}
for r in range(rows):
    inside = [c for c in range(cols) if mask[cell_slices(r, c)].mean() >= 0.22]
    if inside:
        left_edge[r], right_edge[r] = ox + inside[0] * CW, ox + inside[-1] * CW

for r in range(rows):
    run = 0
    for c in range(cols):
        ys, xs = cell_slices(r, c)
        px, py = ox + c * CW, oy + r * CH
        if (round(px), round(py)) in laptop_cells:
            run = 0; continue
        m = mask[ys, xs].mean()
        if m < 0.22:
            run = 0; continue
        v = float(tone[ys, xs][mask[ys, xs]].mean())
        # screen light: a pale tint over the front of the body, fading toward the back
        dx, dy = px - screen_c[0], py - screen_c[1]
        d = math.hypot(dx, dy) + 1e-6
        facing = max(0.0, (dx * sn[0] + dy * sn[1]) / d)
        width = max(CW * 4, right_edge.get(r, px) - left_edge.get(r, px))
        front = max(0.0, 1 - (px - left_edge.get(r, px)) / (0.7 * width)) ** 0.7
        g = min(1.0, math.exp(-(d / 1150) ** 2) * (0.55 + 0.45 * facing ** 0.5) * front * 0.55)
        g_fill = math.exp(-(d / 620) ** 2) * (0.25 + 0.75 * facing ** 0.6) * max(0.0, min(1.0, ((ox + cols * CW * 0.6) - px) / 140))
        v2 = min(1.0, v + 0.6 * g_fill + 0.12 * g * front)
        if m < 0.7:
            ch, a = ("." if m < 0.45 else ":"), 0.7
            run = 0
        elif v2 > 0.47:
            ch = WORD[run % 5]; run += 1
            a = 0.62 + 0.38 * v2
        elif v2 > 0.31:
            ch = WORD.lower()[run % 5]; run += 1
            a = 0.42
        elif v2 > 0.2:
            ch, a = ".", 0.25; run = 0
        else:
            run = 0; continue
        # only the two palest tints, on the side facing the screen
        col = (2 if g > 0.5 else 1 if g > 0.36 else 0) if FIGURE_TINT else 0
        put(px, py, ch, min(1.0, a + 0.08 * g), col)

figure_keys = set(cells)
solid = set()                                       # silhouette, shadows included
for r in range(rows):
    for c in range(cols):
        if mask[cell_slices(r, c)].mean() >= 0.3:
            solid.add((round(ox + c * CW), round(oy + r * CH)))

# ---------------------------------------------------------------- soft halo
R_HALO = 220
for r in (range(-40, 30) if SCREEN_GLOW else ()):
    for c in range(-30, 80):
        px, py = LX + c * CW, LY + r * CH
        key = (round(px), round(py))
        if key in figure_keys or key in laptop_cells:
            continue
        vx, vy = px - screen_c[0], (py - screen_c[1]) * 1.15
        dist = math.hypot(vx, vy)
        if dist > R_HALO or py > floor_y + 10:
            continue
        lean = 1.0 + 0.35 * max(0.0, (vx * sn[0] + vy * sn[1]) / (dist + 1e-6))
        inten = min(1.0, (1 - dist / R_HALO) ** 1.6 * lean)
        hv = (c * 374761393 + r * 668265263) & 0xFFFFFFFF
        hv = ((hv ^ (hv >> 13)) * 1274126177) & 0xFFFFFFFF
        if ((hv ^ (hv >> 16)) & 0xFFFF) / 65535 > 0.06 + 0.42 * inten:
            continue
        put(px, py, ":" if inten > 0.55 else "·" if inten > 0.25 else ".", 0.07 + 0.28 * inten, 4)
for key, val in (floor_glow.items() if SCREEN_GLOW else ()):
    if key not in figure_keys:
        cells[key] = val
cells.update(laptop_cells)
solid |= {k for k, v in laptop_cells.items() if v[2] in (3, 4, 5)}

# ---------------------------------------------------------------- grid out
xs_all = [k[0] for k in cells]; ys_all = [k[1] for k in cells]
gx0, gy0 = min(xs_all), min(ys_all)
GC = round((max(xs_all) - gx0) / CW) + 1
GR = round((max(ys_all) - gy0) / CH) + 1
glyph = [[" "] * GC for _ in range(GR)]
colour = [[" "] * GC for _ in range(GR)]
alpha = [[" "] * GC for _ in range(GR)]
backing = [["0"] * GC for _ in range(GR)]
for (x, y) in solid:
    c, r = round((x - gx0) / CW), round((y - gy0) / CH)
    if 0 <= r < GR and 0 <= c < GC:
        backing[r][c] = "1"
for (x, y), (ch, a, col) in cells.items():
    c, r = round((x - gx0) / CW), round((y - gy0) / CH)
    glyph[r][c] = ch
    colour[r][c] = str(col)
    alpha[r][c] = str(max(0, min(9, round(a * 10) - 1)))


def js_str(row):
    return '"' + "".join(row).replace("\\", "\\\\").replace('"', '\\"') + '"'


sc_col, sc_row = (screen_c[0] - gx0) / CW, (screen_c[1] - gy0) / CH
floor_row = round((oy + (rows - 1) * CH - gy0) / CH)
ink_col = round((min(x for (x, _y) in list(figure_keys) + list(laptop_cells)) - gx0) / CW)
OUT.write_text(
    "// Generated by src/design/thinker/export_thinker.py from le-penseur-louvre-cc0.jpg\n"
    "// (CC0) and laptop3d.py. Edit the generator, not this file.\n\n"
    f"export const THINKER_COLS = {GC};\n"
    f"export const THINKER_ROWS = {GR};\n"
    f"/** Layout cell size the art was drawn on, px (width : height). */\n"
    f"export const THINKER_CELL = {{ w: {CW}, h: {CH} }};\n"
    f"/** Laptop screen centre, in cells: the light source. */\n"
    f"export const THINKER_SCREEN = {{ col: {sc_col:.2f}, row: {sc_row:.2f} }};\n"
    f"/** Last row of the figure and the laptop: the floor they stand on. */\n"
    f"export const THINKER_FLOOR_ROW = {floor_row};\n"
    f"/** First column with the figure or the laptop; columns left of it are only the faint halo. */\n"
    f"export const THINKER_INK_COL = {ink_col};\n"
    f"export const THINKER_WORD = \"{WORD}\";\n"
    f"/** Colour classes: 0 bronze, 1-3 screen-lit tints (pale to strong), 4 screen blue, 5 laptop body. */\n"
    f"export const THINKER_COLOURS = {COLOURS!r};\n\n".replace("'", '"')
    + "/** Glyph per cell, ' ' = empty. */\nexport const THINKER_GLYPHS: readonly string[] = [\n"
    + ",\n".join("  " + js_str(r) for r in glyph) + ",\n];\n\n"
    + "/** Colour class per cell ('0'-'5'). */\nexport const THINKER_COLOUR_ROWS: readonly string[] = [\n"
    + ",\n".join("  " + js_str(r) for r in colour) + ",\n];\n\n"
    + "/** Alpha per cell: digit d means (d + 1) / 10. */\nexport const THINKER_ALPHA_ROWS: readonly string[] = [\n"
    + ",\n".join("  " + js_str(r) for r in alpha) + ",\n];\n\n"
    + "/** '1' where the figure or the laptop body is, shadows included: the page paints\n * these cells black so the background dot grid doesn't show through. */\n"
    + "export const THINKER_BACKING_ROWS: readonly string[] = [\n"
    + ",\n".join("  " + js_str(r) for r in backing) + ",\n];\n"
)
print(f"wrote {OUT}: {GC}x{GR} cells, {len(cells)} drawn, screen at ({sc_col:.1f}, {sc_row:.1f})")
