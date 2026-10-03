"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

/**
 * One looping line drawing per experience, each acting out the six things
 * built there, in order. Hairlines, ink dots and a small mono caption — every
 * beat is one of the chips listed under the card, and the caption names the
 * one on screen.
 *
 * Each scene is a pure function of its clock `t` (seconds into the loop), so a
 * loop is just a timeline: things draw in, act, and the whole frame fades out
 * before it starts again. The clock only runs while the card is on screen.
 */

type Pt = [number, number];
type Step = [from: number, to: number];
type Scene = { loop: number; still: number; steps: Step[]; Draw: (props: { t: number }) => React.ReactNode };

const W = 1280;
const H = 536;
const INK = "#16253f";
const ACCENT = "#3b81e3";
const TAU = Math.PI * 2;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const inOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const out = (p: number) => 1 - (1 - p) ** 3;
const back = (p: number) => (p <= 0 ? 0 : 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mix = (a: Pt, b: Pt, p: number): Pt => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
const quad = (a: Pt, c: Pt, b: Pt, p: number): Pt => mix(mix(a, c, p), mix(c, b, p), p);
const cubic = (a: Pt, c1: Pt, c2: Pt, b: Pt, p: number): Pt => quad(mix(a, c1, p), mix(c1, c2, p), mix(c2, b, p), p);
const pt = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const fade = (t: number, loop: number) => prog(t, 0, 0.25) * (1 - prog(t, loop - 0.7, loop));
/** Scale a group in place around `at`. */
const scaleAt = (at: Pt, s: number) => `translate(${pt(at)}) scale(${s}) translate(${-at[0]} ${-at[1]})`;

/** Stroke-draw a shape from 0 (nothing) to 1 (whole outline). */
const draw = (p: number) =>
  ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p, visibility: p > 0 ? "visible" : "hidden" }) as const;

