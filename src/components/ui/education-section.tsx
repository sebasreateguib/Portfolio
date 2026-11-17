"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Award, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { UTEC, UTEC2 } from './ascii';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

/** One size for the three stacked ASCII layers (120 columns x 56 rows), stepped to fit its column. */
const ASCII_SIZE =
    'text-[3.5px] leading-[3.5px] sm:text-[5px] sm:leading-[5px] lg:text-[4.5px] lg:leading-[4.5px] xl:text-[6px] xl:leading-[6px]';

/** The degree runs 2024 - 2029: one rail segment per calendar year. */
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

/** How much of `year` has passed at `now`, 0..1. Empty until the clock is read on the client. */
function yearFill(year: number, now: number | null) {
    if (now === null) return 0;
    const start = Date.UTC(year, 0, 1);
    const end = Date.UTC(year + 1, 0, 1);
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

export default function EducationSection() {
    const { language } = useLanguage();
    const t = translations[language];
    const [cameraView, setCameraView] = useState(1);
    // Read after mount so server and client render the same markup; the rail then fills in.
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setNow(Date.now()));
        return () => cancelAnimationFrame(frame);
    }, []);

    const currentAscii = cameraView === 1 ? UTEC : UTEC2;
    const currentImage = cameraView === 1 ? "/utec3.png" : "/utec4.png";

    return (
        <section id="education" className="bg-neutral-800 pt-16 pb-4 lg:pt-24 lg:pb-16 relative overflow-hidden flex flex-col justify-center">

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-6 md:mb-16">
                    <div className="mb-4">
                        <SectionTitle index="04">{t.education.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.education.background} index="04" />
                </div>


                <div className="max-w-[95%] mx-auto flex flex-col items-center gap-8 md:gap-16 pt-0 md:pt-8">
                    {/* Education record: same dossier language as the Experience cards */}
                    <div className="w-full">
                        <article className="group relative border border-white/10 bg-neutral-900/70 transition-colors duration-300 hover:border-blue-400/40">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 h-3 w-3 border-t border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                            <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                            <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                            <div className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />

                            {/* Status bar */}
                            <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.01] px-4 py-3 font-mono text-[10px] tracking-widest md:px-6">
                                <div className="flex min-w-0 items-center gap-2 text-white/50">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" aria-hidden="true" />
                                    <span className="truncate uppercase">
                                        EDU_01 <span className="text-white/25">/</span> utec.edu.pe
                                    </span>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] tracking-[0.16em] text-emerald-300 uppercase">
                                    <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" aria-hidden="true" />
                                    {t.education.inProgress}
                                </span>
                            </div>

                            <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                              <div className="flex min-w-0 flex-col">
                                {/* The degree, and how far along it is */}
                                <div className="relative flex flex-1 flex-col justify-between gap-10 overflow-hidden p-6 md:p-8">
                                    {/* Campus photo, faint behind the degree; it lifts a little on hover */}
                                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                        <Image
                                            src="/utec.jpg"
                                            alt=""
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 640px"
                                            loading="lazy"
                                            className="object-cover opacity-[0.14] grayscale transition-opacity duration-500 group-hover:opacity-25 motion-reduce:transition-none"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-neutral-900/20" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                                    </div>

                                    <div className="relative">
                                        <a
                                            href="https://utec.edu.pe"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-start justify-between gap-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                                        >
                                            <h3 className="font-section min-w-0 text-2xl leading-[1.1] font-semibold tracking-tight text-balance break-words text-white transition-colors duration-200 group-hover/link:text-blue-200 group-active/link:text-blue-300 md:text-3xl xl:text-4xl">
                                                {t.education.utec}
                                            </h3>
                                            <ArrowUpRight
                                                className="mt-1 size-5 shrink-0 text-blue-300/70 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0 motion-reduce:group-hover/link:translate-y-0"
                                                aria-hidden="true"
                                            />
                                        </a>
                                        <p className="mt-3 text-sm leading-relaxed text-white/50 md:text-base">{t.education.degree}</p>
                                    </div>

                                    {/* One segment per year, filled up to today */}
                                    <ol className="relative grid grid-cols-6 gap-1.5 font-mono text-[10px] tracking-widest md:gap-2" aria-label="2024 - 2029">
                                        {YEARS.map((year, i) => {
                                            const fill = yearFill(year, now);
                                            return (
                                                <li key={year} className="min-w-0">
                                                    <span className="relative block h-px bg-white/10">
                                                        <span
                                                            className="absolute inset-0 origin-left bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-transform duration-700 ease-out motion-reduce:transition-none"
                                                            style={{ transform: `scaleX(${fill})`, transitionDelay: `${i * 120}ms` }}
                                                        />
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'mt-3 block transition-colors duration-500',
                                                            fill >= 1 ? 'text-blue-300/70' : fill > 0 ? 'text-white' : 'text-white/25',
                                                        )}
                                                    >
                                                        {year}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>

                                {/* What came out of it */}
                                <ul className="grid content-start gap-2 border-t border-white/5 p-6 md:p-8">
                                    <li className="flex items-start gap-3 border border-white/8 bg-white/[0.02] px-4 py-3.5">
                                        <Award className="mt-0.5 size-4 shrink-0 text-blue-300/80" aria-hidden="true" />
                                        <span className="text-sm leading-snug font-medium text-blue-100">{t.education.award}</span>
                                    </li>
                                    <li className="flex items-start gap-3 border border-white/8 bg-white/[0.02] px-4 py-3.5">
                                        <Cloud className="mt-0.5 size-4 shrink-0 text-blue-300/80" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <span className="block text-sm leading-snug font-medium text-blue-100">{t.education.hackathonTitle}</span>
                                            <span className="mt-1.5 block text-[13px] leading-relaxed text-white/50">{t.education.hackathonDesc}</span>
                                        </div>
                                    </li>
                                </ul>
                              </div>

                                {/* The campus, drawn in characters: a viewport inside the record.
                                    Click (or Enter / Space) switches the camera angle. */}
                                <div className="flex min-w-0 flex-col border-t border-white/5 bg-black/40 lg:border-t-0 lg:border-l">
                                    <div className="flex flex-1 items-center justify-center overflow-hidden px-4 py-8 md:py-10">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Click to change camera angle"
                                            className="group/glitch relative flex cursor-pointer justify-center outline-none transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 motion-reduce:transition-none motion-reduce:hover:scale-100"
                                            onClick={() => setCameraView(prev => prev === 1 ? 2 : 1)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    setCameraView(prev => prev === 1 ? 2 : 1);
                                                }
                                            }}
                                            title="Click to change camera angle"
                                        >
                                            {/* Base ASCII */}
                                            <pre className={cn(ASCII_SIZE, 'font-mono text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]')}>
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
                                            <pre className={cn(ASCII_SIZE, 'absolute top-0 font-mono text-cyan-400 mix-blend-screen opacity-0 animate-glitch-1 group-hover/glitch:opacity-0')} style={{ textShadow: '-2px 0 0 #0ff' }} aria-hidden="true">
                                                {currentAscii}
                                            </pre>
                                            {/* Glitch Layer 2 */}
                                            <pre className={cn(ASCII_SIZE, 'absolute top-0 font-mono text-fuchsia-500 mix-blend-screen opacity-0 animate-glitch-2 group-hover/glitch:opacity-0')} style={{ textShadow: '2px 0 0 #f0f' }} aria-hidden="true">
                                                {currentAscii}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Viewport caption: which camera is live */}
                                    <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-3 font-mono text-[10px] tracking-widest text-white/30 uppercase md:px-6">
                                        <span>
                                            <span className="text-blue-300/80">CAM_0{cameraView}</span> <span className="text-white/25">/</span> 02
                                        </span>
                                        <span className="hidden text-white/25 sm:inline">Click to change camera angle</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                </div>

            </div>
        </section>
    );
}
