"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LoaderTransitionContext,
    type LoaderPhase,
} from "@/context/LoaderTransitionContext";
import { useLanguage } from "@/context/LanguageContext";
import { DiaTextReveal } from "@/components/ui/dia-text";

const LOADER_DISPLAY_MS = 2000;
const REDUCED_MOTION_DELAY_MS = 450;
const TRANSITION_DURATION_MS = 650;
/** How long the intro's S.REATEGUI takes to fly into the header logo's place. */
const FLIGHT_MS = 750;

/**
 * The intro's logo travels from the centre to the header logo (`data-hero-logo`):
 * where it took off (pinned there, so a viewport resize mid-flight, like a phone's
 * address bar, can't move it off course), the offset and the scale.
 */
type Flight = {
    from: DOMRect;
    /** Centre and width of the slanted text at take-off, which the offset and scale are measured from. */
    cx: number;
    cy: number;
    w: number;
    x: number;
    y: number;
    scale: number;
    /** A short correction after landing, when the header logo turned out to have moved. */
    settling?: boolean;
};

/** Where the header logo is now: its centre and width (slanted box, like the take-off's). */
function measureTarget() {
    const to = document.querySelector<HTMLElement>("[data-hero-logo]")?.getBoundingClientRect();
    return to && to.width > 0 ? { cx: to.left + to.width / 2, cy: to.top + to.height / 2, w: to.width } : null;
}

const LOADER_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#ffffff"];