const line = { fill: "none", stroke: INK, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const hair = { ...line, strokeWidth: 2, strokeOpacity: 0.22 } as const;
const mono = { fontFamily: MONO_FONT, letterSpacing: 1 } as const;

function Person({ at, color = INK, s = 1, opacity = 1 }: { at: Pt; color?: string; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${pt(at)}) scale(${s})`} opacity={opacity}>
      <circle cy={-12} r={8} fill={color} />
      <path d="M-13 16Q0 -4 13 16" {...line} stroke={color} />
    </g>
  );
}

/* ------------------------------------------------------------------------- *
 * Frontend freelance (Sunrise Energy · Yeyo Maki): a sunrise scrubbed frame   *
 * by frame on a canvas, pinned by ScrollTrigger, reflowed onto a phone,       *
 * marked up for search, wired to WhatsApp, and shipped to two live domains.   *
 * ------------------------------------------------------------------------- */

const F_FRAMES = 8;
const F_RAYS = 8;
const F_REVEAL = [220, 300, 160];
const F_JSON: [x: number, text: string][] = [
  [806, '{ "@type":'],
  [826, '"Restaurant",'],
  [826, '"geo": "Lima" }'],
];
const F_JSON_LEN = F_JSON.reduce((n, [, s]) => n + s.length, 0);
const F_QUERY = "sushi lima";
const F_SLOTS = [262, 304, 346];
const F_CTA: Pt = [725, 274];
const F_TO_CHAT: [Pt, Pt, Pt, Pt] = [F_CTA, [820, 440], [1010, 440], [1100, 352]];
const F_SITES = ["sunrisenergyperu.com", "yeyo-maki.vercel.app"];

function Frontend({ t }: { t: number }) {
  const clip = useId().replace(/[^\w-]/g, "");
  const seq = inOut(prog(t, 1.3, 2.5));
  const frame = Math.min(F_FRAMES - 1, Math.floor(seq * F_FRAMES));
  const sunY = lerp(290, 168, seq);
  const thumbY = lerp(56, 330, inOut(prog(t, 2.9, 4.6)));
  const thumbMid = thumbY + 25;
  const pin = t > 2.8 ? clamp((thumbMid - 120) / 20) * clamp((300 - thumbMid) / 20) : 0;
  let typed = Math.floor(prog(t, 6.8, 7.5) * F_JSON_LEN);
  const swap = inOut(prog(t, 8, 8.4));
  const sent = prog(t, 8.5, 9.1);
  const bubble = back(prog(t, 9.05, 9.35));

  return (
    <g opacity={fade(t, 13)}>
      {/* Canvas image sequence: the browser, its canvas, and the film strip it plays from */}
      <rect x={80} y={50} width={390} height={330} rx={14} {...line} {...draw(inOut(prog(t, 0.1, 0.9)))} />
      <line x1={80} y1={86} x2={470} y2={86} {...hair} {...draw(prog(t, 0.6, 1))} />
      {[102, 120, 138].map((x, i) => (
        <circle key={x} cx={x} cy={68} r={5} fill={INK} opacity={0.3 * prog(t, 0.7 + i * 0.08, 0.9 + i * 0.08)} />
      ))}
      <rect x={170} y={59} width={230} height={18} rx={9} {...hair} {...draw(prog(t, 0.8, 1.1))} />
      <rect x={100} y={100} width={350} height={200} rx={8} {...hair} {...draw(inOut(prog(t, 0.6, 1.1)))} />
      <rect x={100} y={100} width={350} height={200} rx={8} {...line} stroke={ACCENT} strokeWidth={3} opacity={pin} />
      <g opacity={pin}>
        <circle cx={432} cy={116} r={6} fill={ACCENT} />
        <line x1={432} y1={122} x2={432} y2={132} {...line} stroke={ACCENT} strokeWidth={2} />
      </g>
      <clipPath id={clip}>
        <rect x={100} y={100} width={350} height={152} />
      </clipPath>
      <g clipPath={`url(#${clip})`} opacity={prog(t, 1, 1.3)}>
        <circle cx={275} cy={sunY} r={30} {...line} fill={ACCENT} fillOpacity={0.15} />
        <g transform={`rotate(${t * 12} 275 ${sunY.toFixed(1)})`} opacity={clamp((seq - 0.75) / 0.25)}>
          {Array.from({ length: F_RAYS }, (_, i) => {
            const a = (i / F_RAYS) * TAU;
            return <line key={i} x1={275 + 40 * Math.cos(a)} y1={sunY + 40 * Math.sin(a)} x2={275 + 52 * Math.cos(a)} y2={sunY + 52 * Math.sin(a)} {...line} strokeWidth={2} />;
          })}
        </g>
      </g>
      <line x1={100} y1={252} x2={450} y2={252} {...line} strokeWidth={2} strokeOpacity={0.5} {...draw(prog(t, 0.9, 1.3))} />
      <path d="M120 290L140 262H220L200 290ZM130 276H210M330 290L350 262H430L410 290ZM340 276H420" {...line} strokeWidth={2} strokeOpacity={0.45} {...draw(inOut(prog(t, 1, 1.6)))} />

      <rect x={80} y={398} width={390} height={56} rx={6} {...hair} {...draw(inOut(prog(t, 0.6, 1.1)))} />
      {Array.from({ length: F_FRAMES }, (_, k) => {
        const x = 88 + k * 48;
        return (
          <g key={k} opacity={prog(t, 0.9 + k * 0.06, 1.2 + k * 0.06)}>
            <rect x={x} y={408} width={40} height={36} rx={3} {...hair} />
            <line x1={x} y1={436} x2={x + 40} y2={436} {...hair} />
            <circle cx={x + 20} cy={lerp(436, 416, k / (F_FRAMES - 1))} r={5} fill={INK} opacity={0.45} />
          </g>
        );
      })}
      <rect x={85 + frame * 48} y={405} width={46} height={42} rx={5} {...line} stroke={ACCENT} opacity={prog(t, 1.1, 1.3)} />

      {/* GSAP ScrollTrigger: scrolling pins the canvas between the markers and reveals the copy */}
      <line x1={495} y1={56} x2={495} y2={380} {...hair} {...draw(prog(t, 2.6, 3))} />
      {[
        [120, "start"],
        [300, "end"],
      ].map(([y, label]) => (
        <g key={label} opacity={prog(t, 2.7, 3)}>
          <line x1={484} y1={y} x2={506} y2={y} {...line} strokeWidth={2} strokeOpacity={0.5} />
          <text x={514} y={Number(y) + 6} fontSize={16} fill={INK} fillOpacity={0.5} style={mono}>
            {label}
          </text>
        </g>
      ))}
      <rect x={489} y={thumbY} width={12} height={50} rx={6} fill={INK} opacity={prog(t, 2.8, 3)} />
      {F_REVEAL.map((w, i) => {
        const r = out(prog(t, 3.1 + i * 0.4, 3.5 + i * 0.4));
        return (
          <line key={i} x1={100} y1={322 + i * 20} x2={100 + w} y2={322 + i * 20} {...line} strokeWidth={i ? 2 : 3} strokeOpacity={i ? 0.35 : 0.7} opacity={r} transform={`translate(0 ${(1 - r) * 14})`} />
        );
      })}

      {/* Responsive layouts: the same page, restacked for a phone */}
      <path d="M572 211H604" {...hair} strokeDasharray="4 8" opacity={prog(t, 4.8, 5.1)} />
      <rect x={610} y={70} width={130} height={282} rx={22} {...line} {...draw(inOut(prog(t, 4.8, 5.6)))} />
      <line x1={655} y1={86} x2={695} y2={86} {...line} strokeOpacity={0.5} {...draw(prog(t, 5.4, 5.6))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const r = out(prog(t, 5.5 + i * 0.15, 5.9 + i * 0.15));
        return (
          <g key={i} opacity={r} transform={`translate(0 ${(1 - r) * 12})`}>
            {i === 0 && (
              <>
                <rect x={624} y={102} width={102} height={70} rx={6} {...hair} />
                <circle cx={675} cy={146} r={12} {...line} strokeWidth={2} fill={ACCENT} fillOpacity={0.15} />
                <line x1={624} y1={160} x2={726} y2={160} {...hair} strokeOpacity={0.4} />
              </>
            )}
            {i > 0 && i < 4 && <line x1={624} y1={176 + i * 18} x2={624 + [90, 70, 84][i - 1]} y2={176 + i * 18} {...line} strokeWidth={i === 1 ? 3 : 2} strokeOpacity={i === 1 ? 0.7 : 0.35} />}
            {i === 4 && <rect x={625} y={262} width={100} height={24} rx={12} fill={ACCENT} />}
          </g>
        );
      })}

      {/* Technical SEO: JSON-LD written in, then the site climbs the results */}
      <rect x={790} y={62} width={232} height={112} rx={10} {...line} strokeWidth={2} {...draw(inOut(prog(t, 6.6, 7)))} />
      {F_JSON.map(([x, s], i) => {
        const shown = s.slice(0, Math.max(0, typed));
        typed -= s.length;
        return (
          <text key={i} x={x} y={96 + i * 28} fontSize={16} fill={i === 1 ? ACCENT : INK} fillOpacity={i === 1 ? 1 : 0.7} style={mono}>
            {shown}
          </text>
        );
      })}
      <rect x={790} y={194} width={232} height={34} rx={17} {...hair} {...draw(inOut(prog(t, 7.3, 7.7)))} />
      <g opacity={prog(t, 7.5, 7.7)}>
        <circle cx={808} cy={210} r={6.5} {...line} strokeWidth={2} />
        <path d="M813 215l5 5" {...line} strokeWidth={2} />
      </g>
      <text x={828} y={217} fontSize={16} fill={INK} fillOpacity={0.7} style={mono}>
        {F_QUERY.slice(0, Math.floor(prog(t, 7.6, 7.9) * F_QUERY.length))}
      </text>
      {[0, 1, 2].map((r) => {
        const ours = r === 2;
        const y = ours ? lerp(F_SLOTS[2], F_SLOTS[0], swap) : lerp(F_SLOTS[r], F_SLOTS[r + 1], swap);
        const x = ours ? Math.sin(Math.PI * swap) * 12 : 0;
        return (
          <g key={r} transform={`translate(${x} ${y})`} opacity={prog(t, 7.8 + r * 0.06, 8 + r * 0.06)}>
            <circle cx={802} r={6} {...(ours ? { fill: ACCENT } : hair)} />
            <line x1={816} x2={816 + [150, 120, 160][r]} {...line} strokeWidth={3} stroke={ours ? ACCENT : INK} strokeOpacity={ours ? 1 : 0.35} />
            <line x1={816} y1={13} x2={906} y2={13} {...hair} />
          </g>
        );
      })}

      {/* WhatsApp ordering: the phone's button opens a chat and an order comes back confirmed */}
      {sent > 0 && sent < 1 && <circle cx={F_CTA[0] - 50} cy={F_CTA[1]} r={14 + 30 * out(sent)} {...line} stroke={ACCENT} strokeWidth={2} strokeOpacity={1 - sent} />}
      {sent > 0 && sent < 1 && (() => {
        const [x, y] = cubic(...F_TO_CHAT, inOut(sent));
        return <circle cx={x} cy={y} r={7} fill={ACCENT} />;
      })()}
      <rect x={1060} y={62} width={170} height={290} rx={18} {...line} {...draw(inOut(prog(t, 8.4, 9)))} />
      <line x1={1060} y1={102} x2={1230} y2={102} {...hair} {...draw(prog(t, 8.8, 9.1))} />
      <g opacity={prog(t, 8.9, 9.1)}>
        <circle cx={1084} cy={82} r={9} {...line} strokeWidth={2} />
        <line x1={1102} y1={82} x2={1160} y2={82} {...line} strokeWidth={3} strokeOpacity={0.5} />
      </g>
      {bubble > 0 && (
        <g transform={scaleAt([1216, 142], bubble)}>
          <rect x={1110} y={122} width={106} height={40} rx={12} fill={ACCENT} />
          <text x={1124} y={148} fontSize={16} fill="#fff" style={mono}>
            2x maki
          </text>
        </g>
      )}
      <path d="M1185 172l4 4l7 -7M1192 176l7 -7" {...line} strokeWidth={2} stroke={t > 9.6 ? ACCENT : INK} strokeOpacity={t > 9.6 ? 1 : 0.35} opacity={prog(t, 9.3, 9.45)} />
      <g opacity={prog(t, 9.4, 9.6)}>
        <rect x={1074} y={190} width={112} height={44} rx={12} {...hair} fill="#fff" />
        {t < 9.9
          ? [0, 1, 2].map((i) => <circle key={i} cx={1100 + i * 14} cy={212 - 4 * Math.max(0, Math.sin((t * 3 - i * 0.25) * TAU))} r={4} fill={INK} opacity={0.4} />)
          : (
            <path d="M1088 206H1166M1088 220H1140" {...line} strokeWidth={2} strokeOpacity={0.4} />
          )}
      </g>
      {t > 10 && (
        <g transform={scaleAt([1151, 286], back(prog(t, 10, 10.35)))}>
          <rect x={1086} y={254} width={130} height={64} rx={10} {...line} fill="#fff" />
          <circle cx={1110} cy={286} r={12} fill={ACCENT} />
          <path d="M1105 286l3.5 4l7 -8" {...line} stroke="#fff" strokeWidth={2.5} />
          <path d="M1132 278H1200M1132 294H1180" {...line} strokeWidth={2} strokeOpacity={0.35} />
        </g>
      )}

      {/* Live in production: both sites out on their own domains */}
      <path d="M675 352V464H800M675 418H800" {...hair} strokeDasharray="4 8" opacity={prog(t, 10.4, 10.8)} />
      {F_SITES.map((site, i) => {
        const y = 400 + i * 46;
        const p = back(prog(t, 10.6 + i * 0.3, 11 + i * 0.3));
        const ping = ((t - 10.6 - i * 0.3) * 0.8) % 1;
        return p > 0 ? (
          <g key={site} transform={scaleAt([800, y + 18], p)}>
            <rect x={800} y={y} width={330} height={36} rx={18} {...line} strokeWidth={2} fill="#fff" />
            <circle cx={822} cy={y + 18} r={6} fill={ACCENT} />
            <circle cx={822} cy={y + 18} r={6 + 12 * ping} {...line} stroke={ACCENT} strokeWidth={2} strokeOpacity={0.6 * (1 - ping)} />
            <text x={842} y={y + 24} fontSize={17} fill={INK} fillOpacity={0.75} style={mono}>
              {site}
            </text>
          </g>
        ) : null;
      })}
    </g>
  );
}

