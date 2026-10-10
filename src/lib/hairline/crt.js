/**
 * CRT, for the site (the standalone figure is hairline/crt.js; keep the two in step).
 *
 * CRT: an old terminal monitor, the hero's ASCII screen as an object, taken
 * apart along its depth like a full stack: the tube at the back, the chassis
 * on its swivel foot, the bezel, and the glass with its phosphor dots. The
 * gap between the layers is one spring; the pointer picks the layer under it,
 * tested against the pose the spring is heading to, and that layer takes the
 * bright edge while the read-out names it. At rest the monitor is barely open
 * and the cursor on the glass is the one bright mark.
 *
 * `set(gap)` moves the gap's target; `pick(i)` chooses a layer from outside
 * (the portal's scroll), which the pointer overrides while it is over one.
 */
import HL from "./kernel.js";

const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, put, rings, rrect, run,
  spring, stepS, tween, tset, tval, tdone, mk, place, pointer, register, disposer, solid,
} = HL;

// World: x across the screen, y toward the viewer, z up. The layers part along y.
const X0 = 0, X1 = 96, Z0 = 14, Z1 = 86, LIFT = 7;
/** The widest gap between the layers, in world units. */
export const GMAX = 24;
const SX0 = 11, SX1 = 85, SZ0 = 28, SZ1 = 78, NX = 16, NZ = 11;
const DX = (SX1 - SX0) / NX, DZ = (SZ1 - SZ0) / NZ;
/** The layers, back to front, as the read-out names them. */
export const NAMES = ["infra", "data", "backend", "frontend"];

// The burn-in: earlier output as runs of dots [row from top, first, last], the prompt, and the cursor.
const BURN = [[0, 0, 6], [1, 0, 10], [2, 0, 4], [4, 0, 8], [5, 0, 12], [6, 0, 3], [8, 0, 0]];
const CURSOR = [8, 2];

// A rounded rectangle standing in the plane y, its u along x and its v along z.
const face = (x0, z0, x1, z1, r, y) => rrect(x0, z0, x1, z1, r, 5).map((s) => ({ ...s, y }));
const slab = (x0, z0, x1, z1, r, y0, y1, k) => ({
  k, back: face(x0, z0, x1, z1, r, y0), front: face(x0, z0, x1, z1, r, y1),
  inner: face(x0 + 1.6, z0 + 1.6, x1 - 1.6, z1 - 1.6, r - 1.6, y1),
});
// Each layer moves k gaps along y: the tube back, the chassis stays, the bezel and the glass forward.
const TUBE = { ...slab(X0 + 5, Z0 + 5, X1 - 5, Z1 - 5, 8, 50, 50, -1), back: face(22, Z0 + 12, 74, Z1 - 8, 12, 6) };
const LAYERS = [
  TUBE,
  slab(X0, Z0, X1, Z1, 9, 52, 72, 0),
  slab(X0, Z0, X1, Z1, 9, 72.5, 78, 1),
  slab(SX0 - 3, SZ0 - 3, SX1 + 3, SZ1 + 3, 8, 78.5, 80.5, 2),
];

/** Whether a screen point is inside a convex polygon of screen points. */
function inside(p, pts) {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const s = Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
    if (s && sign && s !== sign) return false;
    if (s) sign = s;
  }
  return true;
}

