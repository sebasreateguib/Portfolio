"use client";

import { useEffect, useRef } from "react";
import HL from "@/lib/hairline/kernel.js";
import { mountCrt, GMAX, NAMES } from "@/lib/hairline/crt.js";
import { useLanguage } from "../../context/LanguageContext";

/** Scroll travel while the monitor is pinned, in viewport heights. */
const SCROLL_LENGTH = 1.8;
/** The gap at rest: barely open, so the still frame already says "layers". */
const GAP_REST = 4;
/** The portal's progress (0–1) over which the layers part. */
const PART: [number, number] = [0.04, 0.45];
/** The progress over which the scroll walks the layers, back to front, one quarter each. */
const WALK: [number, number] = [0.45, 0.97];
/**
 * How close the camera starts: the closed monitor fills its column, and the
 * camera pulls back to the figure's own frame as the layers part, so the
 * open stack always fits.
 */
const CLOSE_UP = 1.55;

/** What each layer of the monitor holds, back to front, in the figure's order. */
const LAYER_TECH: Record<string, string[]> = {
    infra: ["AWS", "GCP", "Cloudflare", "Docker", "Nginx"],
    data: ["PostgreSQL", "pgvector", "MongoDB", "DynamoDB", "Qdrant"],
    backend: ["Spring Boot", "FastAPI", "Node.js", "Express"],
    frontend: ["React", "Next.js", "TypeScript", "Vue.js"],
};

const portalCopy = {
    en: {
        hint: "Scroll to take it apart.",
        enter: "Skip",
        label: "A terminal monitor taken apart like a stack: infra, data, backend and frontend.",
        roles: { infra: "Where it runs", data: "What it remembers", backend: "What it decides", frontend: "What you see" },
    },
    es: {
        hint: "Haz scroll para desarmarlo.",
        enter: "Saltar",
        label: "Un monitor de terminal desarmado como un stack: infra, data, backend y frontend.",
        roles: { infra: "Dónde corre", data: "Lo que recuerda", backend: "Lo que decide", frontend: "Lo que ves" },
    },
} as const;

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
    const t = clamp((n - a) / (b - a));
    return t * t * (3 - 2 * t);
};

export type CrtPortalProps = {
    /** The section that follows the monitor once it lets go. */
    children: React.ReactNode;
    /** Where the skip link jumps: the next section's anchor. */
    enterHref: string;
};

/**
 * A Hairline CRT on a black sheet, carrying on from the ASCII hero, beside the
 * stack it stands for. While it is pinned, scrolling parts its layers as the
 * camera pulls back, then walks them back to front: each rises in the drawing
 * and lights its row in the list. Hovering the drawing or a row picks a layer
 * of its own; then the page carries on.
 */
