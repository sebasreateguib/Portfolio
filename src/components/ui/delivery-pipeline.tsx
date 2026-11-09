"use client";

import { useEffect, useRef, useState } from "react";
import HL from "@/lib/hairline/kernel.js";
import { mountPipeline } from "@/lib/hairline/pipeline.js";
import { useLanguage } from "../../context/LanguageContext";
import { AGENTIC_TOOLS, STACK_GROUPS } from "../../data/stack";
import { SectionTitle } from "./section-title";
import { SectionDivider } from "./section-divider";

/** How far a tool comes down onto the parcel, in viewBox units. */
const DROP = 12;

/** Every logo in the stack and the agentic card, by name; a chip without one is a practice, not a tool. */
const LOGOS = new Map([...STACK_GROUPS.flatMap((group) => group.logos), ...AGENTIC_TOOLS].map((logo) => [logo.name, logo.image]));

const copy = {
    en: {
        title: "How I Ship",
        badge: "Delivery Pipeline",
        lead: "From a blank page to production, every project rides the same line. Point at a station to see what happens there.",
        figure: "fig. 01 — delivery.pipeline",
        prompt: "run",
        idle: "pick a stage",
        names: ["design", "code", "test", "deploy"],
        desc: [
            "Understand the problem first: requirements, architecture and the data model.",
            "Build in small, reviewed commits, with AI as co-pilot and me as the architect.",
            "Check every endpoint and run it through CI before anything ships.",
            "Ship it to the cloud, serverless wherever it fits.",
        ],
        tools: [
            ["Architecture", "Data modeling", "API design"],
            ["Git", "GitHub", "Cursor", "Claude Code"],
            ["Postman", "Jenkins", "Docker"],
            ["AWS", "GCP", "Vercel", "Cloudflare"],
        ],
        label: "A parcel, the project, on a conveyor belt that runs under four gantries: a stylus that sketches, a press that builds, a scanner that checks and a gripper that lifts it off the line.",
    },
    es: {
        title: "Cómo Entrego",
        badge: "Pipeline de Entrega",
        lead: "De una página en blanco a producción, cada proyecto recorre la misma línea. Pasa el cursor por una estación para ver qué pasa ahí.",
        figure: "fig. 01 — delivery.pipeline",
        prompt: "run",
        idle: "elige una etapa",
        names: ["diseño", "código", "test", "deploy"],
        desc: [
            "Primero entender el problema: requisitos, arquitectura y modelo de datos.",
            "Construir en commits pequeños y revisados, con la IA como copiloto y yo como arquitecto.",
            "Probar cada endpoint y pasarlo por CI antes de que algo salga.",
            "Desplegarlo en la nube, serverless donde encaje.",
        ],
        tools: [
            ["Arquitectura", "Modelado de datos", "Diseño de APIs"],
            ["Git", "GitHub", "Cursor", "Claude Code"],
            ["Postman", "Jenkins", "Docker"],
            ["AWS", "GCP", "Vercel", "Cloudflare"],
        ],
        label: "Una caja, el proyecto, sobre una cinta transportadora que pasa bajo cuatro pórticos: un lápiz que bosqueja, una prensa que construye, un escáner que revisa y una pinza que la saca de la línea.",
    },
} as const;

type Figure = ReturnType<typeof mountPipeline>;

const CORNERS = [
    "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
];

/**
 * How a project gets from idea to production, as the Hairline conveyor: four
 * gantries over a belt, and a parcel that rides to whichever one is picked.
 * The stages sit under the figure in the same order as the line, and pointing
 * at either picks the same stage in both. Until a pointer arrives the figure
 * walks the line itself, so on touch screens the stages play along with it.
 */