/* ------------------------------------------------------------------------- *
 * VK Studio: a quote priced nail by nail and sent as a PDF, appointments      *
 * moved across a board, clients remembered, the team ranked, and every row    *
 * guarded by who's asking.                                                    *
 * ------------------------------------------------------------------------- */

const Q_NAILS = [96, 80, 74, 80, 98];
const Q_NAIL_PRICE = 15;
const Q_ROWS = [45, 30, 25];
const Q_TAX = 0.18;
const Q_COLS = [590, 692, 794];
const Q_CARDS: [t: number, col: number, slot: number][][] = [
  [[4, 0, 0], [4.6, 1, 0], [5.3, 2, 1]],
  [[4.1, 0, 1], [5, 1, 1]],
  [[4.2, 0, 2], [5.5, 0, 0]],
  [[4.3, 2, 0]],
];
const Q_CLIENTS = [
  { name: 86, visits: 5, ticket: "S/ 140", fav: true },
  { name: 70, visits: 3, ticket: "S/ 95", fav: false },
  { name: 96, visits: 6, ticket: "S/ 180", fav: false },
];
const Q_BARS = [190, 150, 120, 85];
const Q_REVENUE = [258, 250, 252, 238, 242, 226, 230, 214, 208, 198].map((y, i): Pt => [960 + i * (240 / 9), y]);
const Q_DB_ROWS = [346, 362, 378, 394];
const Q_OWN = [0, 2];
const Q_ADMIN: Pt = [968, 372];
const Q_TECH: Pt = [1192, 372];

