"use client";
import React from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { VercelCard } from './vercel-card';
import PixelBackground from './pixel-background';

export default function AgenticWorkflow() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section className="bg-black py-16 lg:py-24 px-6 relative overflow-hidden flex items-center justify-center min-h-[400px]">
             {/* Subtle Background Grid */}
             <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

             <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-2xl mx-auto">
                 <VercelCard 
                     showIcons={true} 
                     bordered={true} 
                     glowEffect={false}
                     className="bg-[#050505] border-white/10"
                     contentClassName="p-0"
                     iconClassName="text-white/20"
                 >
                     <PixelBackground 
                         className="w-full h-full p-5 sm:p-6 md:p-10 rounded-xl"
                         colors="#7a3015,#d97757,#e2967d,#050505"
                         opacity={0.3}
                         gap={8}
                         speed={60}
                     >
                         <div className="flex flex-col items-center justify-center text-center">
                             <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6 tracking-tight drop-shadow-lg text-center">
                                 {t.agentic.title}
                             </h2>
                             
                             <div className="inline-block bg-[#d97757]/90 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#d97757] mb-4 md:mb-8 shadow-[0_0_15px_rgba(217,119,87,0.3)] transform rotate-1">
                                 <p className="text-white font-mono text-[10px] sm:text-xs md:text-sm tracking-widest uppercase font-bold flex items-center gap-1.5">
                                     <Zap size={12} className="fill-white text-white" />
                                     {t.agentic.subtitle}
                                 </p>
                             </div>
                             
                             <p className="text-gray-400 font-mono text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-0 drop-shadow-md">
                                 {t.agentic.desc}
                             </p>
                         </div>
                     </PixelBackground>
                 </VercelCard>
             </div>
        </section>
    );
}
