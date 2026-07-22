"use client";
import React, { useState } from 'react';
import { WarpBackground } from './warp-background';
import { SectionTitle } from './section-title';
import { SectionDivider } from './section-divider';
import { useLanguage } from '../../context/LanguageContext';

import { FrameButton } from './frame-button';
import { Mail, Copy, Check } from 'lucide-react';

export default function FreelanceSection() {
    const { language } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('reateguisebastian1@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative w-full flex justify-center py-10 lg:py-16">
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-8 md:mb-12">
                    <div className="mb-4">
                        <SectionTitle index="06">
                            {language === 'es' ? 'Pasantías y Freelance' : 'Internships & Freelance Work'}
                        </SectionTitle>
                    </div>
                    <SectionDivider label="AVAILABLE_FOR_HIRE" index="06" />
                </div>

                <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
                    <WarpBackground
                        className="w-full h-[280px] md:h-[340px] text-left flex flex-col items-center justify-center border-white/10 bg-black overflow-hidden"
                        gridColor="rgba(255, 255, 255, 0.08)"
                    >
                        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 md:p-5 max-w-[350px] shadow-2xl relative z-10 text-center">
                            <h2 className="text-sm md:text-base font-bold tracking-tight text-white mb-2 font-sans">
                                {language === 'es' ? '¡Abierto a proyectos freelance y pasantías!' : 'Open to freelance projects and internships!'}
                            </h2>
                            <p className="text-[#a1a1aa] text-xs leading-relaxed font-sans">
                                {language === 'es'
                                    ? '¡Construyamos algo increíble juntos! ¡Contáctame!'
                                    : "Let's build something amazing together. Feel free to reach out!"}
                            </p>
                        </div>
                    </WarpBackground>

                    {/* Text outside the component */}
                    <div className="text-center max-w-xl mt-2 px-2">
                        <p className="text-[10px] sm:text-xs md:text-base text-gray-300 font-mono leading-relaxed mb-6">
                            {language === 'es'
                                ? 'Actualmente disponible para trabajo freelance y pasantías en desarrollo Full Stack: Frontend (Landing Pages, Dashboards, etc.) y Backend con arquitecturas de Microservicios o Serverless.'
                                : "I'm currently available for freelance work and internships in Full Stack Development: Frontend (Landing Pages, Dashboards, etc.) and Backend development with Microservices or Serverless architectures."}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
                            <FrameButton
                                as="button"
                                type="button"
                                onClick={handleCopyEmail}
                                variant="default"
                                className="w-full sm:w-auto text-[11px] md:text-xs px-5 py-3 gap-2"
                                size={12}
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copied
                                    ? (language === 'es' ? '¡Email Copiado!' : 'Email Copied!')
                                    : (language === 'es' ? 'Copiar Email' : 'Copy Email')}
                            </FrameButton>

                            <FrameButton
                                as="link"
                                href={language === 'es' 
                                    ? "https://wa.me/51947546421?text=Hola%20Sebasti%C3%A1n,%20vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20conversar%20sobre%20un%20proyecto."
                                    : "https://wa.me/51947546421?text=Hi%20Sebasti%C3%A1n,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                className="w-full sm:w-auto text-[11px] md:text-xs px-5 py-3 gap-2 text-emerald-400 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/10"
                                size={12}
                            >
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                WhatsApp
                            </FrameButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
