"""Tiny flat-shaded 3D laptop renderer -> brightness / emissive / floor-glow maps.

render(width_px, height_px, ss) returns dict of numpy arrays at (height*ss, width*ss)
plus the screen centre and the screen normal projected to 2D (image px, unscaled).
"""
import math
import numpy as np
from PIL import Image, ImageDraw


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def render(Wpx=250, Hpx=160, ss=4, yaw_deg=48, pitch_deg=22, lid_back_deg=14, glow_rows=None, zoom=1.0):
    W, H = Wpx * ss, Hpx * ss
    lum = Image.new("F", (W, H), 0.0)
    emi = Image.new("L", (W, H), 0)     # 255 where the screen is
    rim = Image.new("L", (W, H), 0)     # edges/highlights
    ld, ed, rd = ImageDraw.Draw(lum), ImageDraw.Draw(emi), ImageDraw.Draw(rim)

    # model (cm): base centred at origin, front edge toward +z
    BW, BD, BH = 31.0, 21.5, 1.5
    LH, LT = 20.0, 0.7
    M = rot_x(math.radians(pitch_deg)) @ rot_y(math.radians(yaw_deg))
    cam_dist, f = 95.0, 62.0 * ss * zoom

    def proj(p):
        q = M @ np.asarray(p, dtype=float)
        z = cam_dist - q[2]
        return (W * 0.47 + f * q[0] / z * 10, H * 0.66 - f * q[1] / z * 10), z

    def quad(pts, fill, target=ld, outline=None):
        P = [proj(p)[0] for p in pts]
        target.polygon(P, fill=fill)
        if outline is not None:
            rd.line(P + [P[0]], fill=outline, width=max(2, 2 * ss))   # thick enough to read as a continuous edge in cells
        return P

    def facing(pts):
        P = [proj(p)[0] for p in pts]
        (x0, y0), (x1, y1), (x2, y2) = P[0], P[1], P[2]
        return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0) < 0

    x0, x1, z0, z1 = -BW / 2, BW / 2, -BD / 2, BD / 2
    # lid frame: hinge at back top edge, leaning back
    hinge_y, hinge_z = BH, z0 + 0.6
    up = np.array([0, math.cos(math.radians(lid_back_deg)), -math.sin(math.radians(lid_back_deg))])
    nrm = np.array([0, math.sin(math.radians(lid_back_deg)), math.cos(math.radians(lid_back_deg))])  # screen normal

    def lid_pt(x, u, t=0.0):  # u along height, t along thickness (behind screen = negative)
        return np.array([x, hinge_y, hinge_z]) + up * u + nrm * t

    # floor glow: ellipse on the ground in front of the screen
    glow = Image.new("F", (W, H), 0.0)
    gd = ImageDraw.Draw(glow)
    for k in range(40, 0, -1):
        rr = k / 40
        pts = []
        for i in range(48):
            a = i / 48 * math.tau
            pts.append((math.cos(a) * 20 * rr, 0, z1 + 4 + math.sin(a) * 10 * rr))
        P = [proj(p)[0] for p in pts]
        gd.polygon(P, fill=float((1 - rr) ** 1.6))

    # --- lid (drawn first: it is behind the base from this camera)
    back = [lid_pt(x0, 0, -LT), lid_pt(x1, 0, -LT), lid_pt(x1, LH, -LT), lid_pt(x0, LH, -LT)]
    front = [lid_pt(x0, 0), lid_pt(x0, LH), lid_pt(x1, LH), lid_pt(x1, 0)]
    left = [lid_pt(x0, 0, -LT), lid_pt(x0, LH, -LT), lid_pt(x0, LH), lid_pt(x0, 0)]
    right = [lid_pt(x1, 0), lid_pt(x1, LH), lid_pt(x1, LH, -LT), lid_pt(x1, 0, -LT)]
    top = [lid_pt(x0, LH), lid_pt(x0, LH, -LT), lid_pt(x1, LH, -LT), lid_pt(x1, LH)]
    screen_visible = (M @ nrm)[2] > 0
    if not screen_visible:
        quad(back, 0.22, outline=150)
    for face, val in ((left, 0.32), (right, 0.32), (top, 0.55)):
        if facing(face):
            quad(face, val, outline=150)
    if screen_visible:
        quad(front, 0.18, outline=200)                       # bezel
        bez = 0.9
        inner = [lid_pt(x0 + bez, bez * 1.4), lid_pt(x0 + bez, LH - bez), lid_pt(x1 - bez, LH - bez), lid_pt(x1 - bez, bez * 1.4)]
        P = quad(inner, 0.75)
        ed.polygon(P, fill=255)
        # code rows on the screen (brighter lines)
        rows = glow_rows or [(0.12, 0.55), (0.2, 0.8), (0.28, 0.42), (0.36, 0.7), (0.44, 0.35), (0.52, 0.62), (0.62, 0.9), (0.72, 0.5)]
        for v, length in rows:
            u = LH - bez - v * (LH - 2.4 * bez)
            xa = x0 + bez + 1.6
            xb = xa + (BW - 2 * bez - 3.2) * length
            line = [lid_pt(xa, u, 0.01), lid_pt(xb, u, 0.01), lid_pt(xb, u - 0.9, 0.01), lid_pt(xa, u - 0.9, 0.01)]
            quad(line, 1.0)

    # --- base
    btop = [(x0, BH, z0), (x1, BH, z0), (x1, BH, z1), (x0, BH, z1)]
    bfront = [(x0, 0, z1), (x0, BH, z1), (x1, BH, z1), (x1, 0, z1)]
    bleft = [(x0, 0, z0), (x0, BH, z0), (x0, BH, z1), (x0, 0, z1)]
    bright = [(x1, 0, z1), (x1, BH, z1), (x1, BH, z0), (x1, 0, z0)]
    for face, val in ((bleft, 0.15), (bright, 0.25), (bfront, 0.3)):
        if facing(face):
            quad(face, val, outline=170)
    quad(btop, 0.32, outline=230)
    # keyboard: light falls off from the screen (back) to the front
    kx0, kx1, kz0, kz1 = x0 + 2.2, x1 - 2.2, z0 + 1.6, z0 + 11.2
    nrows, ncols = 6, 14
    for r in range(nrows):
        for c in range(ncols):
            gx = 0.18
            ax = kx0 + (kx1 - kx0) * c / ncols + gx
            bx = kx0 + (kx1 - kx0) * (c + 1) / ncols - gx
            az = kz0 + (kz1 - kz0) * r / nrows + gx
            bz = kz0 + (kz1 - kz0) * (r + 1) / nrows - gx
            lit = 0.6 - 0.04 * r
            quad([(ax, BH + 0.05, az), (bx, BH + 0.05, az), (bx, BH + 0.05, bz), (ax, BH + 0.05, bz)], lit)
    # trackpad
    quad([(-6.5, BH + 0.03, z0 + 12.6), (6.5, BH + 0.03, z0 + 12.6), (6.5, BH + 0.03, z1 - 1.2), (-6.5, BH + 0.03, z1 - 1.2)], 0.12, outline=200)

    sc = proj(lid_pt(0, LH * 0.5))[0]
    tip = proj(lid_pt(0, LH * 0.5) + nrm * 25)[0]
    n2 = np.array([tip[0] - sc[0], tip[1] - sc[1]]); n2 /= np.linalg.norm(n2) + 1e-9
    return {
        "lum": np.asarray(lum, dtype=np.float32),
        "emi": np.asarray(emi, dtype=np.float32) / 255,
        "rim": np.asarray(rim, dtype=np.float32) / 255,
        "glow": np.asarray(glow, dtype=np.float32),
        "screen_c": (sc[0] / ss, sc[1] / ss),
        "screen_n": (float(n2[0]), float(n2[1])),
        "ss": ss,
    }


if __name__ == "__main__":
    import sys
    r = render()
    img = np.clip(r["lum"] * 255 + r["glow"] * 60, 0, 255).astype(np.uint8)
    Image.fromarray(img).save(sys.argv[1])
    print(r["screen_c"], r["screen_n"])
