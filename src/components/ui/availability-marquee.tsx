"use client";
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';

export function AvailabilityMarquee() {
    const { language } = useLanguage();
    const items = translations[language].experience.availability;

    // Two identical groups back to back so the -50% loop is seamless
    const group = (key: string) => (
        <div key={key} className="flex shrink-0 items-center">
            {items.map((item) => (
                <div key={item} className="flex items-center">
                    <span className="px-5 font-black text-[11px] tracking-[0.16em] whitespace-nowrap uppercase md:px-9 md:text-sm">
                        {item}
                    </span>
                    <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-black/40 md:h-1.5 md:w-1.5" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-black/15 bg-blue-400 py-3 text-black select-none md:py-4">
            {/* Screen readers get the plain list once, not the duplicated track */}
            <span className="sr-only">{items.join('. ')}</span>

            <div
                aria-hidden="true"
                className="flex w-max animate-[availability-marquee_14s_linear_infinite] motion-reduce:animate-none"
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