const loaderCopy = {
    en: "Projects, code & a bit of me inside.",
    es: "Proyectos, código y un poco de mí adentro.",
} as const;

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

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    const line = loaderCopy[language];
    const prefersReducedMotion = usePrefersReducedMotion();
    const [phase, setPhase] = useState<LoaderPhase>("loading");
    const logoRef = useRef<HTMLDivElement>(null);
    const [flight, setFlight] = useState<Flight | null>(null);

    const beginReveal = useCallback(() => {
        if (prefersReducedMotion) {
            setPhase("revealed");
            return;
        }

        // First the logo flies to the header logo's place (the page is laid out
        // behind the overlay, so it can be measured), then the hero appears under it.
        const from = logoRef.current?.getBoundingClientRect();
        // The slanted text itself on both ends (its box widens with the skew), so the
        // scale and centres compare like with like.
        const text = (logoRef.current?.firstElementChild as HTMLElement | null)?.getBoundingClientRect();
        const to = measureTarget();
        const canFly = from && text && to && text.width > 0;
        if (canFly) {
            const cx = text.left + text.width / 2;
            const cy = text.top + text.height / 2;
            setFlight({ from, cx, cy, w: text.width, x: to.cx - cx, y: to.cy - cy, scale: to.w / text.width });
        }
        window.setTimeout(() => {
            setPhase("transitioning");
            window.setTimeout(() => setPhase("revealed"), TRANSITION_DURATION_MS);
        }, canFly ? FLIGHT_MS : 0);
    }, [prefersReducedMotion]);

    useEffect(() => {
        const delay = prefersReducedMotion ? REDUCED_MOTION_DELAY_MS : LOADER_DISPLAY_MS;
        const timer = window.setTimeout(beginReveal, delay);
        return () => clearTimeout(timer);
    }, [prefersReducedMotion, beginReveal]);

    useEffect(() => {
        if (phase === "revealed") window.dispatchEvent(new CustomEvent("portfolio:loader-done"));
        // Scrolling unlocks as soon as the logo has landed, not at the very end: whatever
        // the unlock shifts (a scrollbar, a phone's toolbar) happens while the landed
        // logo can still follow it (see the settling effect below).
        if (phase !== "loading") {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            return;
        }

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, [phase]);

    // After landing, check where the header logo really is (once the unlock has laid
    // out, and again a little later) and, if it moved, slide the landed logo onto it
    // before the swap, so it parks exactly in its place.
    useEffect(() => {
        if (phase !== "transitioning") return;
        const settle = () =>
            setFlight((f) => {
                const to = f && measureTarget();
                if (!f || !to) return f;
                const x = to.cx - f.cx;
                const y = to.cy - f.cy;
                const scale = to.w / f.w;
                if (Math.abs(x - f.x) < 0.5 && Math.abs(y - f.y) < 0.5 && Math.abs(scale - f.scale) < 0.002) return f;
                return { ...f, x, y, scale, settling: true };
            });
        const frame = requestAnimationFrame(settle);
        const later = window.setTimeout(settle, 300);
        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(later);
        };
    }, [phase]);

    const showOverlay = phase === "loading" || phase === "transitioning";
    const isTransitioning = phase === "transitioning";
    const useInstantExit = prefersReducedMotion;

    return (
        <LoaderTransitionContext.Provider
            value={{ phase, skipHeroTypewriter: false }}
        >
            {/* Only opacity and scale are animated here: both are compositor-only.
                A `filter: blur()` on this wrapper forced the browser to rasterize
                the entire document to a texture and re-blur it every frame, which
                on mobile blew the frame budget and made the reveal snap. */}
            <motion.div
                initial={false}
                // Opacity only: a scale here would shift the header logo out from under
                // the intro's logo that just landed on it.
                animate={{ opacity: phase === "loading" ? 0 : 1 }}
                transition={{
                    duration: useInstantExit ? 0.2 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: isTransitioning && !useInstantExit ? 0.12 : 0,
                }}
                // The content stays in normal flow while loading (hidden behind the
                // opaque overlay, and unscrollable via the overflow lock below).
                // It used to be `invisible fixed inset-0`, so revealing it relaid
                // out the whole document in the same frame the animation started.
                className={phase === "loading" ? "pointer-events-none" : undefined}
                aria-hidden={phase === "loading"}
            >
                {children}
            </motion.div>

            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        key="loader-overlay"
                        initial={{ opacity: 1 }}
                        // By the end only the landed logo is left on a transparent overlay: it
                        // goes in the same frame the header logo appears (hero-ascii.tsx), with
                        // no cross-fade, so the two are never seen at once.
                        exit={{ opacity: 0, transition: { duration: useInstantExit ? 0.2 : 0 } }}
                        transition={{
                            duration: useInstantExit ? 0.2 : 0.5,
                            ease: "easeInOut",
                        }}
                        className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-hidden bg-black"
                        animate={{
                            backgroundColor: isTransitioning
                                ? "rgba(0,0,0,0)"
                                : "rgba(0,0,0,1)",
                        }}
                        role="status"
                        aria-live="polite"
                        aria-label={line}
                    >


                        {/* The intro's logo: the header's S.REATEGUI, larger. It flies into the
                            header logo's place, settles onto it if the header moved, and is
                            swapped for the real one in a single frame. */}
                        <motion.div
                            ref={logoRef}
                            initial={false}
                            animate={flight ? { x: flight.x, y: flight.y, scale: flight.scale } : { x: 0, y: 0, scale: 1 }}
                            style={
                                flight
                                    ? {
                                          position: "fixed",
                                          left: flight.from.left,
                                          top: flight.from.top,
                                          width: flight.from.width,
                                          height: flight.from.height,
                                      }
                                    : undefined
                            }
                            transition={
                                flight?.settling
                                    ? { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                                    : { duration: FLIGHT_MS / 1000, ease: [0.76, 0, 0.24, 1] }
                            }
                            className="relative z-10"
                        >
                            <div className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest italic transform -skew-x-12 select-none">
                                <DiaTextReveal
                                    text="S.REATEGUI"
                                    colors={LOADER_COLORS}
                                    textColor="#ffffff"
                                    duration={1.4}
                                    delay={0.15}
                                    startOnView={false}
                                    once
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LoaderTransitionContext.Provider>
    );
}
