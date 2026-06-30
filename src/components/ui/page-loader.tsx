"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import TypingKeyboard from "./typing-keyboard";
import { LOGO } from "./ascii";
import { AnimatePresence, motion } from "framer-motion";
import {
    LoaderTransitionContext,
    type LoaderPhase,
} from "@/context/LoaderTransitionContext";

const TYPING_SPEED: [number, number] = [40, 90];
const AUTO_TYPE_TEXT = "init";
const POST_BOOT_DELAY_MS = 1000;
const REDUCED_MOTION_DELAY_MS = 400;
const TRANSITION_DURATION_MS = 650;

const BOOT_SEQUENCE = [
    "Loading kernel modules...",
    "Mounting root filesystem... OK",
    "Initializing web components...",
    "Establishing secure connection...",
    "Starting portfolio interface...",
];

type MarginLog = {
    at: number;
    side: "left" | "right";
    text: string;
    tone?: "ok" | "wait" | "dim";
};

const MARGIN_LOGS: MarginLog[] = [
    { at: 4, side: "left", text: "[ OK ] next dev --turbo", tone: "ok" },
    { at: 10, side: "right", text: "[ .. ] resolving routes", tone: "wait" },
    { at: 18, side: "left", text: "[ OK ] webpack compiled", tone: "ok" },
    { at: 26, side: "right", text: "[ OK ] /api/chat ready", tone: "ok" },
    { at: 34, side: "left", text: "[ OK ] /api/contact ready", tone: "ok" },
    { at: 42, side: "right", text: "[ .. ] hydrating components", tone: "wait" },
    { at: 52, side: "left", text: "[ OK ] src/components/ui/*", tone: "ok" },
    { at: 60, side: "right", text: "[ OK ] framer-motion loaded", tone: "ok" },
    { at: 68, side: "left", text: "[ .. ] prefetching hero assets", tone: "wait" },
    { at: 76, side: "right", text: "[ OK ] Herov2.mp4 cached", tone: "ok" },
    { at: 84, side: "left", text: "[ OK ] portfolio manifest", tone: "ok" },
    { at: 92, side: "right", text: "[ OK ] secure connection", tone: "ok" },
];

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setPrefersReducedMotion(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    return prefersReducedMotion;
}

function LoaderBackdrop() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "repeat",
                }}
            />
        </div>
    );
}

