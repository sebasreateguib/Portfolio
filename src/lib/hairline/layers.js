/**
 * Layers: the stack I build as a small system on a plinth, four pieces on four
 * tiles tied in a loop by cables on the floor. At the back a database (three
 * disks), on the right a server rack (its units and their lights), on the
 * left a small neural network standing over a chip (its die, its pins), and at the
 * front a monitor on its stand, a window and a pointer on its screen. Its
 * screen is the one bright mark at rest. It grew out of the Exploded figure of
 * @lucasmarkes/hairline (MIT, © 2026 Lucas Marques), on the same kernel.
 *
 * The pointer picks a tile, read on the tiles' resting tops: its piece rises
 * with it on a spring, takes the bright edge and lights its two cables, and the
 * two pieces it is tied to rise after it, less. The read-out names the piece.
 * `value` is the rise, in viewBox units.
 */
import HL from "./kernel.js";

const {
  Cam, clamp, facing, fit, mk, place, poly, prism, proj, put, rrect, seg, solid, unproj,
  disposer, pointer, reducedMotion, register, spring, stepS,
} = HL;

const E = 62, D = 30, TS = 20, T = 3, REACH = 0.3, STEP = 70;
const UP = { k: 70, c: 14 }, DOWN = { k: 40, c: 12.4 };
/** The tiles, bottom of the stack first: where each stands on the plinth. */
const CELLS = [[-D, -D], [D, -D], [-D, D], [D, D]];
/** The cables, round the loop: data to backend to interface to AI and back. */
const TIES = [[0, 1], [1, 3], [3, 2], [2, 0]];

/** A rounded footprint and its crease ring; a round one, with more steps, when r is half its side. */
const ring2 = (x0, y0, x1, y1, r, b) => [rrect(x0, y0, x1, y1, r, r > 6 ? 14 : 4), rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b), r > 6 ? 14 : 4)];

/**
 * Each piece makes its elements once and redraws them at a height z. Elements are made back to front, so making
 * them in this order is painting them in it.
 */
