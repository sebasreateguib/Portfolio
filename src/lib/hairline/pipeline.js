/**
 * Pipeline: a conveyor belt on a plinth, run under four gantries, and a parcel
 * on it, the project. Each gantry hangs the tool of one stage of delivery: a
 * stylus that sketches, a press with its pins that writes, a scanner bar whose
 * beam crosses the belt, and a gripper that lifts the parcel off the line. The
 * pointer picks a gantry: the parcel rides the belt to it, the rollers turning
 * with it, and the tool comes down onto it; at the last one the parcel is
 * lifted to the gripper, shipped. The slider is how far the tools come down.
 *
 * The pattern: one of many, on tweens. The hit test reads the gantries' rest
 * columns, which only ever move up and down, so a moving tool cannot flip it.
 */
import HL from "./kernel.js";

const {
  Cam, facing, fit, hull, mk, open, place, poly, prism, proj, put, ringAt, rings, rrect, run, seg, solid,
  tdone, tset, tval, tween, disposer, pointer, register,
} = HL;

/** Where each gantry stands along the belt, and how high its tool hangs at rest: uneven, so rest is a composition. */
const X = [-66, -22, 22, 66], REST = [27, 31, 34, 30];
const TOP = 46, BAR = 5, BELT = 4, BOX = 7, BH = 14, PITCH = 9, RUN = 162;
/** The parcel's top, which the stylus and the press come down to and never through. */
const LID = BELT + BH;

/**
 * Mounts the line on `stage`, drawing into `svg`. `names` are what the read-out says for each gantry, first to last;
 * at rest it says nothing. `onPick(i)` hears every change of gantry, -1 for none, whether the pointer or `pick` made it.
 * @param {{ stage: HTMLElement, svg: SVGSVGElement, read: HTMLElement }} els
 * @param {number} value
 * @param {{ names?: string[], onPick?: (i: number) => void }} [opts]
 */
