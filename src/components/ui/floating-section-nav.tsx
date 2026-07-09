"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../context/LanguageContext";
import { useLoaderTransition } from "../../context/LoaderTransitionContext";
import { translations } from "../../data/translations";

const SECTIONS = [
    { id: "about", key: "about" as const, short: "ABT" },
    { id: "projects", key: "projects" as const, short: "PRJ" },
    { id: "education", key: "education" as const, short: "EDU" },
    { id: "Skills", key: "skills" as const, short: "STK" },
    { id: "contact", key: "contact" as const, short: "CNT" },
] as const;

export function FloatingSectionNav() {
    const { language } = useLanguage();
    const { phase } = useLoaderTransition();
    const t = translations[language].nav;
    const [mounted, setMounted] = useState(false);
    const [heroInView, setHeroInView] = useState(true);
    const [activeId, setActiveId] = useState<string>("about");

    const visible = phase === "revealed" && !heroInView;

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (phase !== "revealed") return;

        const hero = document.getElementById("hero");
        if (!hero) return;

        const observer = new IntersectionObserver(
            ([entry]) => setHeroInView(entry.isIntersecting),
            { threshold: 0.08 },
        );

        observer.observe(hero);
        return () => observer.disconnect();
    }, [phase]);

    useEffect(() => {
        if (!visible) return;

        const elements = SECTIONS
            .map(({ id }) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const intersecting = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (intersecting[0]?.target.id) {
                    setActiveId(intersecting[0].target.id);
                }
            },
            {
                rootMargin: "-30% 0px -40% 0px",
                threshold: [0, 0.15, 0.35, 0.55, 0.75],
            },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [visible]);

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {visible && (
                <motion.nav
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    aria-label="Section navigation"
                    className="fixed right-2 top-1/2 z-[45] -translate-y-1/2 sm:right-3 lg:right-5"
                >
                    <div className="relative flex flex-col items-end gap-2 px-1 py-2 sm:gap-2.5 sm:px-1.5 sm:py-2.5">
                        <div className="absolute right-[5px] top-2 bottom-2 w-px bg-white/[0.08] sm:right-[6px] sm:top-2.5 sm:bottom-2.5" aria-hidden="true" />

                        {SECTIONS.map(({ id, key, short }) => {
                            const isActive = activeId === id;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleClick(id)}
                                    aria-current={isActive ? "true" : undefined}
                                    aria-label={t[key]}
                                    title={t[key]}
                                    className={cn(
                                        "group relative flex items-center gap-1.5 rounded-sm px-0.5 py-0.5 text-left transition-colors duration-200 sm:gap-2",
                                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25",
                                        isActive ? "text-white/70" : "text-white/25 hover:text-white/45",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "relative z-10 h-1 w-1 shrink-0 rounded-full transition-all duration-200 sm:h-1.5 sm:w-1.5",
                                            isActive
                                                ? "bg-blue-400"
                                                : "bg-white/20 group-hover:bg-white/35",
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="hidden font-mono text-[8px] tracking-[0.16em] uppercase text-inherit sm:inline lg:text-[9px]">
                                        <span className="opacity-40">{short}</span>
                                        <span className="mx-1 opacity-20">/</span>
                                        <span>{t[key]}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>,
        document.body,
    );
}