const PIECES = [
  // the database: three disks with a seam between each
  (g, P, front, cx, cy) => {
    const disks = [0, 1, 2].map(() => solid(g)), [r, i] = ring2(cx - 11, cy - 11, cx + 11, cy + 11, 11, 1.2);
    return {
      parts: disks,
      draw: (z) => disks.forEach((s, k) => put(s, prism(P, front, r, i, z + k * 7.5, z + k * 7.5 + 6))),
    };
  },
  // the server rack: a tall cabinet, its units on the front, a light to each
  (g, P, front, cx, cy) => {
    const body = solid(g), units = mk("path", { class: "nf lo" }, body.g), [r, i] = ring2(cx - 9, cy - 9, cx + 9, cy + 9, 2, 1);
    const leds = [0, 1, 2, 3, 4].map(() => mk("circle", { r: 0.9, class: "dot m" }, body.g));
    return {
      parts: [body],
      draw: (z) => {
        put(body, prism(P, front, r, i, z, z + 34));
        units.setAttribute("d", [6, 12, 18, 24, 30].map((v) => seg(P(cx - 4, cy + 9, z + v), P(cx + 6.5, cy + 9, z + v))).join(""));
        leds.forEach((l, k) => place(l, P(cx - 6.5, cy + 9, z + 3 + k * 6)));
      },
    };
  },
  // AI: a chip with pins on every side as its pedestal, and above it a small neural network, standing square to the
  // viewer: three layers of nodes, every node tied to each in the next; each node a thin disc, its back a step behind
  // its face, and the ties drawn first so the nodes cover their ends
  (g, P, front, cx, cy) => {
    const pins = mk("path", { class: "nf" }, g), pkg = solid(g), die = solid(g), ties = mk("path", { class: "nf" }, g);
    const [pr, pi] = ring2(cx - 13, cy - 13, cx + 13, cy + 13, 2, 1), [dr, di] = ring2(cx - 7.5, cy - 7.5, cx + 7.5, cy + 7.5, 1.5, 0.8);
    const layers = [[-11, [22, 34]], [0, [16, 28, 40]], [11, [22, 34]]].map(([u, vs]) => vs.map((v) => ({ u, v })));
    const nodes = layers.flat().map((n) => ({ ...n, back: mk("path", { class: "lo" }, g), face: mk("path", { class: "sil" }, g) }));
    // a node's outline in its own plane
    const disc = Array.from({ length: 16 }, (_, i) => [2.4 * Math.cos((i / 16) * 2 * Math.PI), 2.4 * Math.sin((i / 16) * 2 * Math.PI)]);
    // the plane square to the camera: u runs across the screen, v up; a plate's back sits a step away from the viewer
    const H = Math.SQRT1_2, on = (u, v, z, back) => P(cx + u * H - back * H, cy - u * H - back * H, z + v);
    return {
      parts: [pkg, die, ...nodes.map((n) => ({ sil: n.face }))],
      draw: (z) => {
        let d = "";
        for (let k = -8; k <= 8; k += 4) {
          d += seg(P(cx + 13, cy + k, z + 1.5), P(cx + 16, cy + k, z + 1.5)) + seg(P(cx + k, cy + 13, z + 1.5), P(cx + k, cy + 16, z + 1.5));
          d += seg(P(cx - 13, cy + k, z + 1.5), P(cx - 16, cy + k, z + 1.5)) + seg(P(cx + k, cy - 13, z + 1.5), P(cx + k, cy - 16, z + 1.5));
        }
        pins.setAttribute("d", d);
        put(pkg, prism(P, front, pr, pi, z, z + 3));
        put(die, prism(P, front, dr, di, z + 3, z + 5.5));
        let t = "";
        for (let l = 0; l < layers.length - 1; l++) {
          for (const a of layers[l]) for (const b of layers[l + 1]) t += seg(on(a.u, a.v, z, 0.8), on(b.u, b.v, z, 0.8));
        }
        ties.setAttribute("d", t);
        for (const n of nodes) {
          n.back.setAttribute("d", poly(disc.map(([u, v]) => on(n.u + u, n.v + v, z, 1.6))));
          n.face.setAttribute("d", poly(disc.map(([u, v]) => on(n.u + u, n.v + v, z, 0))));
        }
      },
    };
  },
  // the monitor: a foot, a post, and a thin screen facing front, a window and a pointer on it
  (g, P, front, cx, cy) => {
    const foot = solid(g), post = solid(g), panel = solid(g);
    const screen = mk("path", { class: "nf hi" }, panel.g), marks = mk("path", { class: "nf lo" }, panel.g);
    const [fr, fi] = ring2(cx - 8, cy - 4, cx + 8, cy + 7, 2, 0.8), [or, oi] = ring2(cx - 1.6, cy - 1.6, cx + 1.6, cy + 1.6, 1, 0.5);
    const [sr, si] = ring2(cx - 16, cy - 2.2, cx + 16, cy + 1.2, 1.5, 0.6);
    const face = (u, v, z) => P(cx + u, cy + 1.2, z + v);
    const rect = (u0, v0, u1, v1, z) => poly([face(u0, v0, z), face(u1, v0, z), face(u1, v1, z), face(u0, v1, z)]);
    const arrow = [[3, 15], [3, 9], [4.5, 10.4], [5.6, 8], [6.6, 8.5], [5.5, 10.8], [7.5, 10.8]];
    return {
      parts: [foot, post, panel],
      screen,
      draw: (z) => {
        put(foot, prism(P, front, fr, fi, z, z + 1.5));
        put(post, prism(P, front, or, oi, z + 1.5, z + 9));
        put(panel, prism(P, front, sr, si, z + 8, z + 30));
        screen.setAttribute("d", rect(-14, 10, 14, 28, z));
        marks.setAttribute("d", seg(face(-14, 25.5, z), face(14, 25.5, z)) + seg(face(-11, 21.5, z), face(4, 21.5, z)) + seg(face(-11, 18, z), face(-1, 18, z)) + poly(arrow.map(([u, v]) => face(u, v, z))));
      },
    };
  },
];