export function mountPipeline({ stage, svg, read }, value, { names = ["design", "code", "test", "deploy"], onPick } = {}) {
  const bag = disposer();
  let drop = value, act = -1;

  // Fitted to the plinth and the gantries' tops, which nothing rises past, so no pose leaves the frame.
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-100, -26, -6], [100, 26, -6], [100, -26, -6], [-100, 26, -6], [-66, -21, TOP + BAR], [66, 21, TOP + BAR], [66, -21, TOP + BAR], [-66, 21, TOP + BAR]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const shape = (s, x0, y0, x1, y1, r, b, z0, z1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const block = (parent, ...a) => shape(solid(parent), ...a);

  // Back to front: the plinth, the far legs, the belt and what lies on it, the parcel, the tools, the near legs, the bars.
  block(g, -100, -26, 100, 26, 8, 2, -6, 0);
  for (const x of X) block(g, x - 2.5, -20.5, x + 2.5, -15.5, 1.2, 0.6, 0, TOP);
  block(g, -92, -11, 92, 11, 11, 1.2, 0, BELT);
  const rollers = mk("path", { class: "nf lo" }, g);
  const beam = mk("path", { class: "nf dash", d: seg(P(X[2], -10, BELT), P(X[2], 10, BELT)) }, g);
  const box = solid(g), tape = mk("path", { class: "nf lo" }, box.g);
  box.sil.classList.add("hi");

  // Each tool, made once and redrawn at the height z of its lowest point. `sils` take the bright edge when it is picked.
  const tools = X.map((x, i) => {
    const tg = mk("g", {}, g);
    const rod = (z) => shape(rodS, x - 1, -1, x + 1, 1, 1, 0.4, z, TOP);
    let rodS, sils, draw;
    if (i === 0) {
      // the stylus: a cone to a fine point, a collar where it meets its rod
      const body = solid(tg), collar = solid(tg);
      const tip = rrect(x - 0.6, -0.6, x + 0.6, 0.6, 0.6, 4), cap = rrect(x - 3.5, -3.5, x + 3.5, 3.5, 3.5, 8), crease = rrect(x - 2.8, -2.8, x + 2.8, 2.8, 2.8, 8);
      sils = [body.sil];
      draw = (z) => {
        put(body, { sil: poly(hull(ringAt(P, tip, z).concat(ringAt(P, cap, z + 12)))), crease: open(ringAt(P, run(crease, front), z + 12)) });
        shape(collar, x - 2.4, -2.4, x + 2.4, 2.4, 2.4, 0.6, z + 12, z + 14.5);
        rod(z + 14.5);
      };
    } else if (i === 1) {
      // the press: a wide head, and on its near face two rows of the pins it sets
      const head = solid(tg), pins = Array.from({ length: 8 }, () => mk("circle", { r: 0.8, class: "dot off" }, head.g));
      sils = [head.sil];
      draw = (z) => {
        shape(head, x - 6, -8, x + 6, 8, 1.6, 0.8, z, z + 6.5);
        pins.forEach((el, k) => place(el, P(x - 4.5 + (k % 4) * 3, 8, z + 2 + Math.floor(k / 4) * 2.6)));
        rod(z + 6.5);
      };
    } else if (i === 2) {
      // the scanner: a slim bar across the belt, its lens a second line beneath
      const bar = solid(tg), lens = mk("path", { class: "nf lo" }, bar.g);
      sils = [bar.sil];
      draw = (z) => {
        shape(bar, x - 2.6, -13, x + 2.6, 13, 1.3, 0.6, z, z + 4);
        lens.setAttribute("d", seg(P(x, -11, z + 0.8), P(x, 11, z + 0.8)));
        rod(z + 4);
      };
    } else {
      // the gripper: a block with two fingers that come down onto the parcel's lid
      const far = solid(tg), near = solid(tg), head = solid(tg);
      sils = [head.sil, far.sil, near.sil];
      draw = (z) => {
        shape(far, x - 4, -8.6, x + 4, -7.4, 0.5, 0.2, z, z + 4);
        shape(near, x - 4, 7.4, x + 4, 8.6, 0.5, 0.2, z, z + 4);
        shape(head, x - 5.5, -9.4, x + 5.5, 9.4, 1.6, 0.8, z + 4, z + 8);
        rod(z + 8);
      };
    }
    rodS = solid(tg);
    return { tg, sils, draw, z: tween(REST[i]), drawn: NaN };
  });
  for (const x of X) block(g, x - 2.5, 15.5, x + 2.5, 20.5, 1.2, 0.6, 0, TOP);
  for (const x of X) block(g, x - 3, -21, x + 3, 21, 1.5, 0.8, TOP, TOP + BAR);

  const bx = tween(0), bz = tween(0);
  let drawnBox = "";
  function drawBox(x, z) {
    const key = x.toFixed(2) + z.toFixed(2);
    if (key === drawnBox) return;
    drawnBox = key;
    shape(box, x - BOX, -BOX, x + BOX, BOX, 2.5, 1, BELT + z, LID + z);
    tape.setAttribute("d", seg(P(x, -BOX + 1, LID + z), P(x, BOX - 1, LID + z)));
    // the belt runs with the parcel, so its rollers slide by as far as it travels
    let d = "";
    for (let k = 0; k < RUN / PITCH; k++) {
      const u = -81 + ((((k * PITCH + x) % RUN) + RUN) % RUN);
      d += seg(P(u, -9.8, BELT), P(u, 9.8, BELT));
    }
    rollers.setAttribute("d", d);
  }

  const B = register(stage, (_dt, now) => {
    let moving = !tdone(bx, now) || !tdone(bz, now);
    drawBox(tval(bx, now), tval(bz, now));
    for (const t of tools) {
      const z = tval(t.z, now);
      if (!tdone(t.z, now)) moving = true;
      if (z !== t.drawn) { t.drawn = z; t.draw(z); }
    }
    return moving;
  });
  bag.add(B.unregister);

  /** Where each tool is sent when gantry a is picked (-1 for none). */
  const target = (i, a) => (i !== a ? REST[i] : i === 2 ? REST[i] - drop / 2 : i === 3 ? LID + drop : Math.max(LID, REST[i] - drop));
  function apply(a) {
    const now = performance.now();
    act = a;
    tset(bx, a < 0 ? 0 : X[a], now, 0);
    // the parcel arrives first, then the tool comes down to it
    tset(bz, a === 3 ? drop : 0, now, a === 3 ? 300 : 0);
    tools.forEach((t, i) => {
      tset(t.z, target(i, a), now, i === a ? 300 : 0);
      t.sils.forEach((s) => s.classList.toggle("hi", i === a));
    });
    box.sil.classList.toggle("hi", a < 0);
    beam.setAttribute("class", a === 2 ? "nf hi" : "nf dash");
    read.textContent = a < 0 ? "" : names[a];
    onPick?.(a);
    B.wake();
  }

  // The gantries' columns on screen: they only move up and down, so their screen x never changes.
  const cols = X.map((x) => P(x, 0, 0)[0]), half = (cols[1] - cols[0]) / 2;
  const ys = X.flatMap((x) => [P(x, -21, TOP + BAR)[1], P(x, 26, -6)[1], P(x, -26, -6)[1]]);
  const y0 = Math.min(...ys) - 4, y1 = Math.max(...ys) + 4;
  function hit([sx, sy]) {
    if (sy < y0 || sy > y1) return -1;
    let best = -1, d = half;
    cols.forEach((c, i) => { if (Math.abs(sx - c) <= d) { d = Math.abs(sx - c); best = i; } });
    return best;
  }

  bag.add(pointer(stage, { move: (p) => { const a = hit(p); if (a !== act) apply(a); }, leave: () => { if (act !== -1) apply(-1); } }));
  bag.add(() => svg.replaceChildren());
  apply(-1);

  return {
    /** Where the unseen pointer stops when the figure plays: each gantry down the line, then a leave. */
    stops: X.map((x) => P(x, 0, 30).map(Math.round)).concat([null]),
    /** Picks gantry `a` (-1 for none) from outside the figure, as the pointer would. */
    pick: (a) => { if (a !== act) apply(a); },
    set: (v) => { drop = v; apply(act); },
    destroy: bag.dispose,
  };
}

