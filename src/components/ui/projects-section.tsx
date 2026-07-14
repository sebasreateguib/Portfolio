"use client";
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import { TerminalIcon } from '../term-icon';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { ViewportVideo } from './viewport-video';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

const projectDetails = {
    en: {
        eyebrow: 'FEATURED',
        roleLabel: 'ROLE',
        stackLabel: 'STACK',
        signalsLabel: 'SYSTEM SIGNALS',
        details: 'View details',
        hideDetails: 'Hide details',
        repo: 'View Code',
        demo: 'Live Demo',
        unavailable: 'Demo soon',
        projects: {
            1: {
                category: 'Fintech Analytics',
                role: 'Core Full-Stack, Cloud & Data Engineer',
                signals: ['Serverless ETL', 'Multi-service backend', 'Analytical querying'],
            },
            2: {
                category: 'Healthcare Platform',
                role: 'Core Full-Stack Developer',
                signals: ['JWT auth', 'Video consultations', 'Realtime chat'],
            },
            3: {
                category: 'Systems / Data Structures',
                role: 'Core Developer',
                signals: ['Sparse matrix core', 'Formula support', '2D / 3D visualization'],
            },
            4: {
                category: 'Intelligent Medical Triage',
                role: 'Core Serverless Engineer',
                signals: ['Event-driven architecture', 'SQS decoupled queues', 'Llama 3 AI extraction'],
            },
            5: {
                category: 'Restaurant Platform',
                role: 'Backend Serverless Engineer',
                signals: ['Event-driven architecture', 'AWS Step Functions', 'Wait for Callback pattern'],
            },
            6: {
                category: 'Algorithms / Physics Engine',
                role: 'C++ Systems Programmer',
                signals: ['QuadTree algorithm', 'Server-Sent Events (SSE)', 'Vue.js interactive canvas'],
            },
        },
    },
    es: {
        eyebrow: 'FEATURED',
        roleLabel: 'ROL',
        stackLabel: 'STACK',
        signalsLabel: 'SEÑALES DEL SISTEMA',
        details: 'Ver detalles',
        hideDetails: 'Ocultar detalles',
        repo: 'Ver código',
        demo: 'Demo en vivo',
        unavailable: 'Demo pronto',
        projects: {
            1: {
                category: 'Analítica Fintech',
                role: 'Core Full-Stack, Cloud & Data Engineer',
                signals: ['ETL serverless', 'Backend multiservicio', 'Consultas analíticas'],
            },
            2: {
                category: 'Plataforma de Salud',
                role: 'Core Full-Stack Developer',
                signals: ['Auth JWT', 'Video consultas', 'Chat en tiempo real'],
            },
            3: {
                category: 'Sistemas / Estructuras de Datos',
                role: 'Core Developer',
                signals: ['Núcleo matriz dispersa', 'Soporte de fórmulas', 'Visualización 2D / 3D'],
            },
            4: {
                category: 'Triaje Médico Inteligente',
                role: 'Core Serverless Engineer',
                signals: ['Arquitectura orientada a eventos', 'Colas desacopladas (SQS)', 'Extracción IA con Llama 3'],
            },
            5: {
                category: 'Plataforma de Restaurante',
                role: 'Backend Serverless Engineer',
                signals: ['Arquitectura orientada a eventos', 'AWS Step Functions', 'Patrón Wait for Callback'],
            },
            6: {
                category: 'Algoritmos / Motor Físico',
                role: 'C++ Systems Programmer',
                signals: ['Algoritmo QuadTree', 'Server-Sent Events (SSE)', 'Canvas interactivo Vue.js'],
            },
        },
    },
} as const;