/** Mounts the system on `stage`, drawing into `svg`. `names` are what the read-out says for each piece, bottom of the stack first. */
export function mountLayers({ stage, svg, read }, value, { names = ["data", "backend", "ai", "interface"] } = {}) {
  const bag = disposer();
  let lift = value, act = -1;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[-E, -E, -5], [E, E, -5], [E, -E, -5], [-E, E, -5], [D, -D, T + 34 + value], [-D, -D, T + 21 + value * REACH], [-D, D, T + 43 + value]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the plinth, and the cables on it, which run from tile to tile round the loop
  const [br, bi] = ring2(-E, -E, E, E, 8, 2);
  put(solid(g), prism(P, front, br, bi, -5, 0));
  const cables = TIES.map(([a, b]) => {
    const [ax, ay] = CELLS[a], [bx, by] = CELLS[b], dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
    const d = seg(P(ax + dx * (TS + 1), ay + dy * (TS + 1), 0), P(bx - dx * (TS + 1), by - dy * (TS + 1), 0));
    return { a, b, el: mk("path", { d, class: "nf dash" }, g) };
  });

  // the tiles and their pieces, far to near
  const order = CELLS.map((_, i) => i).sort((i, j) => CELLS[i][0] + CELLS[i][1] - (CELLS[j][0] + CELLS[j][1]));
  const tiles = [];
  for (const i of order) {
    const [cx, cy] = CELLS[i], [tr, ti] = ring2(cx - TS, cy - TS, cx + TS, cy + TS, 5, 1.2);
    const slot = mk("path", { class: "nf lo" }, g), tile = solid(g);
    const piece = PIECES[i](g, P, front, cx, cy);
    tiles[i] = { i, cx, cy, tr, ti, slot, tile, piece, sp: spring(0, { ...UP }), tgt: 0, due: 0, pend: false, drawn: NaN };
  }

  function draw(t) {
    const z = Math.max(0, t.sp.x);
    if (z === t.drawn) return;
    t.drawn = z;
    t.slot.setAttribute("d", z > 0.4 ? poly(t.tr.map((q) => P(q.u, q.v, 0))) : "");
    put(t.tile, prism(P, front, t.tr, t.ti, z, z + T));
    t.piece.draw(z + T);
  }
  const B = register(stage, (dt, now) => {
    let moving = false;
    for (const t of tiles) {
      if (t.pend) {
        if (now >= t.due) {
          t.pend = false;
          Object.assign(t.sp, t.tgt > t.sp.t ? UP : DOWN);
          t.sp.t = t.tgt;
        } else moving = true;
      }
      if (stepS(t.sp, dt)) moving = true;
      draw(t);
    }
    return moving;
  });
  bag.add(B.unregister);

  const tied = (a, b) => TIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  function setActive(a) {
    const now = performance.now();
    act = a;
    tiles.forEach((t) => {
      const near = a >= 0 && tied(a, t.i);
      t.tgt = a < 0 ? 0 : t.i === a ? lift : near ? lift * REACH : 0;
      t.due = now + (reducedMotion() || !near ? 0 : STEP);
      t.pend = true;
      t.piece.parts.forEach((s) => s.sil.classList.toggle("hi", t.i === a));
    });
    cables.forEach((c) => c.el.setAttribute("class", a >= 0 && (c.a === a || c.b === a) ? "nf hi" : "nf dash"));
    tiles[3].piece.screen.setAttribute("class", a < 0 || a === 3 ? "nf hi" : "nf");
    read.textContent = a >= 0 ? names[a] : "";
    B.wake();
  }

  /** The tile under the point, read on the tiles' resting tops. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], T);
    return tiles.findIndex((t) => Math.abs(x - t.cx) <= TS + 2 && Math.abs(y - t.cy) <= TS + 2);
  }
  const move = (p) => { const a = hit(p); if (a !== act) setActive(a); };
  bag.add(pointer(stage, { move, leave: () => { if (act !== -1) setActive(-1); } }));
  bag.add(() => svg.replaceChildren());

  return {
    /** Where the unseen pointer stops when the figure plays: each piece round the loop, then a leave. */
    stops: [0, 1, 3, 2].map((i) => P(CELLS[i][0], CELLS[i][1], T).map(Math.round)).concat([null]),
    set: (v) => {
      lift = clamp(v, 0, 40);
      setActive(act);
    },
    destroy: bag.dispose,
  };
}