export default function DeliveryPipeline() {
    const { language } = useLanguage();
    const t = copy[language];
    const stageRef = useRef<HTMLDivElement>(null);
    const readRef = useRef<HTMLSpanElement>(null);
    const figureRef = useRef<Figure | null>(null);
    const tourRef = useRef<{ stop: () => void } | null>(null);
    const startTourRef = useRef<() => void>(() => {});
    const [active, setActive] = useState(-1);

    useEffect(() => {
        const stage = stageRef.current!, read = readRef.current!;
        HL.inject(document);
        const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
        read.textContent = "";
        const figure = mountPipeline({ stage, svg, read }, DROP, { names: [...t.names], onPick: setActive });
        figureRef.current = figure;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        startTourRef.current = () => {
            if (reduced || tourRef.current) return;
            tourRef.current = HL.tour(stage, figure.stops);
        };
        startTourRef.current();
        return () => {
            tourRef.current?.stop();
            tourRef.current = null;
            figure.destroy();
            figureRef.current = null;
            svg.remove();
        };
    }, [t]);

    /** A stage takes over from the tour while it is pointed at or focused, and hands back when left. */
    const pickStage = (i: number) => {
        tourRef.current?.stop();
        tourRef.current = null;
        figureRef.current?.pick(i);
    };
    const leaveStages = () => {
        figureRef.current?.pick(-1);
        startTourRef.current();
    };

    return (
        <section id="pipeline" className="relative overflow-hidden bg-black py-16 lg:py-24">
            {/* A faint drafting grid, fading out from the line. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(60%_50%_at_50%_45%,black,transparent)]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            <div className="container relative z-10 mx-auto px-6 lg:px-8">
                <div className="mb-10 md:mb-14">
                    <div className="mb-4">
                        <SectionTitle>{t.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.badge} className="md:mb-8" />
                    <p className="max-w-2xl font-mono text-[13px] leading-[1.65] text-white/60">{t.lead}</p>
                </div>

                {/* The line, framed like a plate in a technical drawing; the stages are its legend, in a row below it. */}
                <div className="relative border border-dashed border-white/15">
                    {CORNERS.map((pos) => (
                        <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} select-none font-mono text-sm text-white/30`}>+</span>
                    ))}
                    <div className="flex items-center justify-between border-b border-dashed border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-widest text-white/35 md:text-[10px]">
                        <span>{t.figure}</span>
                        <span className="text-white/20">400 × 320</span>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-col border-b border-dashed border-white/10">
                            <div
                                ref={stageRef}
                                data-hairline="pipeline"
                                data-hairline-theme="dark"
                                role="img"
                                aria-label={t.label}
                                className="mx-auto w-full max-w-[680px] px-2 sm:px-6 lg:-my-[2%]"
                                // The site's black and bone, with a little more light in the lines than the default dark palette.
                                style={{ "--hairline-plate": "#000", "--hairline-hi": "#f2f0eb", "--hairline-edge": "#7c7e86", "--hairline-mid": "#4a4b52", "--hairline-lo": "#303136" } as React.CSSProperties}
                            />
                            <div aria-hidden="true" className="mt-auto flex items-center gap-2 border-t border-dashed border-white/10 px-4 py-3 font-mono text-xs tracking-wider">
                                <span className="text-blue-400">guest@sreategui:~$</span>
                                <span className="text-white/50">{t.prompt}</span>
                                <span ref={readRef} className="text-[#f2f0eb]" />
                                {active < 0 && <span className="text-white/25">— {t.idle}</span>}
                                <span className="inline-block h-[1.1em] w-1.5 animate-pulse bg-blue-400 align-middle" />
                            </div>
                        </div>

                        {/* The stages, left to right in the order of the line. */}
                        <ol
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                            onPointerLeave={leaveStages}
                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) leaveStages(); }}
                        >
                            {t.names.map((name, i) => {
                                const on = active === i;
                                return (
                                    <li
                                        key={name}
                                        className={`border-dashed border-white/10 lg:border-t-0 ${i > 0 ? "border-t" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 0 ? "sm:border-r" : ""} ${i < 3 ? "lg:border-r" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            onPointerEnter={(e) => { if (e.pointerType === "mouse") pickStage(i); }}
                                            onFocus={() => pickStage(i)}
                                            onClick={() => pickStage(i)}
                                            aria-pressed={on}
                                            className={`relative flex h-full w-full flex-col gap-3 p-5 text-left outline-none transition-colors duration-300 focus-visible:bg-white/[0.03] md:p-6 ${on ? "bg-white/[0.025]" : ""}`}
                                        >
                                            {/* The accent rail, drawn in when the stage is picked. */}
                                            <span aria-hidden="true" className={`absolute left-0 top-0 h-px bg-blue-400 transition-[width] duration-500 ease-out ${on ? "w-full" : "w-0"}`} />
                                            <span className="flex items-center justify-between">
                                                <span className={`font-mono text-[10px] font-bold tracking-widest transition-colors duration-300 ${on ? "text-blue-400" : "text-white/25"}`}>
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                {i < t.names.length - 1 && (
                                                    <span aria-hidden="true" className={`font-mono text-[10px] transition-colors duration-300 ${on ? "text-white/40" : "text-white/15"}`}>→</span>
                                                )}
                                            </span>
                                            <span className={`font-section text-lg font-semibold uppercase tracking-[0.08em] transition-colors duration-300 md:text-xl ${on ? "text-white" : "text-white/45"}`}>
                                                {name}
                                            </span>
                                            <span className={`font-mono text-[12px] leading-[1.6] transition-colors duration-300 ${on ? "text-white/60" : "text-white/30"}`}>
                                                {t.desc[i]}
                                            </span>
                                            <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
                                                {t.tools[i].map((tool) => {
                                                    const logo = LOGOS.get(tool);
                                                    return (
                                                        <span
                                                            key={tool}
                                                            className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10.5px] transition-colors duration-300 ${on ? "border-white/15 bg-white/[0.05] text-white/75" : "border-white/[0.06] text-white/35"}`}
                                                        >
                                                            {logo && (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={logo} alt="" className={`h-3 w-3 object-contain transition-opacity duration-300 ${on ? "opacity-100" : "opacity-40"}`} loading="lazy" />
                                                            )}
                                                            {tool}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}