export default function ProjectsSection() {
    const { language } = useLanguage();
    const t = translations[language];
    const copy = projectDetails[language];
    const [expandedProject, setExpandedProject] = useState<number | null>(null);

    return (
        <section id="projects" className="bg-black py-16 lg:py-24 relative overflow-hidden [content-visibility:auto] [contain-intrinsic-size:900px]">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"></div>
            <div className="absolute inset-x-0 top-1/3 h-56 bg-blue-500/10 blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-10 md:mb-16">
                    <div className="mb-4">
                        <SectionTitle index="02">{t.projects.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.projects.featured} className="mb-0" index="02" />
                </div>

                {/* Swipe Marquee Ticker */}
                <div className="mb-6 w-full border-y border-white/[0.07] bg-white/[0.015] py-3 overflow-hidden relative">
                    {/* Edge fades */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #000, transparent)' }} />

                    {/* Scrolling track */}
                    <div className="flex whitespace-nowrap" style={{ animation: 'ticker-scroll 8s linear infinite' }}>
                        {/* Repeat enough copies to fill any screen */}
                        {Array.from({ length: 6 }).map((_, i) => (
                            <span key={i} className="flex items-center gap-4 px-4 font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase select-none shrink-0">
                                <span className="text-white/30">{language === 'es' ? 'Desliza para explorar' : 'Swipe to explore'}</span>
                                <span className="text-blue-400/50">→</span>
                                <span className="text-white/20">{language === 'es' ? 'Más proyectos disponibles' : 'More projects available'}</span>
                                <span className="text-blue-400/50">→</span>
                                <span className="text-white/30">{language === 'es' ? 'Arrastra hacia la derecha' : 'Drag to the right'}</span>
                                <span className="text-blue-400/50">→</span>
                            </span>
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes ticker-scroll {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>

                {/* Projects Grid / Mobile Carousel */}
                <div className="flex gap-5 lg:gap-6 overflow-x-auto pt-4 pb-8 md:pb-4 snap-x snap-mandatory scroll-px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                    {t.projects.list.map((project, index) => {
                        const meta = copy.projects[project.id as keyof typeof copy.projects];
                        const isExpanded = expandedProject === project.id;
                        const isLiveAvailable = project.live && project.live !== '#';

                        return (
                            <div
                                key={project.id}
                                className="group relative flex w-[88vw] shrink-0 snap-center flex-col overflow-hidden border border-white/10 bg-[#050505] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.18),0_28px_100px_rgba(37,99,235,0.16)] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)]"
                            >
                                <div className="absolute top-0 left-0 z-30 h-3 w-3 border-l border-t border-white/40 transition-colors duration-300 group-hover:border-blue-300"></div>
                                <div className="absolute top-0 right-0 z-30 h-3 w-3 border-r border-t border-white/40 transition-colors duration-300 group-hover:border-blue-300"></div>
                                <div className="absolute bottom-0 left-0 z-30 h-3 w-3 border-b border-l border-white/40 transition-colors duration-300 group-hover:border-blue-300"></div>
                                <div className="absolute bottom-0 right-0 z-30 h-3 w-3 border-b border-r border-white/40 transition-colors duration-300 group-hover:border-blue-300"></div>

                                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-3 font-mono text-[10px] tracking-widest">
                                    <div className="flex items-center gap-2 text-white/50">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]"></span>
                                        <span>{copy.eyebrow}_{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <span className="text-blue-200/70">YEAR.{project.year}</span>
                                </div>

                                {project.image && (
                                    <div className="relative h-52 overflow-hidden border-b border-white/10 bg-blue-950/10 md:h-48 lg:h-52">
                                        {project.image.endsWith('.mp4') || project.image.endsWith('.webm') ? (
                                            <ViewportVideo
                                                src={project.image}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                                            />
                                        ) : (
                                            <>
                                                {/* Glitch / Tint Overlay (Images only) */}
                                                <div className="absolute inset-0 bg-blue-900/40 mix-blend-color z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                                                <Image
                                                    src={project.image}
                                                    alt={project.title}
                                                    fill
                                                    sizes="(max-width: 768px) 85vw, 33vw"
                                                    loading="lazy"
                                                    className="object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                                />
                                            </>
                                        )}
                                        <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.28)_1px,transparent_1px)] bg-size-[100%_4px]"></div>
                                        <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-linear-to-t from-[#050505] to-transparent pointer-events-none"></div>
                                        <div className="absolute left-4 top-4 z-30 rounded-full border border-blue-300/30 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-blue-100 backdrop-blur">
                                            {meta.category}
                                        </div>
                                    </div>
                                )}

                                <div className="relative z-30 flex flex-1 flex-col p-5">
                                    <div className="mb-4">
                                        <span className="mb-2 block font-mono text-[10px] tracking-widest text-blue-300">SYS.{project.year}</span>
                                        <h3 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-blue-300">
                                            <TerminalIcon className="shrink-0 text-blue-400" size={20} />
                                            {project.title}
                                        </h3>
                                    </div>

                                    <p className="mb-5 text-sm leading-relaxed text-white/62">
                                        {project.description}
                                    </p>



                                    <div className={`${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'} overflow-hidden transition-all duration-300`}>


                                        <div className="mb-6">
                                            <div className="mb-3 font-mono text-[10px] tracking-widest text-white/40">{copy.stackLabel}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {project.tech.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="border border-blue-400/20 bg-blue-400/10 px-2 py-1 font-mono text-[10px] text-blue-200"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-col gap-3">
                                        <button
                                            type="button"
                                            aria-expanded={isExpanded}
                                            onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                                            className="flex min-h-11 items-center justify-between border border-white/10 px-4 py-2 font-mono text-xs tracking-widest text-white/70 transition-colors duration-200 hover:border-blue-400/40 hover:text-white md:hidden"
                                        >
                                            {isExpanded ? copy.hideDetails : copy.details}
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex min-h-11 items-center justify-center gap-2 border border-white/15 bg-white text-sm font-bold text-black transition-colors duration-200 hover:bg-blue-100"
                                            >
                                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                {copy.repo}
                                            </a>
                                            <a
                                                href={isLiveAvailable ? project.live : undefined}
                                                target={isLiveAvailable ? '_blank' : undefined}
                                                rel={isLiveAvailable ? 'noopener noreferrer' : undefined}
                                                aria-disabled={!isLiveAvailable}
                                                className={`flex min-h-11 items-center justify-center gap-2 border text-sm font-bold transition-colors duration-200 ${isLiveAvailable ? 'border-blue-400/50 bg-blue-400/10 text-blue-100 hover:bg-blue-400/20' : 'pointer-events-none border-white/10 bg-white/[0.03] text-white/35'}`}
                                            >
                                                {isLiveAvailable ? copy.demo : copy.unavailable}
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 z-20 h-full w-full -translate-y-full bg-linear-to-b from-transparent via-blue-400/5 to-transparent opacity-0 pointer-events-none group-hover:animate-scanline group-hover:opacity-100"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
