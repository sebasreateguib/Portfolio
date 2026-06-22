"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { openCopilot } from '../../lib/copilot-events';

export default function TopBanner() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="w-full bg-[#050505] border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center relative overflow-hidden">
            <motion.div
                className="absolute inset-0 w-1/3 h-full bg-linear-to-r from-transparent via-blue-500/10 to-transparent"
                initial={{ x: '-100vw' }}
                animate={{ x: '100vw' }}
                transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "linear"
                }}
            />

            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 w-full max-w-4xl px-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-green-400 shrink-0">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_1px_rgba(34,197,94,0.6)]" />
                    {t.banner.live}
                </span>

                <p className="text-[11px] sm:text-xs text-white/70 font-mono leading-none min-w-0">
                    <span className="sm:hidden">{t.banner.textShort}</span>
                    <span className="hidden sm:inline">{t.banner.text}</span>
                </p>

                <button
                    type="button"
                    onClick={openCopilot}
                    className="hidden sm:inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-blue-300 transition-colors hover:bg-blue-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 shrink-0 cursor-pointer"
                    aria-label={t.banner.cta}
                >
                    {t.banner.cta}
                    <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