export function mountCrt({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.85);
  fit(C, [[X0, 6 - GMAX, Z1 + LIFT], [X1, 6 - GMAX, Z0], [X0, 80.5 + 2 * GMAX, Z1 + LIFT], [X1, 80.5 + 2 * GMAX, Z0], [X1, 72, 0], [X0, 26, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const gap = spring(value, { eps: 0.02 });
  // The chosen layer rises out of the stack: a discrete choice, so a tween per layer.
  const lifts = LAYERS.map(() => tween(0));
  let hover = null, scrolled = null, drawn = "";

  const at = (ring, dy, dz = 0) => ring.map((s) => P(s.u, s.y + dy, s.v + dz));
  const silOf = (L, gp, dz) => hull(at(L.back, L.k * gp, dz).concat(at(L.front, L.k * gp, dz)));

  // Back to front: the tube, the foot and neck under the chassis, the chassis, the bezel, the glass.
  const g = mk("g", {}, svg);
  const els = [solid(g)];
  const [fr, fi] = rings(20, 26, 76, 72, 14, 2), [nr, ni] = rings(36, 40, 60, 62, 6, 1.4);
  put(solid(g), prism(P, front, fr, fi, 0, 4));
  put(solid(g), prism(P, front, nr, ni, 4, Z0 + 2));
  els.push(solid(g), solid(g), solid(g));
  // The bezel's opening and power knob ride the bezel; the dots ride the glass.
  const opening = mk("path", { class: "lo nf" }, els[2].g), knob = mk("path", { class: "lo nf" }, els[2].g);
  const burn = new Set(BURN.flatMap(([r, a, b]) => Array.from({ length: b - a + 1 }, (_, i) => r + "," + (a + i))));
  const dots = [];
  for (let r = 0; r < NZ; r++) for (let c = 0; c < NX; c++) {
    const lvl = r === CURSOR[0] && c === CURSOR[1] ? 2 : burn.has(r + "," + c) ? 1 : 0;
    const el = mk("ellipse", { rx: 1.05, ry: 1.05, class: ["dot off", "dot m", "dot"][lvl] }, els[3].g);
    dots.push({ x: SX0 + (c + 0.5) * DX, z: SZ1 - (r + 0.5) * DZ, el, cursor: lvl === 2 });
  }

  function draw(gp, dz) {
    LAYERS.forEach((L, i) => {
      els[i].sil.setAttribute("d", poly(silOf(L, gp, dz[i])));
      els[i].cr.setAttribute("d", open(at(run(L.inner, (s) => s.nu + s.nv > 0.05), L.k * gp, dz[i])));
    });
    opening.setAttribute("d", poly(at(face(SX0 - 3, SZ0 - 3, SX1 + 3, SZ1 + 3, 8, 78), gp, dz[2])));
    knob.setAttribute("d", poly(at(face(X1 - 16, Z0 + 5, X1 - 9, Z0 + 9, 2, 78), gp, dz[2])));
    for (const d of dots) place(d.el, P(d.x, 81 + 2 * gp, d.z + dz[3]));
  }

  // One bright place: the chosen layer's edge, or at rest the cursor.
  function light() {
    const on = hover ?? scrolled;
    els.forEach((el, i) => el.sil.classList.toggle("hi", i === on));
    for (const d of dots) if (d.cursor) d.el.setAttribute("class", on == null ? "dot" : "dot m");
    read.textContent = on == null ? "rest" : `0${on + 1} ${NAMES[on]}`;
    const now = performance.now();
    lifts.forEach((tw, i) => tset(tw, i === on ? LIFT : 0, now, 0));
    B.wake();
  }

  const B = register(stage, (dt, now) => {
    const moving = stepS(gap, dt), dz = lifts.map((tw) => tval(tw, now));
    // Skip the paths on frames where nothing they are drawn from changed.
    const key = gap.x + "," + dz.join(",");
    if (key !== drawn) { drawn = key; draw(gap.x, dz); }
    return moving || lifts.some((tw) => !tdone(tw, now));
  });
  bag.add(B.unregister);

  // The layer under the pointer, front first, from the poses the spring is heading to.
  function move(p) {
    let pick = null;
    for (let i = LAYERS.length - 1; i >= 0 && pick == null; i--) if (inside(p, silOf(LAYERS[i], gap.t, lifts[i].to))) pick = i;
    if (pick !== hover) { hover = pick; light(); }
  }
  function leave() { if (hover != null) { hover = null; light(); } }
  bag.add(pointer(stage, { move, leave }));
  bag.add(() => svg.replaceChildren());
  light();

  return {
    set: (v) => { gap.t = clamp(v, 0, GMAX); B.wake(); },
    pick: (i) => { if (i !== scrolled) { scrolled = i; light(); } },
    /** The viewBox point at the middle of the closed monitor, for a camera outside the figure. */
    center: P((X0 + X1) / 2, 46, (Z0 + Z1) / 2),
    destroy: bag.dispose,
  };
}
