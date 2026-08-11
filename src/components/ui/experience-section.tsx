"use client";
import { useState } from 'react';
import { ChevronDown, ExternalLink, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';
import { AvailabilityLED } from './availability-led';

export default function ExperienceSection() {
    const { language } = useLanguage();
    const t = translations[language];
    const copy = t.experience;
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <section id="experience" className="bg-transparent py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/4 h-56 bg-blue-500/8 blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-10 md:mb-16">
                    <div className="mb-4">
                        <SectionTitle index="04">{copy.title}</SectionTitle>
                    </div>
                    <SectionDivider label={copy.badge} className="mb-0" index="04" />
                </div>

                {/* Availability LED board */}
                <div className="mb-10 md:mb-14">
                    <AvailabilityLED />
                </div>

                {/* Timeline */}
                <ol className="relative mx-auto max-w-4xl pt-2">
                    {/* Vertical rail */}
                    <div
                        className="absolute left-[9px] top-3 bottom-3 w-px md:left-[11px]"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(96,165,250,0.55) 0%, rgba(96,165,250,0.18) 55%, transparent 100%)',
                        }}
                        aria-hidden="true"
                    />

                    {copy.list.map((item) => {
                        const isExpanded = expanded === item.id;

                        return (
                            <li key={item.id} className="relative pb-10 pl-10 last:pb-0 md:pl-16">
                                {/* Timeline node */}
                                <span className="absolute left-0 top-2 flex h-[19px] w-[19px] items-center justify-center md:h-[23px] md:w-[23px]" aria-hidden="true">
                                    <span className="absolute inset-0 rounded-full border border-blue-400/30 bg-black" />
                                    {item.ongoing && (
                                        <span className="absolute inset-0 animate-ping rounded-full border border-blue-400/40" style={{ animationDuration: '2.6s' }} />
                                    )}
                                    <span className="relative h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)] md:h-2 md:w-2" />
                                </span>

                                {/* Card */}
                                <article className="group relative border border-white/5 bg-[#030303] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01),0_24px_80px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-blue-400/40 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.18),0_28px_100px_rgba(37,99,235,0.16)] md:p-6">
                                    {/* Corner brackets */}
                                    <div className="absolute top-0 left-0 z-30 h-3 w-3 border-l border-t border-white/30 transition-colors duration-300 group-hover:border-blue-300"></div>
                                    <div className="absolute top-0 right-0 z-30 h-3 w-3 border-r border-t border-white/30 transition-colors duration-300 group-hover:border-blue-300"></div>
                                    <div className="absolute bottom-0 left-0 z-30 h-3 w-3 border-b border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300"></div>
                                    <div className="absolute bottom-0 right-0 z-30 h-3 w-3 border-b border-r border-white/30 transition-colors duration-300 group-hover:border-blue-300"></div>

                                    {/* Connector from rail to card */}
                                    <span className="absolute -left-10 top-[18px] hidden h-px w-10 bg-linear-to-r from-blue-400/40 to-white/5 md:-left-16 md:block md:w-16" aria-hidden="true" />

                                    {/* Header row */}
                                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-blue-300 md:text-xl">
                                                {item.role}
                                            </h3>
                                            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
                                                <span className="font-medium text-white/75">{item.company}</span>
                                                <span className="h-1 w-1 rounded-full bg-white/20" />
                                                <span className="font-mono text-[11px] tracking-wide text-blue-200/70 uppercase">{item.type}</span>
                                            </p>
                                        </div>

                                        {/* Date / status */}
                                        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                                            <span className="font-mono text-[11px] tracking-widest text-white/45">
                                                {item.period} <span className="text-white/20">·</span> {item.duration}
                                            </span>
                                            {item.ongoing && (
                                                <span className="inline-flex items-center gap-1.5 border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-emerald-300 uppercase">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                                                    {copy.current}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location + focus */}
                                    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] tracking-wide text-white/35 uppercase">
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3 text-blue-400/60" />
                                            {item.location}
                                        </span>
                                        <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block" />
                                        <span className="text-white/30">{item.focus}</span>
                                    </div>

                                    <p className="mb-5 text-sm leading-relaxed text-white/62">
                                        {item.summary}
                                    </p>

                                    {/* Clients — one linked panel per delivered site */}
                                    {item.clients.length > 0 && (
                                        <div className="mb-5">
                                            <div className="mb-3 font-mono text-[10px] tracking-widest text-white/40">{copy.clientsLabel}</div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {item.clients.map((client) => (
                                                    <a
                                                        key={client.name}
                                                        href={client.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group/client flex flex-col gap-1.5 border border-white/8 bg-white/[0.02] p-3 transition-colors duration-200 hover:border-blue-400/45 hover:bg-blue-400/[0.06]"
                                                    >
                                                        <span className="flex items-center justify-between gap-2">
                                                            <span className="text-[13px] font-semibold text-blue-100">{client.name}</span>
                                                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-300/70 transition-transform duration-200 group-hover/client:scale-110" />
                                                        </span>
                                                        <span className="text-[12px] leading-relaxed text-white/45">{client.detail}</span>
                                                        <span className="mt-auto pt-1 font-mono text-[10px] tracking-wide text-white/25">
                                                            {client.link.replace(/^https?:\/\//, '')}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stack */}
                                    <div className="mb-5">
                                        <div className="mb-3 font-mono text-[10px] tracking-widest text-white/40">{copy.stackLabel}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tech.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="border border-blue-400/20 bg-blue-400/10 px-2 py-1 font-mono text-[10px] text-blue-200"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Highlights — collapsed on mobile, always open from md up */}
                                    <div className={`${isExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[900px] md:opacity-100'} overflow-hidden transition-all duration-300`}>
                                        <div className="mb-3 font-mono text-[10px] tracking-widest text-white/40">{copy.highlightsLabel}</div>
                                        <ul className="flex flex-col gap-2">
                                            {item.highlights.map((highlight) => (
                                                <li key={highlight} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/55">
                                                    <span className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-blue-400/70" aria-hidden="true" />
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-5 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            aria-expanded={isExpanded}
                                            onClick={() => setExpanded(isExpanded ? null : item.id)}
                                            className="flex min-h-11 items-center justify-between border border-white/10 px-4 py-2 font-mono text-xs tracking-widest text-white/70 transition-colors duration-200 hover:border-blue-400/40 hover:text-white md:hidden"
                                        >
                                            {copy.highlightsLabel}
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Scanline sweep on hover */}
                                    <div className="pointer-events-none absolute inset-0 z-20 h-full w-full -translate-y-full bg-linear-to-b from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:animate-scanline group-hover:opacity-100"></div>
                                </article>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
