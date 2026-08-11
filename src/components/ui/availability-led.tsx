"use client";
import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import LEDDisplay from './led-display';

export function AvailabilityLED() {
    const { language } = useLanguage();
    const items = translations[language].experience.availability;
    const [compact, setCompact] = useState(false);

    // Smaller dots on phones so a few characters still fit on the board
    useEffect(() => {
        const query = window.matchMedia('(max-width: 767px)');
        setCompact(query.matches);
        const onChange = () => setCompact(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    // The LED font is uppercase-only; " / " stands in for the marquee's "//"
    const text = `${items.join(' / ')} / `;

    return (
        <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-black/25 bg-blue-400 py-1.5 text-black select-none md:py-2">
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

            {/* Screen readers get the plain list, not the dot matrix */}
            <span className="sr-only">{items.join('. ')}</span>

            <div aria-hidden="true" className="relative z-10">
                <LEDDisplay
                    text={text}
                    speed={40}
                    dotColor="#000000"
                    dotSize={compact ? 3 : 4}
                    fade
                    className="!p-0"
                />
            </div>
        </div>
    );
}