const slotPt = (col: number, slot: number): Pt => [Q_COLS[col] + 8, 96 + slot * 44];
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join("") + "Z";

function Studio({ t }: { t: number }) {
  const painted = Q_NAILS.filter((_, i) => t >= 1 + i * 0.22).length;
  const ticked = Q_ROWS.filter((_, i) => t >= 1.7 + i * 0.22);
  const subtotal = painted * Q_NAIL_PRICE + ticked.reduce((a, b) => a + b, 0);
  const total = t >= 2.4 ? subtotal * (1 + Q_TAX) : subtotal;
  const ghost = inOut(prog(t, 2.6, 3.1));
  const adminLit = prog(t, 11.1, 11.35) * (1 - prog(t, 11.5, 11.7));
  const techLit = prog(t, 12, 12.3);

  return (
    <g opacity={fade(t, 13.5)}>
      {/* Quoting engine: price each nail, tick the services, add tax */}
      <rect x={80} y={50} width={330} height={390} rx={14} {...line} {...draw(inOut(prog(t, 0.1, 0.9)))} />
      {Q_NAILS.map((y, i) => {
        const x = 112 + i * 50;
        const paint = prog(t, 1 + i * 0.22, 1.25 + i * 0.22);
        return (
          <g key={i} opacity={prog(t, 0.5 + i * 0.06, 0.8 + i * 0.06)}>
            <rect x={x} y={y} width={34} height={48} rx={16} {...line} strokeWidth={2} fill={ACCENT} fillOpacity={0.85 * paint} />
            {paint > 0 && paint < 1 && (
              <text x={x + 17} y={y - 8 - 14 * paint} textAnchor="middle" fontSize={14} fill={ACCENT} opacity={1 - paint} style={mono}>
                +{Q_NAIL_PRICE}
              </text>
            )}
          </g>
        );
      })}
      {Q_ROWS.map((price, i) => {
        const y = 190 + i * 42;
        return (
          <g key={i} opacity={prog(t, 0.8 + i * 0.1, 1.1 + i * 0.1)}>
            <rect x={104} y={y - 9} width={18} height={18} rx={4} {...line} strokeWidth={2} />
            <path d={`M108 ${y}l3.5 4l7 -8`} {...line} stroke={ACCENT} {...draw(prog(t, 1.7 + i * 0.22, 1.9 + i * 0.22))} />
            <line x1={136} y1={y} x2={136 + [140, 110, 125][i]} y2={y} {...line} strokeWidth={2} strokeOpacity={0.35} />
            <text x={386} y={y + 6} textAnchor="end" fontSize={16} fill={INK} fillOpacity={0.55} style={mono}>
              S/ {price}
            </text>
          </g>
        );
      })}
      <line x1={104} y1={322} x2={386} y2={322} {...hair} {...draw(prog(t, 1, 1.4))} />
      <g opacity={prog(t, 1.1, 1.4)}>
        <text x={104} y={364} fontSize={17} fill={INK} fillOpacity={0.55} style={mono}>
          total
        </text>
        <text x={386} y={366} textAnchor="end" fontSize={26} fill={INK} style={mono}>
          S/ {total.toFixed(2)}
        </text>
      </g>
      <text x={104} y={406} fontSize={15} fill={ACCENT} opacity={prog(t, 2.3, 2.5)} style={mono}>
        + IGV {Q_TAX * 100}%
      </text>

      {/* PDF quotes: the quote folds down into a document */}
      {ghost > 0 && ghost < 1 && (
        <rect x={lerp(80, 450, ghost)} y={lerp(50, 150, ghost)} width={lerp(330, 96, ghost)} height={lerp(390, 124, ghost)} rx={lerp(14, 4, ghost)} {...line} strokeWidth={2} strokeOpacity={0.4 * (1 - ghost)} />
      )}
      <path d="M450 150H528L546 168V274H450Z" {...line} {...draw(inOut(prog(t, 2.9, 3.3)))} />
      <path d="M528 150V168H546" {...line} {...draw(prog(t, 3.2, 3.35))} />
      <path d="M464 180H520M464 196H530M464 212H506" {...line} strokeWidth={2} strokeOpacity={0.35} {...draw(prog(t, 3.1, 3.4))} />
      {t > 3.25 && (
        <g transform={scaleAt([486, 247], back(prog(t, 3.25, 3.5)))}>
          <rect x={462} y={236} width={48} height={22} rx={4} fill={ACCENT} />
          <text x={486} y={252} textAnchor="middle" fontSize={13} fill="#fff" style={mono}>
            PDF
          </text>
        </g>
      )}
      <path d="M498 290V316M488 306l10 10l10 -10M478 326H518" {...line} strokeWidth={2} {...draw(prog(t, 3.4, 3.75))} />

      {/* Kanban appointments: cards move along the status flow */}
      {Q_COLS.map((x, c) => (
        <g key={x}>
          <rect x={x} y={50} width={94} height={230} rx={10} {...hair} {...draw(inOut(prog(t, 3.8 + c * 0.1, 4.3 + c * 0.1)))} />
          <g opacity={prog(t, 4 + c * 0.1, 4.2 + c * 0.1)}>
            <circle cx={x + 18} cy={70} r={6} {...(c === 2 ? { fill: ACCENT } : { ...line, strokeWidth: 2 })} />
            {c === 1 && <path d={`M${x + 18} 64A6 6 0 0 1 ${x + 18} 76Z`} fill={INK} />}
            <line x1={x + 32} y1={70} x2={x + 72} y2={70} {...line} strokeWidth={2} strokeOpacity={0.35} />
          </g>
        </g>
      ))}
      {Q_CARDS.map((keys, k) => {
        const [t0, c0, s0] = keys[0];
        const appear = prog(t, t0, t0 + 0.3);
        if (appear <= 0) return null;
        let pos = slotPt(c0, s0);
        for (const [ti, ci, si] of keys.slice(1)) pos = mix(pos, slotPt(ci, si), inOut(prog(t, ti, ti + 0.45)));
        const alert = k === 2 ? prog(t, 5.6, 6) : 0;
        return (
          <g key={k} transform={`translate(${pt(pos)})`} opacity={appear}>
            <g transform={scaleAt([39, 18], back(appear))}>
              <rect width={78} height={36} rx={6} {...line} strokeWidth={2} fill="#fff" />
              <circle cx={14} cy={18} r={7} {...hair} strokeOpacity={0.5} />
              <path d="M26 14H66M26 24H52" {...line} strokeWidth={2} strokeOpacity={0.35} />
            </g>
            {alert > 0 && (
              <>
                <circle cx={76} cy={2} r={6} fill={ACCENT} />
                {alert < 1 && <circle cx={76} cy={2} r={6 + 14 * out(alert)} {...line} stroke={ACCENT} strokeWidth={2} strokeOpacity={1 - alert} />}
              </>
            )}
          </g>
        );
      })}

      {/* Client directory: visits, average ticket, favourite service */}
      {Q_CLIENTS.map(({ name, visits, ticket, fav }, i) => {
        const y = 300 + i * 52;
        const r = out(prog(t, 6 + i * 0.15, 6.5 + i * 0.15));
        return (
          <g key={i}>
            <g opacity={r} transform={`translate(${-(1 - r) * 20} 0)`}>
              <circle cx={612} cy={y + 18} r={12} {...line} strokeWidth={2} />
              <line x1={634} y1={y + 12} x2={634 + name} y2={y + 12} {...line} strokeWidth={3} strokeOpacity={0.6} />
              <line x1={634} y1={y + 26} x2={684} y2={y + 26} {...hair} />
              <line x1={590} y1={y + 44} x2={890} y2={y + 44} {...hair} strokeOpacity={0.12} />
            </g>
            {Array.from({ length: visits }, (_, j) => (
              <circle key={j} cx={744 + j * 12} cy={y + 18} r={3.5 * back(prog(t, 6.5 + i * 0.15 + j * 0.08, 6.7 + i * 0.15 + j * 0.08))} fill={INK} opacity={0.5} />
            ))}
            <text x={888} y={y + 24} textAnchor="end" fontSize={15} fill={INK} fillOpacity={0.55} opacity={prog(t, 7.1 + i * 0.1, 7.4 + i * 0.1)} style={mono}>
              {ticket}
            </text>
            {fav && t > 7.4 && <path d={star(626, y + 4, 8)} fill={ACCENT} transform={scaleAt([626, y + 4], back(prog(t, 7.4, 7.7)))} />}
          </g>
        );
      })}

      {/* Admin dashboard: technician leaderboard and revenue */}
      <rect x={940} y={50} width={280} height={230} rx={12} {...line} {...draw(inOut(prog(t, 7.8, 8.3)))} />
      {Q_BARS.map((w, i) => {
        const y = 82 + i * 30;
        const g = out(prog(t, 8.2 + i * 0.12, 8.8 + i * 0.12));
        return (
          <g key={i} opacity={prog(t, 8.1 + i * 0.08, 8.3 + i * 0.08)}>
            <text x={958} y={y + 5} textAnchor="middle" fontSize={15} fill={INK} fillOpacity={0.55} style={mono}>
              {i + 1}
            </text>
            <circle cx={984} cy={y} r={8} {...hair} strokeOpacity={0.5} />
            <rect x={1000} y={y - 7} width={Math.max(0.1, w * g)} height={14} rx={7} fill={i ? INK : ACCENT} fillOpacity={i ? 0.25 : 1} />
          </g>
        );
      })}
      <line x1={956} y1={192} x2={1204} y2={192} {...hair} strokeOpacity={0.12} opacity={prog(t, 8.6, 8.9)} />
      <polyline points={Q_REVENUE.map(pt).join(" ")} {...line} {...draw(inOut(prog(t, 8.9, 9.6)))} />
      <circle cx={Q_REVENUE[9][0]} cy={Q_REVENUE[9][1]} r={6 * back(prog(t, 9.5, 9.8))} fill={ACCENT} />

      {/* Roles & RLS: admin reads every row, a technician only their own */}
      <path d="M1028 322V404A52 12 0 0 0 1132 404V322" {...line} {...draw(inOut(prog(t, 9.8, 10.4)))} />
      <ellipse cx={1080} cy={322} rx={52} ry={12} {...line} {...draw(inOut(prog(t, 9.9, 10.4)))} />
      {Q_DB_ROWS.map((y, i) => {
        const own = Q_OWN.includes(i);
        const lit = techLit > 0 ? (own ? techLit : 0) : adminLit;
        return (
          <g key={y} opacity={prog(t, 10.2 + i * 0.06, 10.4 + i * 0.06)}>
            <line x1={1048} y1={y} x2={1112} y2={y} {...line} strokeWidth={4} strokeOpacity={techLit > 0 && !own ? 0.08 : 0.2} />
            {lit > 0 && <line x1={1048} y1={y} x2={1112} y2={y} {...line} strokeWidth={4} stroke={techLit > 0 ? ACCENT : INK} opacity={lit} />}
          </g>
        );
      })}
      {t > 10.4 && (
        <g transform={scaleAt([1080, 446], back(prog(t, 10.4, 10.7)))}>
          <path d="M1080 428l18 6v10c0 10 -8 16 -18 20c-10 -4 -18 -10 -18 -20v-10Z" {...line} strokeWidth={2} fill="#fff" />
          <path d="M1074 446l4 4l8 -8" {...line} stroke={ACCENT} strokeWidth={2} />
        </g>
      )}
      {[
        { at: Q_ADMIN, label: "admin", start: 10.2, query: 10.7, to: 1024 },
        { at: Q_TECH, label: "tech", start: 10.35, query: 11.6, to: 1136 },
      ].map(({ at, label, start, query, to }) => {
        const s = back(prog(t, start, start + 0.3));
        const q = inOut(prog(t, query, query + 0.4));
        const from = at[0] + (to > at[0] ? 18 : -18);
        return (
          <g key={label}>
            <line x1={from} y1={366} x2={to} y2={366} {...hair} strokeDasharray="3 6" opacity={prog(t, start + 0.2, start + 0.4)} />
            {s > 0 && <Person at={at} s={s} color={label === "tech" ? ACCENT : INK} />}
            <text x={at[0]} y={410} textAnchor="middle" fontSize={15} fill={INK} fillOpacity={0.55} opacity={prog(t, start + 0.2, start + 0.4)} style={mono}>
              {label}
            </text>
            {q > 0 && q < 1 && <circle cx={lerp(from, to, q)} cy={366} r={6} fill={label === "tech" ? ACCENT : INK} />}
          </g>
        );
      })}
    </g>
  );
}

