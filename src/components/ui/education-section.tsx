"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Award, Cloud } from 'lucide-react';
import { CpuIcon } from '../cpu';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { UTEC, UTEC2 } from './ascii';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

export default function EducationSection() {
    const { language } = useLanguage();
    const t = translations[language];
    const [cameraView, setCameraView] = useState(1);

    const currentAscii = cameraView === 1 ? UTEC : UTEC2;
    const currentImage = cameraView === 1 ? "/utec3.png" : "/utec4.png";

    return (
        <section id="education" className="bg-black pt-16 pb-4 lg:pt-24 lg:pb-16 relative overflow-hidden flex flex-col justify-center">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-6 md:mb-16">
                    <div className="mb-4">
                        <SectionTitle index="03">{t.education.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.education.background} index="03" />
                </div>


                <div className="max-w-[95%] mx-auto flex flex-col items-center gap-8 md:gap-16 pt-0 md:pt-8">
                    {/* Education Info (Inspired) */}
                    <div className="w-full">
                        <div className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative px-6 md:px-8 py-6 rounded-2xl hover:bg-white/[0.02] overflow-hidden transition-all duration-500 border border-transparent hover:border-white/5">

                            {/* Cinematic Background Image (Idea 1) */}
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                <Image
                                    src="/utec.jpg"
                                    alt="UTEC Campus"
                                    fill
                                    sizes="100vw"
                                    loading="lazy"
                                    className="object-cover grayscale opacity-30 scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out mix-blend-luminosity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/95" />
                                <div className="absolute inset-0 bg-teal-900/20 mix-blend-color" />
                            </div>

                            {/* Subtle left accent that lights up */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-teal-500 rounded-r-full group-hover:h-3/4 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 z-10" />

                            <div className="flex flex-col gap-2 relative z-10">
                                <a
                                    href="https://utec.edu.pe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-xl md:text-2xl font-section font-bold text-white hover:text-teal-400 transition-colors duration-300"
                                >
                                    <CpuIcon className="text-teal-500 group-hover:scale-110 transition-transform duration-300" size={24} />
                                    {t.education.utec}
                                </a>

                                <div className="text-white/50 font-section font-medium text-sm md:text-base flex items-center gap-3 pl-9 mb-1">
                                    <span>{t.education.degree}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="font-mono text-white/40">2024 - 2029</span>
                                </div>

                                <div className="text-teal-400/80 font-medium text-xs md:text-sm flex flex-col gap-2 pl-9 mt-3">
                                    <div className="flex items-start gap-2">
                                        <Award className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{t.education.award}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Cloud className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5">
                                            <span>{t.education.hackathonTitle}</span>
                                            <span className="text-[10.5px] leading-tight md:text-xs text-white/60 font-normal">{t.education.hackathonDesc}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pl-9 md:pl-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 relative z-10">
                                <div className="h-px w-8 bg-teal-500/40" />
                                <span className="text-[10px] font-mono tracking-widest text-teal-400/80 uppercase">{t.education.inProgress}</span>
                            </div>
                        </div>
                    </div>

                    {/* UTEC Glitch ASCII - Below */}
                    <div className="w-full flex justify-center overflow-hidden">
                        <div
                            className="relative group/glitch cursor-pointer transition-transform hover:scale-105 flex justify-center"
                            onClick={() => setCameraView(prev => prev === 1 ? 2 : 1)}
                            title="Click to change camera angle"
                        >
                            {/* Base ASCII */}
                            <pre className="font-mono text-[3px] sm:text-[3px] md:text-[4px] lg:text-[3px] xl:text-[3.5px] leading-[3px] sm:leading-[3px] md:leading-[4px] lg:leading-[3px] xl:leading-[3.5px] text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                                {currentAscii}
                            </pre>

                            {/* Real Image Flash (Glitch Layer) */}
                            <Image
                                src={currentImage}
                                alt="UTEC True Image"
                                fill
                                sizes="(max-width: 768px) 100vw, 600px"
                                loading="lazy"
                                className="object-contain mix-blend-screen opacity-0 animate-glitch-1 group-hover/glitch:opacity-0 z-10 brightness-[1.5] contrast-[1.5] saturate-150"
                            />

                            {/* Glitch Layer 1 */}
                            <pre className="absolute top-0 font-mono text-[3px] sm:text-[3px] md:text-[4px] lg:text-[3px] xl:text-[3.5px] leading-[3px] sm:leading-[3px] md:leading-[4px] lg:leading-[3px] xl:leading-[3.5px] text-cyan-400 mix-blend-screen opacity-0 animate-glitch-1 group-hover/glitch:opacity-0" style={{ textShadow: '-2px 0 0 #0ff' }}>
                                {currentAscii}
                            </pre>
                            {/* Glitch Layer 2 */}
                            <pre className="absolute top-0 font-mono text-[3px] sm:text-[3px] md:text-[4px] lg:text-[3px] xl:text-[3.5px] leading-[3px] sm:leading-[3px] md:leading-[4px] lg:leading-[3px] xl:leading-[3.5px] text-fuchsia-500 mix-blend-screen opacity-0 animate-glitch-2 group-hover/glitch:opacity-0" style={{ textShadow: '2px 0 0 #f0f' }}>
                                {currentAscii}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
