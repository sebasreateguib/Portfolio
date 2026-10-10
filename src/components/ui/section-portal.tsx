"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GlyphPortal from "@/components/portal";
import { useLanguage } from "../../context/LanguageContext";

/** Scroll travel through the portal, in viewport heights. */
const SCROLL_LENGTH = 2;
/** The portal's progress (0–1) at which the letter fills the screen. */
const ZOOM_DONE = 0.78;
/**
 * The portal's progress over which the letters dim into the sheet while the
 * camera closes in, so the screen fills with the sheet's black instead of a
 * flash of light before the next section shows.
 */
const LETTERS_DIM: [number, number] = [0.4, 0.7];
/**
 * The next section is pulled up under the end of the portal so it sits
 * exactly in view the moment the zoom finishes: the portal's own trailing
 * screen (SCROLL_LENGTH + 1 viewports long) minus the travel to that moment.
 */
const OVERLAP = `${-((1 - ZOOM_DONE) * SCROLL_LENGTH + 1) * 100}svh`;

/** A heavy mono for the word (Geist Mono, loaded in the root layout). */
const FONT_VAR = "--font-portal";
const FONT = `var(${FONT_VAR}), ui-monospace, monospace`;
const FONT_WEIGHT = 800;

const portalCopy = {
    en: { hint: "Scroll to enter.", enter: "Enter" },
    es: { hint: "Haz scroll para entrar.", enter: "Entrar" },
} as const;

const smooth = (a: number, b: number, n: number) => {
    const t = Math.min(1, Math.max(0, (n - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

/** Mixes two #rrggbb colours; t = 0 is `a`, t = 1 is `b`. */
function mix(a: string, b: string, t: number) {
    const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    const out = [0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t));
    return `rgb(${out.join(",")})`;
}

export type SectionPortalProps = {
    /** The word cut into the sheet. */
    word: string;
    /** The section uncovered when the portal fades; it follows the portal. */
    children: React.ReactNode;
    /** Where the enter link jumps: the revealed section's anchor. */
    enterHref: string;
    /** The sheet (#rrggbb); it stays this colour throughout. */
    sheet?: string;
    /** The letters (#rrggbb); they dim into the sheet as the camera flies in. */
    letters?: string;
    /**
     * How far the portal tucks up into the previous section's tail. The sheet
     * is opaque, so any tuck covers the end of that section.
     */
    tuck?: string;
};

/**
 * A word on a sheet: bone letters on black, carrying on from a black section
 * above. Once pinned, the camera flies into a letter while the letters dim
 * into the black, and as it fills the screen the whole portal fades away,
 * uncovering the next section already in place.
 */
export default function SectionPortal({
    word,
    children,
    enterHref,
    sheet = "#000000",
    letters = "#f2f0eb",
    tuck = "0px",
}: SectionPortalProps) {
    const { language } = useLanguage();
    const copy = portalCopy[language];
    const wrapRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLElement | null>(null);
    // The portal freezes whatever face is loaded when it mounts, and keeps
    // still if the face is still pending, so remount it once the face is in.
    const [fontReady, setFontReady] = useState(false);

    useEffect(() => {
        const family = getComputedStyle(document.documentElement).getPropertyValue(FONT_VAR).trim();
        if (!family) return;
        let cancelled = false;
        document.fonts.load(`${FONT_WEIGHT} 100px ${family}`, word)
            .catch(() => {})
            .then(() => { if (!cancelled) setFontReady(true); });
        return () => { cancelled = true; };
    }, [word]);

    const onProgress = useCallback((progress: number) => {
        // The portal remounts once the font loads, which replaces the pin.
        if (!pinRef.current?.isConnected) pinRef.current = wrapRef.current?.querySelector<HTMLElement>("[data-gp-pin]") ?? null;
        const pin = pinRef.current;
        if (!pin) return;
        const letterColour = mix(letters, sheet, smooth(LETTERS_DIM[0], LETTERS_DIM[1], progress));
        pin.style.setProperty("--section-portal-letters", letterColour);
        pin.style.color = letters;
        pin.style.opacity = String(1 - smooth(0.7, ZOOM_DONE, progress));
    }, [sheet, letters]);

    return (
        <div ref={wrapRef}>
            {/* While the camera moves, the pin is an opaque sheet above the next
                section; nothing in the portal takes clicks except the caption. */}
            <style>{`
                .section-portal { position: relative; z-index: 20; pointer-events: none; }
                .section-portal [data-gp-content] { pointer-events: none !important; }
                .section-portal[data-gp-motion=on] { margin-top: var(--section-portal-tuck); }
                .section-portal [data-gp-pin] { background: var(--section-portal-sheet); color: var(--section-portal-letters); }
                .section-portal [data-gp-hint] { color: inherit; }
                .section-portal[data-gp-motion=on] + .section-portal-after { margin-top: ${OVERLAP}; }
            `}</style>
            <GlyphPortal
                key={fontReady ? "font" : "fallback"}
                word={word}
                interactive={false}
                fontFamily={FONT}
                fontWeight={FONT_WEIGHT}
                scrollLength={SCROLL_LENGTH}
                hint={copy.hint}
                enterLabel={copy.enter}
                enterHref={enterHref}
                onProgress={onProgress}
                className="section-portal font-mono uppercase tracking-widest"
                style={{
                    // The section stays clear so the next one shows where they
                    // overlap; the colours live on the pin.
                    "--gp-paper": "transparent",
                    "--gp-field": sheet,
                    ["--section-portal-tuck" as string]: tuck,
                    ["--section-portal-sheet" as string]: sheet,
                    ["--section-portal-letters" as string]: letters,
                }}
                background={
                    <div className="absolute inset-0" style={{ background: "var(--section-portal-letters)" }} />
                }
            >
                <></>
            </GlyphPortal>
            <div className="section-portal-after relative">{children}</div>
        </div>
    );
}