function LoaderAsciiGhost({ visible }: { visible: boolean }) {
    return (
        <motion.pre
            aria-hidden="true"
            initial={false}
            animate={{ opacity: visible ? 0.045 : 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute top-1/2 left-1/2 z-[1] m-0 -translate-x-1/2 -translate-y-[58%] font-mono text-[7px] leading-none whitespace-pre text-blue-400 select-none sm:text-[8px] lg:text-[9px]"
        >
            {LOGO}
        </motion.pre>
    );
}

function logToneClass(tone: MarginLog["tone"]) {
    if (tone === "ok") return "text-emerald-400/70";
    if (tone === "wait") return "text-amber-300/60";
    return "text-white/35";
}

function LogColumn({
    entries,
    align,
    progress,
    visible,
}: {
    entries: MarginLog[];
    align: "left" | "right";
    progress: number;
    visible: boolean;
}) {
    return (
        <div
            aria-hidden="true"
            className={`hidden min-h-0 flex-col gap-2 font-mono text-[10px] leading-snug xl:flex ${
                align === "left"
                    ? "items-start justify-self-end text-left"
                    : "items-end justify-self-start text-right"
            }`}
        >
            {entries.map((entry, index) => {
                const isShown = visible && progress >= entry.at;
                return (
                    <motion.span
                        key={`${align}-${index}`}
                        initial={false}
                        animate={{ opacity: isShown ? 1 : 0, x: isShown ? 0 : align === "left" ? -8 : 8 }}
                        transition={{ duration: 0.25 }}
                        className={`max-w-[14rem] truncate ${logToneClass(entry.tone)}`}
                    >
                        {entry.text}
                    </motion.span>
                );
            })}
        </div>
    );
}

function MetricBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "emerald" | "amber" }) {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    const fillClass =
        tone === "emerald"
            ? "bg-emerald-400/80"
            : tone === "amber"
              ? "bg-amber-300/80"
              : "bg-[#60a5fa]/80";

    return (
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${fillClass}`} style={{ width: `${clamped}%` }} />
        </div>
    );
}

function LoaderSystemMetrics({
    progress,
    visible,
}: {
    progress: number;
    visible: boolean;
}) {
    const mem = useMemo(() => 34 + progress * 0.28, [progress]);
    const cpu = useMemo(() => 18 + Math.sin(progress / 14) * 12 + progress * 0.08, [progress]);
    const netMs = useMemo(() => Math.max(8, Math.round(46 - progress * 0.28)), [progress]);

    return (
        <motion.div
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
            transition={{ duration: 0.25 }}
            className="mt-3 w-full max-w-xs px-4 font-mono text-[10px] text-white/40 sm:max-w-sm"
        >
            <div className="grid grid-cols-[2.25rem_1fr_2rem] items-center gap-x-2 gap-y-2 sm:grid-cols-[2.5rem_1fr_2.5rem]">
                <span>MEM</span>
                <MetricBar value={mem} tone="blue" />
                <span className="text-right tabular-nums">{Math.round(mem)}%</span>

                <span>CPU</span>
                <MetricBar value={cpu} tone="emerald" />
                <span className="text-right tabular-nums">{Math.round(cpu)}%</span>

                <span>NET</span>
                <MetricBar value={Math.max(12, 100 - netMs)} tone="amber" />
                <span className="text-right tabular-nums">▲ {netMs}ms</span>
            </div>
        </motion.div>
    );
}

function LoaderProgress({
    progress,
    statusLine,
    visible,
}: {
    progress: number;
    statusLine: string;
    visible: boolean;
}) {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));

    return (
        <motion.div
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
            transition={{ duration: 0.25 }}
            className="-mt-10 w-full max-w-xs px-4 sm:-mt-6 sm:max-w-sm xl:mt-6"
        >
            <div className="mb-1.5 flex items-center justify-between gap-3 font-mono text-xs text-white/50">
                <span aria-live="polite" className="min-w-0 truncate">
                    {statusLine}
                </span>
                <span className="shrink-0 tabular-nums">{clamped}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-[#60a5fa] transition-[width] duration-300 ease-out motion-reduce:transition-none"
                    style={{ width: `${clamped}%` }}
                    role="progressbar"
                    aria-valuenow={clamped}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Loading portfolio"
                />
            </div>
        </motion.div>
    );
}

function LoaderCornerLabels({ visible }: { visible: boolean }) {
    return (
        <>
            <motion.span
                aria-hidden="true"
                animate={{ opacity: visible ? 0.35 : 0 }}
                className="pointer-events-none absolute top-5 left-5 z-[3] hidden font-mono text-[10px] tracking-widest text-white/50 sm:block"
            >
                guest@sreategui
            </motion.span>
            <motion.span
                aria-hidden="true"
                animate={{ opacity: visible ? 0.35 : 0 }}
                className="pointer-events-none absolute top-5 right-5 z-[3] hidden font-mono text-[10px] tracking-widest text-white/50 sm:block"
            >
                boot v1.0
            </motion.span>
        </>
    );
}

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [phase, setPhase] = useState<LoaderPhase>("loading");
    const [isTypingDone, setIsTypingDone] = useState(false);
    const [skipHeroTypewriter, setSkipHeroTypewriter] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusLine, setStatusLine] = useState("Initializing...");

    const handleProgressUpdate = useCallback((value: number, status: string) => {
        setProgress(Math.round(value * 100));
        setStatusLine(status);
    }, []);

    const beginReveal = useCallback(() => {
        setSkipHeroTypewriter(true);

        if (prefersReducedMotion) {
            setPhase("revealed");
            return;
        }

        setPhase("transitioning");
        window.setTimeout(() => setPhase("revealed"), TRANSITION_DURATION_MS);
    }, [prefersReducedMotion]);

    const handleTypingComplete = useCallback(() => {
        setIsTypingDone(true);
    }, []);

    useEffect(() => {
        if (!prefersReducedMotion) return;

        setProgress(0);
        setStatusLine("Loading portfolio...");

        const start = Date.now();
        const tick = window.setInterval(() => {
            const elapsed = Date.now() - start;
            const next = Math.min(100, (elapsed / REDUCED_MOTION_DELAY_MS) * 100);
            setProgress(next);
            if (next >= 100) {
                setStatusLine("Portfolio ready.");
            }
        }, 50);

        const timer = window.setTimeout(() => {
            setSkipHeroTypewriter(true);
            setPhase("revealed");
        }, REDUCED_MOTION_DELAY_MS);

        return () => {
            clearInterval(tick);
            clearTimeout(timer);
        };
    }, [prefersReducedMotion]);

    useEffect(() => {
        if (prefersReducedMotion || !isTypingDone) return;
        const timer = window.setTimeout(() => beginReveal(), POST_BOOT_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isTypingDone, prefersReducedMotion, beginReveal]);

    useEffect(() => {
        if (phase === "revealed") return;

        const previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = previousOverflow;
        };
    }, [phase]);

    const showOverlay = phase === "loading" || phase === "transitioning";
    const isTransitioning = phase === "transitioning";
    const useInstantExit = prefersReducedMotion;
    const chromeVisible = phase === "loading";

    return (
        <LoaderTransitionContext.Provider value={{ phase, skipHeroTypewriter }}>
            <motion.div
                initial={false}
                animate={{
                    opacity: phase === "loading" ? 0 : 1,
                    scale: phase === "loading" ? 1.015 : 1,
                    filter: phase === "loading" ? "blur(6px)" : "blur(0px)",
                }}
                transition={{
                    duration: useInstantExit ? 0.2 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isTransitioning && !useInstantExit ? 0.12 : 0,
                }}
                className={
                    phase === "loading"
                        ? "pointer-events-none invisible fixed inset-0 overflow-hidden"
                        : undefined
                }
                aria-hidden={phase === "loading"}
            >
                {children}
            </motion.div>

            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        key="loader-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: useInstantExit ? 0 : -20 }}
                        transition={{
                            duration: useInstantExit ? 0.2 : 0.5,
                            ease: "easeInOut",
                        }}
                        className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-hidden bg-[#0a0a0a]"
                        animate={{
                            backgroundColor: isTransitioning
                                ? "rgba(10,10,10,0)"
                                : "rgba(10,10,10,1)",
                        }}
                    >
                        <LoaderBackdrop />
                        <LoaderCornerLabels visible={chromeVisible} />

                        <div
                            className="pointer-events-none absolute inset-0 z-[3] opacity-30 motion-reduce:opacity-0"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0, 0, 0, 0.8) 2px, rgba(0, 0, 0, 0.8) 4px)",
                            }}
                        />

                        {/*
                         * Layout:
                         * - mobile  → single centered column, keyboard overflows clipped symmetrically
                         * - xl+     → 3-column grid: logs | keyboard | logs
                         */}
                        <div className="relative z-10 flex w-full flex-col items-center xl:grid xl:max-w-7xl xl:grid-cols-[1fr_auto_1fr] xl:items-center xl:gap-6 xl:px-8">

                            {/* left logs — desktop only */}
                            <LogColumn
                                entries={MARGIN_LOGS.filter((e) => e.side === "left")}
                                align="left"
                                progress={progress}
                                visible={chromeVisible}
                            />

                            {/* center: keyboard + progress + metrics */}
                            <motion.div
                                animate={
                                    isTransitioning
                                        ? { scale: 0.92, opacity: 0, y: -20 }
                                        : { scale: 1, opacity: 1, y: 0 }
                                }
                                transition={{
                                    duration: useInstantExit ? 0.2 : 0.45,
                                    ease: [0.4, 0, 0.2, 1],
                                }}
                                className="flex w-full flex-col items-center xl:w-auto"
                            >
                                {prefersReducedMotion ? (
                                    <p className="font-mono text-sm tracking-wide text-white/80">
                                        Sebastian Reategui
                                    </p>
                                ) : (
                                    /*
                                     * On mobile: overflow-x-hidden clips the 800px tk-main
                                     * symmetrically so it appears centered.
                                     * On xl+: -mb-44 cancels the ~175px of empty DOM space at
                                     * the bottom of tk-main so the grid centers on the visual
                                     * keyboard, not the full 600px box.
                                     */
                                    <div className="h-[350px] w-full [overflow-x:clip] sm:h-[380px] md:h-[500px] xl:h-auto xl:-mb-44">
                                        <TypingKeyboard
                                            autoTypeText={AUTO_TYPE_TEXT}
                                            loop={false}
                                            initialDelay={400}
                                            accentColor="#111111"
                                            secondaryAccent="#60a5fa"
                                            screenColor="#111111"
                                            onComplete={handleTypingComplete}
                                            onProgressUpdate={handleProgressUpdate}
                                            typingSpeed={TYPING_SPEED}
                                            bootSequence={BOOT_SEQUENCE}
                                        />
                                    </div>
                                )}

                                <LoaderProgress
                                    progress={progress}
                                    statusLine={statusLine}
                                    visible={chromeVisible}
                                />
                                <LoaderSystemMetrics progress={progress} visible={chromeVisible} />
                            </motion.div>

                            {/* right logs — desktop only */}
                            <LogColumn
                                entries={MARGIN_LOGS.filter((e) => e.side === "right")}
                                align="right"
                                progress={progress}
                                visible={chromeVisible}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LoaderTransitionContext.Provider>
    );
}