export default function CrtPortal({ children, enterHref }: CrtPortalProps) {
    const { language } = useLanguage();
    const copy = portalCopy[language];
    const wrapRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<HTMLParagraphElement>(null);
    const listRef = useRef<HTMLOListElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrap = wrapRef.current!, pin = pinRef.current!, stage = stageRef.current!;
        const path = pathRef.current!, list = listRef.current!, caption = captionRef.current!;
        const rows = Array.from(list.querySelectorAll<HTMLLIElement>("[data-layer]"));
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

        // The figure's read-out names the lit layer ("02 data", or "rest"): it becomes
        // the path above the list, and the row that matches it lights up.
        const read = {
            set textContent(value: string) {
                const on = value === "rest" ? -1 : Number(value.slice(0, 2)) - 1;
                path.textContent = on < 0 ? "~/stack" : `~/stack/${value.replace(" ", "-")}`;
                rows.forEach((row, i) => { row.dataset.on = String(i === on); });
            },
        };
        HL.inject(document);
        const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
        const figure = mountCrt({ stage, svg, read }, GAP_REST);
        stage.style.transformOrigin = `${(figure.center[0] / 400) * 100}% ${(figure.center[1] / 320) * 100}%`;

        // A row under the pointer picks its layer, over whatever the scroll picked.
        let scrolled: number | null = null, listed: number | null = null;
        const pick = () => figure.pick(listed ?? scrolled);
        const enter = (e: PointerEvent) => { listed = Number((e.currentTarget as HTMLElement).dataset.layer); pick(); };
        const leave = () => { listed = null; pick(); };
        rows.forEach((row) => { row.addEventListener("pointerenter", enter); row.addEventListener("pointerleave", leave); });

        let raf = 0, last = -1;
        const paint = () => {
            raf = 0;
            const travel = pin.clientHeight * SCROLL_LENGTH;
            const p = motion.matches ? 0 : clamp(-wrap.getBoundingClientRect().top / travel);
            if (p === last) return;
            last = p;
            const open = motion.matches ? 0.5 : smooth(PART[0], PART[1], p);
            figure.set(GAP_REST + (GMAX - GAP_REST) * open);
            const zoom = CLOSE_UP + (1 - CLOSE_UP) * open;
            stage.style.transform = zoom === 1 ? "" : `scale(${zoom})`;
            const walk = (p - WALK[0]) / (WALK[1] - WALK[0]);
            scrolled = walk < 0 ? null : Math.min(NAMES.length - 1, Math.floor(walk * NAMES.length));
            pick();
            caption.style.opacity = String(1 - smooth(0.01, 0.12, p));
            caption.style.pointerEvents = p < 0.08 ? "auto" : "none";
        };
        const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
        const relayout = () => { last = -1; schedule(); };

        paint();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", relayout);
        motion.addEventListener("change", relayout);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", relayout);
            motion.removeEventListener("change", relayout);
            rows.forEach((row) => { row.removeEventListener("pointerenter", enter); row.removeEventListener("pointerleave", leave); });
            figure.destroy();
            svg.remove();
        };
    }, []);

    return (
        <>
            <style>{`
                .crt-portal { position: relative; height: ${(SCROLL_LENGTH + 1) * 100}svh; }
                .crt-portal-pin { position: sticky; top: 0; height: 100svh; overflow: clip; background: #000; }
                .crt-portal-row { color: rgb(242 240 235 / .32); transition: color 260ms cubic-bezier(.5,0,.1,1); }
                .crt-portal-row[data-on="true"] { color: #f2f0eb; }
                .crt-portal-row .crt-portal-rule { background: currentColor; opacity: .35; }
                /* On narrow screens only the lit layer lists its tech, so the list stays clear of the chat dock. */
                @media (max-width: 1023px) { .crt-portal-row:not([data-on="true"]) .crt-portal-tech { display: none; } }
                @media (prefers-reduced-motion: reduce) {
                    .crt-portal { height: auto; }
                    .crt-portal-pin { position: relative; height: auto; min-height: 80svh; }
                }
            `}</style>
            <div ref={wrapRef} className="crt-portal">
                <div
                    ref={pinRef}
                    className="crt-portal-pin grid grid-rows-[minmax(0,1fr)_auto] items-center gap-2 px-4 pb-[24svh] pt-[6svh] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-1 lg:gap-12 lg:pl-[6vw] lg:pr-[max(6vw,220px)] lg:pb-[8svh]"
                >
                    <div className="flex h-full min-h-0 items-center justify-center">
                        <div
                            ref={stageRef}
                            data-hairline="crt"
                            data-hairline-theme="dark"
                            role="img"
                            aria-label={copy.label}
                            className="w-[min(100%,calc(min(100%,78svh)*1.25))] max-h-full"
                            // The site's black and bone, and a little more light in the lines than the default dark palette.
                            style={{ "--hairline-plate": "#000", "--hairline-hi": "#f2f0eb", "--hairline-edge": "#7c7e86", "--hairline-mid": "#4a4b52", "--hairline-lo": "#303136" } as React.CSSProperties}
                        />
                    </div>
                    <div className="font-mono">
                        <p ref={pathRef} aria-hidden="true" className="mb-4 text-xs tracking-widest text-[#f2f0eb]/70 lg:mb-8 lg:text-sm">
                            ~/stack
                        </p>
                        <ol ref={listRef} className="flex flex-col">
                            {NAMES.map((name, i) => (
                                <li key={name} data-layer={i} data-on="false" className="crt-portal-row cursor-default py-2 lg:py-4">
                                    <div className="crt-portal-rule mb-2 h-px w-full lg:mb-4" />
                                    <div className="flex items-baseline gap-3 lg:gap-5">
                                        <span className="text-[10px] tracking-widest lg:text-xs">0{i + 1}</span>
                                        <span className="text-base uppercase tracking-[0.2em] lg:text-2xl">{name}</span>
                                        <span className="ml-auto hidden text-right text-[11px] tracking-widest sm:inline lg:text-xs">{(copy.roles as Record<string, string>)[name]}</span>
                                    </div>
                                    <p className="crt-portal-tech mt-1 pl-7 text-[11px] tracking-wider lg:mt-2 lg:pl-9 lg:text-sm">
                                        {LAYER_TECH[name].join(" · ")}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div
                        ref={captionRef}
                        className="absolute inset-x-[6vw] bottom-[4svh] flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-[#f2f0eb]"
                    >
                        <span className="motion-reduce:hidden">{copy.hint}</span>
                        <a href={enterHref} className="inline-flex min-h-11 items-center gap-4">
                            {copy.enter}
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l8 8M10 3.5V10H3.5" /></svg>
                        </a>
                    </div>
                </div>
            </div>
            {children}
        </>
    );
}
