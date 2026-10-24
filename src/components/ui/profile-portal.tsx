"use client";

import { useEffect, useRef } from "react";
import HL from "@/lib/hairline/kernel.js";
import { mountLayers } from "@/lib/hairline/layers.js";
import { useLanguage } from "../../context/LanguageContext";

/** What the read-out says for each piece, bottom of the stack first: database, server rack, AI chip, monitor. */
const LAYERS = {
    en: ["data", "backend", "ai", "interface"],
    es: ["datos", "backend", "ia", "interfaz"],
} as const;

/** How high the piece under the pointer rises, in viewBox units. */
const LIFT = 14;

const portalCopy = {
    en: {
        eyebrow: "// profile",
        role: "Full Stack Development & AI Engineering",
        enter: "About me",
        label: "The stack I build as a small system on a plinth: a database, a server rack, an AI chip and a monitor, tied in a loop by cables.",
    },
    es: {
        eyebrow: "// perfil",
        role: "Full Stack Development & AI Engineering",
        enter: "Sobre mí",
        label: "El stack que construyo como un pequeño sistema sobre una base: una base de datos, un rack de servidores, un chip de IA y un monitor, unidos en un circuito por cables.",
    },
} as const;

export type ProfilePortalProps = {
    /** The section that follows. */
    children: React.ReactNode;
    /** Where the link jumps: the next section's anchor. */
    enterHref: string;
};

/**
 * A short professional introduction beside our Hairline system (a database, a
 * server rack, an AI chip and a monitor on one plinth), carrying on from the
 * ASCII hero. The pieces are the layers of what I build, and the read-out under
 * the figure names the one the pointer picks.
 */
export default function ProfilePortal({ children, enterHref }: ProfilePortalProps) {
    const { language } = useLanguage();
    const copy = portalCopy[language];
    const stageRef = useRef<HTMLDivElement>(null);
    const readRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const stage = stageRef.current!, read = readRef.current!;
        HL.inject(document);
        const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
        read.textContent = "";
        const figure = mountLayers({ stage, svg, read }, LIFT, { names: [...LAYERS[language]] });
        // Walks itself through its answer until a pointer arrives, so it moves on touch screens too.
        const play = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : HL.tour(stage, figure.stops);
        return () => {
            play?.stop();
            figure.destroy();
            svg.remove();
        };
    }, [language]);

    return (
        <>
            <section className="relative flex items-center bg-black pt-24 pb-12 lg:py-12">
                <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 lg:px-8">
                    <div className="flex max-w-xl flex-col gap-6">
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-blue-400/70">{copy.eyebrow}</p>
                        <div className="flex flex-col gap-3">
                            <h2 className="font-section text-4xl font-bold leading-[0.95] tracking-tight text-[#f2f0eb] sm:text-5xl lg:text-6xl">Sebastian Reategui</h2>
                            <p className="font-mono text-xs uppercase tracking-widest text-[#7c7e86]">{copy.role}</p>
                        </div>
                        <a href={enterHref} className="inline-flex min-h-11 w-fit items-center gap-4 font-mono text-xs uppercase tracking-widest text-[#f2f0eb]">
                            {copy.enter}
                            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l8 8M10 3.5V10H3.5" /></svg>
                        </a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div
                            ref={stageRef}
                            data-hairline="layers"
                            data-hairline-theme="dark"
                            role="img"
                            aria-label={copy.label}
                            // Pulls in the figure's own empty margin above and below on desktop, so the section sits closer to its neighbours.
                            className="w-full lg:-my-[6%]"
                            // The site's black and bone, and a little more light in the lines than the default dark palette.
                            style={{ "--hairline-plate": "#000", "--hairline-hi": "#f2f0eb", "--hairline-edge": "#7c7e86", "--hairline-mid": "#4a4b52", "--hairline-lo": "#303136" } as React.CSSProperties}
                        />
                        {/* Above the figure on small screens, where the copilot widget covers the bottom edge; under it from lg up. */}
                        <div aria-hidden="true" className="order-first min-h-4 font-mono text-xs tracking-widest lg:order-last lg:pl-[8%]">
                            <span ref={readRef} className="text-[#7c7e86]" />
                        </div>
                    </div>
                </div>
            </section>
            {children}
        </>
    );
}
