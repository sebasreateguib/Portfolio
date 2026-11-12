"use client";

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { openCopilot } from '../../lib/copilot-events';

const BRAND = 'SR Copilot';

function Highlighted({ text }: { text: string }) {
    const parts = text.split(BRAND);
    return (
        <>
            {parts.map((part, i) => (
                <span key={i}>
                    {part}
                    {i < parts.length - 1 && <span className="font-medium text-white">{BRAND}</span>}
                </span>
            ))}
        </>
    );
}

export default function TopBanner() {
    const { language } = useLanguage();
    const t = translations[language];
    const [modKey, setModKey] = useState('⌘');

    useEffect(() => {
        if (!/Mac|iPhone|iPad/i.test(navigator.userAgent)) setModKey('Ctrl');
    }, []);

    return (
        <button
            type="button"
            onClick={openCopilot}
            aria-label={`${t.banner.cta}: ${t.banner.text}`}
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden bg-[#050505] px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/30"
        >
            {/* Hairline gradient border */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
            />
            {/* Soft glow, revealed on hover */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
            />

            <span className="relative z-10 flex min-w-0 max-w-4xl items-center gap-3 sm:gap-4">
                <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 [animation-duration:2.4s]" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    </span>
                    {t.banner.live}
                </span>

                <span aria-hidden="true" className="hidden text-white/20 sm:inline">·</span>

                <span className="font-mono min-w-0 truncate text-[11px] sm:text-xs leading-none text-white/50">
                    <span className="sm:hidden"><Highlighted text={t.banner.textShort} /></span>
                    <span className="hidden sm:inline"><Highlighted text={t.banner.text} /></span>
                </span>

                <span aria-hidden="true" className="hidden text-white/20 sm:inline">·</span>

                <span className="font-mono relative hidden shrink-0 items-center gap-1.5 text-xs leading-none text-white sm:inline-flex">
                    {t.banner.cta}
                    <ArrowRight
                        className="h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>

                <ArrowRight className="h-3 w-3 shrink-0 text-white/60 sm:hidden" aria-hidden="true" />

                <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] leading-none text-white/40 md:inline-flex">
                    {modKey}
                    <span>K</span>
                </kbd>
            </span>
        </button>
    );
}
