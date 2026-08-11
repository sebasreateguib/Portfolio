"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface LEDDisplayProps {
  text?: string;
  speed?: number;
  dotColor?: string;
  dotSize?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  showBorder?: boolean;
  borderColor?: string;
  fade?: boolean;
  /** Columns of dots to show. Omit to fill the parent width. */
  visibleWidth?: number;
  className?: string;
}

// --- FONT MAP (Uppercase + digits + symbols)
const char: Record<string, string> = {
  A:
    "....###..." +
    "...##.##.." +
    "..##...##." +
    ".##.....##" +
    ".#########" +
    ".##.....##" +
    ".##.....##",
  B:
    ".########." +
    ".##.....##" +
    ".##.....##" +
    ".########." +
    ".##.....##" +
    ".##.....##" +
    ".########.",
  C:
    "..######.." +
    ".##....##." +
    ".##......." +
    ".##......." +
    ".##......." +
    ".##....##." +
    "..######..",
  D:
    ".########." +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".########.",
  E:
    ".########" +
    ".##......" +
    ".##......" +
    ".######.." +
    ".##......" +
    ".##......" +
    ".########",
  F:
    ".########" +
    ".##......" +
    ".##......" +
    ".######.." +
    ".##......" +
    ".##......" +
    ".##......",
  G:
    "..######.." +
    ".##....##." +
    ".##......." +
    ".##...####" +
    ".##....##." +
    ".##....##." +
    "..######..",
  H:
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".#########" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##",
  I: ".####" + "..##." + "..##." + "..##." + "..##." + "..##." + ".####",
  J:
    ".......##" +
    ".......##" +
    ".......##" +
    ".......##" +
    ".##....##" +
    ".##....##" +
    "..######.",
  K:
    ".##....##" +
    ".##...##." +
    ".##..##.." +
    ".#####..." +
    ".##..##.." +
    ".##...##." +
    ".##....##",
  L:
    ".##......" +
    ".##......" +
    ".##......" +
    ".##......" +
    ".##......" +
    ".##......" +
    ".########",
  M:
    ".##.....##" +
    ".###...###" +
    ".####.####" +
    ".##.###.##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##",
  N:
    ".##....##" +
    ".###...##" +
    ".####..##" +
    ".##.##.##" +
    ".##..####" +
    ".##...###" +
    ".##....##",
  O:
    "..#######." +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    "..#######.",
  P:
    ".########." +
    ".##.....##" +
    ".##.....##" +
    ".########." +
    ".##......." +
    ".##......." +
    ".##.......",
  Q:
    "..#######." +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##..##.##" +
    ".##....##." +
    "..#####.##",
  R:
    ".########." +
    ".##.....##" +
    ".##.....##" +
    ".########." +
    ".##...##.." +
    ".##....##." +
    ".##.....##",
  S:
    "..######." +
    ".##....##" +
    ".##......" +
    "..######." +
    ".......##" +
    ".##....##" +
    "..######.",
  T:
    ".########" +
    "....##..." +
    "....##..." +
    "....##..." +
    "....##..." +
    "....##..." +
    "....##...",
  U:
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    "..#######.",
  V:
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    ".##.....##" +
    "..##...##." +
    "...##.##.." +
    "....###...",
  W:
    ".##......##" +
    ".##..##..##" +
    ".##..##..##" +
    ".##..##..##" +
    ".##..##..##" +
    ".##..##..##" +
    "..###..###.",
  X:
    ".##.....##" +
    "..##...##." +
    "...##.##.." +
    "....###..." +
    "...##.##.." +
    "..##...##." +
    ".##.....##",
  Y:
    ".##....##" +
    "..##..##." +
    "...####.." +
    "....##..." +
    "....##..." +
    "....##..." +
    "....##...",
  Z:
    ".########" +
    "......##." +
    ".....##.." +
    "....##..." +
    "...##...." +
    "..##....." +
    ".########",
  "0":
    "..#####.." +
    ".##...##." +
    ".##...##." +
    ".##...##." +
    ".##...##." +
    ".##...##." +
    "..#####..",
  "1":
    "...##...." +
    "..###...." +
    ".####...." +
    "...##...." +
    "...##...." +
    "...##...." +
    ".######..",
  "2":
    "..#####.." +
    ".##...##." +
    "......##." +
    "....###.." +
    "..###...." +
    ".##......" +
    ".########",
  "3":
    "..#####.." +
    ".##...##." +
    "......##." +
    "...####.." +
    "......##." +
    ".##...##." +
    "..#####..",
  "4":
    "....###.." +
    "...####.." +
    "..##.##.." +
    ".##..##.." +
    ".########" +
    ".....##.." +
    ".....##..",
  "5":
    ".########" +
    ".##......" +
    ".##......" +
    ".#######." +
    "......##." +
    ".##...##." +
    "..#####..",
  "6":
    "..#####.." +
    ".##...##." +
    ".##......" +
    ".#######." +
    ".##...##." +
    ".##...##." +
    "..#####..",
  "7":
    ".########" +
    "......##." +
    ".....##.." +
    "....##..." +
    "...##...." +
    "...##...." +
    "...##....",
  "8":
    "..#####.." +
    ".##...##." +
    ".##...##." +
    "..#####.." +
    ".##...##." +
    ".##...##." +
    "..#####..",
  "9":
    "..#####.." +
    ".##...##." +
    ".##...##." +
    "..######." +
    "......##." +
    ".##...##." +
    "..#####..",
  "!": ".####" + ".####" + ".####" + "..##." + "....." + ".####" + ".####",
  "?":
    "..#####.." +
    ".##...##." +
    "......##." +
    "....###.." +
    "....##..." +
    "........." +
    "....##...",
  "/":
    "......##." +
    ".....##.." +
    ".....##.." +
    "....##..." +
    "...##...." +
    "..##....." +
    "..##.....",
  "-": "......." + "......." + "......." + ".#####." + "......." + "......." + ".......",
  "+": "....." + "..#.." + "..#.." + "#####" + "..#.." + "..#.." + ".....",
  ".": "....." + "....." + "....." + "....." + "....." + ".##.." + ".##..",
  ",": "....." + "....." + "....." + "....." + ".##.." + ".##.." + "##...",
  ":": "....." + ".##.." + ".##.." + "....." + ".##.." + ".##.." + ".....",
  "'": ".##.." + ".##.." + ".#..." + "....." + "....." + "....." + ".....",
};

