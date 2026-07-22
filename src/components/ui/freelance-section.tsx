"use client";
import React from 'react';
import { WarpBackground } from './warp-background';
import { SectionTitle } from './section-title';
import { SectionDivider } from './section-divider';
import { useLanguage } from '../../context/LanguageContext';

export default function FreelanceSection() {
    const { language } = useLanguage();

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
                    <SectionDivider label={language === 'es' ? 'DISPONIBLE PARA CONTRATAR' : 'AVAILABLE FOR HIRE'} index="06" />
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
                    <div className="text-center max-w-xl mt-2">
                        <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">
                            {language === 'es'
                                ? 'Actualmente disponible para trabajo freelance y pasantías en desarrollo Full Stack: Frontend (Landing Pages, Dashboards, etc.) y Backend con arquitecturas de Microservicios o Serverless.'
                                : "I'm currently available for freelance work and internships in Full Stack Development: Frontend (Landing Pages, Dashboards, etc.) and Backend development with Microservices or Serverless architectures."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