const scenes: Record<string, Scene> = {
  "frontend-freelance": {
    loop: 13,
    still: 11.8,
    Draw: Frontend,
    steps: [
      [0, 2.6],
      [2.6, 4.8],
      [4.8, 6.6],
      [6.6, 8.4],
      [8.4, 10.4],
      [10.4, 13],
    ],
  },
  "vk-studio": {
    loop: 13.5,
    still: 12.4,
    Draw: Studio,
    steps: [
      [0, 2.6],
      [2.6, 3.8],
      [3.8, 6],
      [6, 7.8],
      [7.8, 9.8],
      [9.8, 13.5],
    ],
  },
};
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

type Props = {
  id: string;
  title: string;
  /** Caption for each step, in the order the scene acts them out. */
  labels: string[];
  /** Called with the index of the step currently being acted out (-1 between loops). */
  onStep?: (step: number) => void;
};

function ExperienceAnimation({ id, title, labels, onStep }: Props) {
  const scene = scenes[id];
  const svg = useRef<SVGSVGElement>(null);
  const [clock, setClock] = useState(0);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const loop = scene?.loop ?? 1;

  useEffect(() => {
    const el = svg.current;
    if (!el || reduced) return;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    const tick = (now: number) => {
      if (last) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      setClock(elapsed % loop);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, loop]);

  const t = reduced ? (scene?.still ?? 0) : clock;
  const step = scene ? scene.steps.findIndex(([a, b]) => t >= a && t < b) : -1;

  useEffect(() => {
    onStep?.(step);
  }, [step, onStep]);

  if (!scene) return null;
  const { Draw, steps } = scene;

  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={title}>
      <Draw t={t} />
      {steps.map(([a, b], i) => {
        const o = prog(t, a, a + 0.3) * (1 - prog(t, b - 0.3, b));
        return o > 0 && labels[i] ? (
          <text key={i} x={90} y={514 + (1 - o) * 8} fontSize={22} fill={INK} fillOpacity={0.5} opacity={o} style={mono}>
            {labels[i]}
          </text>
        ) : null;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------------- *
 * The stack: full-height panels stack while scrolling (sticky cards). Behind  *
 * them, a sticky dossier on the left swaps per active role, over the page's   *
 * grid, scanlines and a blue glow that drifts from one role to the next.      *
 * ------------------------------------------------------------------------- */

export type ExperienceEntry = {
  /** "frontend-freelance" | "vk-studio" picks a built-in drawing. */
  id: string;
  role: string;
  type: string;
  company: string;
  /** Start and duration, already joined. */
  period: string;
  location: string;
  focus: string;
  summary: string;
  ongoing?: boolean;
  /** Six short labels, in the order the drawing acts them out. */
  capabilities: string[];
  tech: string[];
  clients: { name: string; link: string }[];
};

export type ExperienceStackLabels = {
  capabilities: string;
  stack: string;
  current: string;
  clients: string;
  period: string;
  location: string;
};

/** Where the background glow sits for each panel, as [left, top]. */
const GLOWS = [
  ["22%", "38%"],
  ["30%", "68%"],
  ["18%", "52%"],
];

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "56px 56px",
  maskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, #000 20%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, #000 20%, transparent 75%)",
} as const;

const OUTLINE = { WebkitTextStroke: "1px rgba(147,197,253,0.18)", color: "transparent" } as const;

const panelClass =
  "sticky top-0 container mx-auto grid min-h-screen content-center items-center px-6 py-10 lg:grid-cols-2 lg:px-8 lg:py-16 lg:[@media(max-height:960px)]:py-6";

const labelClass = "font-mono text-[10px] tracking-widest text-white/40 uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

export type ExperienceStackProps = {
  entries: ExperienceEntry[];
  labels: ExperienceStackLabels;
  className?: string;
};

export function ExperienceStack({ entries, labels, className }: ExperienceStackProps) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));
    let raf = 0;
    // A panel taller than the viewport sticks by its bottom edge, so the whole card stays reachable.
    const fit = () => {
      const vh = window.innerHeight;
      panels.forEach((panel) => {
        panel.style.top = `${Math.min(0, vh - panel.offsetHeight)}px`;
      });
    };
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let idx = 0;
      panels.forEach((panel, i) => {
        if (panel.getBoundingClientRect().top <= vh * 0.5) idx = i;
        // how far the *next* panel has travelled over this one (0..1)
        const next = panels[i + 1];
        const card = cards.current[i];
        if (!card) return;
        const covered = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh)) : 0;
        card.style.opacity = String(Math.max(0, 1 - covered * 1.4));
        card.style.transform = `scale(${1 - covered * 0.06}) translateY(${-covered * 40}px)`;
      });
      setActive(idx);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      fit();
      schedule();
    };
    fit();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [entries.length]);

  const [glowX, glowY] = GLOWS[active % GLOWS.length];

  return (
    <div ref={root} className={cn("relative isolate w-full", className)}>
      {entries.map((e, i) => (
        <div key={e.id} data-panel className={panelClass}>
          {/* Title and card fade together as the next panel slides over them. */}
          <div
            className="mx-auto w-full max-w-[40rem] lg:col-start-2 lg:mr-0"
            ref={(el) => {
              cards.current[i] = el;
            }}
            style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
          >
            <div className="mb-5 lg:hidden">
              <p className="font-mono text-[10px] tracking-[0.2em] text-blue-300/80 uppercase">
                EXP_{pad(i + 1)} <span className="text-white/25">// {e.role}</span>
              </p>
              <h3 className="font-section mt-2 text-2xl font-semibold tracking-tight text-white">{e.company}</h3>
            </div>
            <ExperienceCard entry={e} index={i} labels={labels} />
          </div>
        </div>
      ))}

      {/* Sticky backdrop: grid, scanlines, drifting glow and the left-hand dossier */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0" style={GRID_BG} />
          <div
            className="absolute h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.12] blur-[140px] transition-[left,top] duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ left: glowX, top: glowY }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.016)_1px,transparent_1px)] bg-size-[100%_4px]" />

          <div className="container mx-auto hidden h-full px-6 lg:grid lg:grid-cols-2 lg:px-8">
            <div className="relative h-full">
              {entries.map((e, i) => (
                <div
                  key={e.id}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-center pr-16 transition duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    i !== active && "pointer-events-none opacity-0",
                    i < active && "-translate-y-10",
                    i > active && "translate-y-10",
                  )}
                >
                  <p className="font-mono text-[11px] tracking-[0.22em] text-blue-300/80">
                    EXP_{pad(i + 1)} <span className="text-white/25">/ {pad(entries.length)}</span>
                  </p>
                  <span className="font-section -ml-1 mt-2 block text-[9rem] leading-[0.85] font-bold tracking-tighter select-none xl:text-[11rem]" style={OUTLINE}>
                    {pad(i + 1)}
                  </span>
                  <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-white/45 uppercase">
                    {e.role} <span className="text-blue-400/60">//</span> {e.type}
                  </p>
                  <h3 className="font-section mt-3 max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-white xl:text-5xl">{e.company}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">{e.focus}</p>
                  <dl className="mt-8 grid max-w-md grid-cols-2 gap-px border border-white/5 bg-white/5 font-mono text-[10px] tracking-widest uppercase">
                    <div className="bg-black p-3">
                      <dt className="text-white/30">{labels.period}</dt>
                      <dd className="mt-1.5 text-white/75">{e.period}</dd>
                    </div>
                    <div className="bg-black p-3">
                      <dt className="text-white/30">{labels.location}</dt>
                      <dd className="mt-1.5 text-white/75">{e.location}</dd>
                    </div>
                  </dl>
                </div>
              ))}

              {/* Progress rail: one segment per role */}
              <div className="absolute bottom-14 left-0 flex items-center gap-3 font-mono text-[10px] tracking-widest">
                {entries.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <span className={cn("transition-colors duration-500", i <= active ? "text-blue-300" : "text-white/25")}>{pad(i + 1)}</span>
                    {i < entries.length - 1 && (
                      <span className="relative h-px w-16 bg-white/10">
                        <span
                          className="absolute inset-y-0 left-0 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-[width] duration-700"
                          style={{ width: i < active ? "100%" : "0%" }}
                        />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ entry: e, index, labels }: { entry: ExperienceEntry; index: number; labels: ExperienceStackLabels }) {
  const [step, setStep] = useState(-1);
  return (
    <article className="group relative overflow-hidden border border-white/5 bg-[#030303] shadow-[0_0_0_1px_rgba(255,255,255,0.01),0_24px_80px_rgba(0,0,0,0.6)] transition-[border-color,box-shadow] duration-300 hover:border-blue-400/40 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.18),0_28px_100px_rgba(37,99,235,0.16)]">
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 z-30 h-3 w-3 border-t border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" />
      <div className="absolute top-0 right-0 z-30 h-3 w-3 border-t border-r border-white/30 transition-colors duration-300 group-hover:border-blue-300" />
      <div className="absolute bottom-0 left-0 z-30 h-3 w-3 border-b border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" />
      <div className="absolute right-0 bottom-0 z-30 h-3 w-3 border-r border-b border-white/30 transition-colors duration-300 group-hover:border-blue-300" />

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.01] px-4 py-3 font-mono text-[10px] tracking-widest">
        <div className="flex min-w-0 items-center gap-2 text-white/50">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
          <span className="truncate uppercase">
            EXP_{pad(index + 1)} <span className="text-white/25">·</span> {e.type}
          </span>
        </div>
        {e.ongoing ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] tracking-[0.16em] text-emerald-300 uppercase">
            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            {labels.current}
          </span>
        ) : (
          <span className="shrink-0 text-blue-200/70 uppercase">{e.period}</span>
        )}
      </div>

      {/* The drawing, lit like a screen inside the dark card */}
      <div className="border-b border-white/5 p-3 md:p-4">
        <div className="relative bg-gradient-to-b from-[#e3e8f4] to-[#f8f9fc] px-3 pt-4 shadow-[0_0_40px_rgba(96,165,250,0.08)] md:px-7 md:pt-6">
          <ExperienceAnimation id={e.id} title={`${e.company}: ${e.capabilities.join(", ")}`} labels={e.capabilities} onStep={setStep} />
        </div>
      </div>

      <div className="relative z-30 p-5 md:p-6">
        <p className="text-sm leading-relaxed text-white/62">{e.summary}</p>

        {e.clients.length > 0 && (
          <div className="mt-5">
            <div className={cn(labelClass, "mb-3")}>{labels.clients}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {e.clients.map((c) => (
                <a
                  key={c.name}
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/client flex items-center justify-between gap-2 border border-white/8 bg-white/[0.02] px-3 py-2.5 transition-colors duration-200 hover:border-blue-400/45 hover:bg-blue-400/[0.06]"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-blue-100">{c.name}</span>
                    <span className="block truncate font-mono text-[10px] tracking-wide text-white/30">{c.link.replace(/^https?:\/\//, "")}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-blue-300/70 transition-transform duration-200 group-hover/client:translate-x-0.5 group-hover/client:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={cn(labelClass, "mt-6 mb-3")} id={`experience-list-title-${e.id}`}>
          {labels.capabilities}
        </div>
        <ul className="grid grid-cols-2 gap-2" aria-labelledby={`experience-list-title-${e.id}`}>
          {e.capabilities.map((c, i) => {
            const on = i === step;
            return (
              <li
                key={c}
                className={cn(
                  "flex items-center gap-2.5 border px-3 py-2 font-mono text-[11px] leading-tight tracking-wide transition-colors duration-500",
                  on ? "border-blue-400/50 bg-blue-400/10 text-blue-100" : "border-white/8 bg-white/[0.02] text-white/55",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rotate-45 transition-all duration-500",
                    on ? "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" : "bg-white/20",
                  )}
                  aria-hidden="true"
                />
                {c}
              </li>
            );
          })}
        </ul>

        <div className={cn(labelClass, "mt-6 mb-3")}>{labels.stack}</div>
        <div className="flex flex-wrap gap-2">
          {e.tech.map((tech) => (
            <span key={tech} className="border border-blue-400/20 bg-blue-400/10 px-2 py-1 font-mono text-[10px] text-blue-200">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Scanline sweep on hover */}
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full -translate-y-full bg-linear-to-b from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:animate-scanline group-hover:opacity-100" />
    </article>
  );
}

export default ExperienceStack;