const cw: Record<string, number> = {
  A: 10,
  B: 10,
  C: 10,
  D: 10,
  E: 9,
  F: 9,
  G: 10,
  H: 10,
  I: 5,
  J: 9,
  K: 9,
  L: 9,
  M: 10,
  N: 9,
  O: 10,
  P: 10,
  Q: 10,
  R: 10,
  S: 9,
  T: 9,
  U: 10,
  V: 10,
  W: 11,
  X: 10,
  Y: 9,
  Z: 9,
  "0": 9,
  "1": 9,
  "2": 9,
  "3": 9,
  "4": 9,
  "5": 9,
  "6": 9,
  "7": 9,
  "8": 9,
  "9": 9,
  "!": 5,
  "?": 9,
  "/": 9,
  "-": 7,
  "+": 5,
  ".": 5,
  ",": 5,
  ":": 5,
  "'": 5,
};

// Uppercase and drop diacritics ("á" -> "A"), so accented copy still lights up.
const normalizeChar = (c: string) =>
  c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const ROWS = 7;

// roundRect is recent-ish; a square dot is a fine fallback
const dotPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) => {
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, size, size, 2);
  else ctx.rect(x, y, size, size);
};

export const LEDDisplay = ({
  text = "Hello World",
  speed = 150,
  dotColor = "#0000ff",
  dotSize = 10,
  direction = "left",
  pauseOnHover = false,
  showBorder = false,
  borderColor = "#0000ff",
  fade = false,
  visibleWidth,
  className = "",
}: LEDDisplayProps) => {
  const [scroll, setScroll] = useState<boolean[][]>([]);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoCols, setAutoCols] = useState(40);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unlitRef = useRef<HTMLCanvasElement | null>(null);
  const offsetRef = useRef(0);

  const cols = visibleWidth ?? autoCols;
  const pitch = dotSize + 1; // dot + the 1px gap between dots
  const width = cols * pitch - 1;
  const height = ROWS * pitch - 1;
  const l = scroll[0]?.length ?? 0;

  // --- Fill the parent width when no explicit column count is given
  useEffect(() => {
    if (visibleWidth) return;
    const el = wrapRef.current;
    if (!el) return;

    const measure = (w: number) =>
      setAutoCols(Math.max(10, Math.floor((w + 1) / pitch)));

    measure(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(el);

    return () => observer.disconnect();
  }, [visibleWidth, pitch]);

  // --- Only run while on screen, so an off-screen board costs nothing
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px 0px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // --- Build the dot matrix for the text
  useEffect(() => {
    const txt = text;
    const spc = 5;
    // Lead with a full board of blanks so the loop reads as one clean pass
    const newScroll: boolean[][] = Array(ROWS)
      .fill(null)
      .map(() => Array(Math.max(cols, 30)).fill(false));

    for (let i = 0; i < txt.length; i++) {
      const t = normalizeChar(txt.charAt(i));
      if (t === " ") {
        for (let v = 0; v < spc; v++)
          for (let j = 0; j < ROWS; j++) newScroll[j].push(false);
        continue;
      }
      const w = cw[t] || 9;
      const charData = char[t] || "";
      for (let j = 0; j < ROWS; j++) {
        for (let v = 0; v < w; v++) {
          newScroll[j].push(charData.charAt(j * w + v) === "#");
        }
      }
      for (let j = 0; j < ROWS; j++) newScroll[j].push(false);
    }

    offsetRef.current = 0;
    setScroll(newScroll);
  }, [text, cols]);

  // --- The unlit grid never moves, so it is baked once and blitted per frame
  useEffect(() => {
    if (width <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const layer = document.createElement("canvas");
    layer.width = Math.round(width * dpr);
    layer.height = Math.round(height * dpr);

    const ctx = layer.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = `${dotColor}30`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        dotPath(ctx, x * pitch + 0.5, y * pitch + 0.5, dotSize - 1);
      }
    }
    ctx.stroke();

    unlitRef.current = layer;
  }, [cols, pitch, dotSize, dotColor, width, height]);

  // --- One canvas, one path per frame: no layout, no style recalc, no reflow
  const draw = useCallback(
    (offset: number) => {
      const canvas = canvasRef.current;
      if (!canvas || width <= 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(width * dpr);
      const h = Math.round(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (unlitRef.current) ctx.drawImage(unlitRef.current, 0, 0, width, height);
      if (l === 0) return;

      const whole = Math.floor(offset);
      const frac = offset - whole;
      const shift = direction === "left" ? -frac * pitch : (frac - 1) * pitch;

      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let y = 0; y < ROWS; y++) {
        const row = scroll[y];
        if (!row) continue;
        for (let x = 0; x <= cols; x++) {
          const index =
            direction === "left" ? (whole + x) % l : (((whole - x) % l) + l) % l;
          if (!row[index]) continue;
          dotPath(ctx, x * pitch + shift, y * pitch, dotSize);
        }
      }
      ctx.fill();
    },
    [scroll, l, cols, pitch, dotSize, dotColor, direction, width, height],
  );

  // Repaint whenever the board itself changes (new text, resize, colors)
  useEffect(() => {
    draw(offsetRef.current);
  }, [draw]);

  // --- Animate: sub-pixel offset every frame, so it slides instead of strobing
  useEffect(() => {
    if (l === 0 || paused || !inView || reducedMotion) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      offsetRef.current = (offsetRef.current + (now - last) / speed) % l;
      last = now;
      draw(offsetRef.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [l, speed, paused, inView, reducedMotion, draw]);

  const edgeFade =
    "linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)";

  return (
    <div
      className={`p-2 ${className}`}
      style={{ border: showBorder ? `2px solid ${borderColor}` : "none" }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        ref={wrapRef}
        className="flex w-full justify-center overflow-hidden"
        style={{
          maskImage: fade ? edgeFade : undefined,
          WebkitMaskImage: fade ? edgeFade : undefined,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px`, display: "block" }}
        />
      </div>
    </div>
  );
};

export default LEDDisplay;
