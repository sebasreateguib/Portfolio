"use client";
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';

export function AvailabilityMarquee() {
    const { language } = useLanguage();
    const items = translations[language].experience.availability;
    const bandRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    // Only animate while the band is on screen — off-screen it stays paused
    // (not restarted), so it picks up where it left off when scrolled back.
    useEffect(() => {
        const band = bandRef.current;
        if (!band) return;

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { rootMargin: '100px 0px' },
        );
        observer.observe(band);

        return () => observer.disconnect();
    }, []);

    // Two identical groups back to back so the -50% loop is seamless
    const group = (key: string) => (
        <div key={key} className="flex shrink-0 items-center">
            {items.map((item) => (
                <div key={item} className="flex items-center">
                    <span className="flex items-center gap-2 px-5 md:gap-2.5 md:px-9">
                        <span className="font-mono text-[10px] font-bold text-black/45 md:text-xs">&gt;_</span>
                        <span className="font-black text-[11px] tracking-[0.16em] whitespace-nowrap uppercase md:text-sm">
                            {item}
                        </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] font-bold text-black/35 md:text-sm">//</span>
                </div>
            ))}
        </div>
    );

    return (
        <div
            ref={bandRef}
            className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-black/25 bg-blue-400 py-3 text-black select-none md:py-4"
        >
            {/* Blueprint grid texture */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(to right, rgba(0,0,0,0.07) 0 1px, transparent 1px 8px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.05) 0 1px, transparent 1px 8px)',
                }}
                aria-hidden="true"
            />

            {/* Inset hairlines — technical-drawing border */}
            <div className="pointer-events-none absolute inset-x-0 top-[3px] h-px bg-black/20" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-[3px] h-px bg-black/20" aria-hidden="true" />

            {/* Screen readers get the plain list once, not the duplicated track */}
            <span className="sr-only">{items.join('. ')}</span>

            <div
                aria-hidden="true"
                className="relative z-10 flex w-max animate-[availability-marquee_14s_linear_infinite] motion-reduce:animate-none"
                style={{ animationPlayState: inView ? 'running' : 'paused' }}
            >
                {group('a')}
                {group('b')}
            </div>

            <style>{`
                @keyframes availability-marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
