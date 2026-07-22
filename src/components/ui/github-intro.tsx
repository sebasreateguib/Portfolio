"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CommitsGrid } from './commits-grid';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

/* ─── Animation Variants ─────────────────────────────────────── */
const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const },
    },
};

/* ─── Live Clock Widget ──────────────────────────────────────── */
function LiveClock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!time) return null;

    const limaTime = new Date(time.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const hours = limaTime.getHours();
    const minutes = limaTime.getMinutes().toString().padStart(2, '0');
    const seconds = limaTime.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = (hours % 12 || 12).toString().padStart(2, '0');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = dayNames[limaTime.getDay()];
    const isWorking = hours >= 9 && hours < 22;

    // Clock face — sweep angle per second/minute/hour
    const sDeg = (limaTime.getSeconds() / 60) * 360;
    const mDeg = ((limaTime.getMinutes() + limaTime.getSeconds() / 60) / 60) * 360;
    const hDeg = (((hours % 12) + limaTime.getMinutes() / 60) / 12) * 360;

    return (
        <div className="border-t border-white/8 px-5 py-4">
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.18em] mb-3">Local Time · Lima, PE</p>
            <div className="flex items-center gap-4">
                {/* Analog mini-clock */}
                <div className="relative w-10 h-10 shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                        <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        {/* Hour ticks */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const a = (i / 12) * 360;
                            const r = (Math.PI * a) / 180;
                            const x1 = 20 + 16 * Math.sin(r);
                            const y1 = 20 - 16 * Math.cos(r);
                            const x2 = 20 + 18.5 * Math.sin(r);
                            const y2 = 20 - 18.5 * Math.cos(r);
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
                        })}
                        {/* Hour hand */}
                        <line
                            x1="20" y1="20"
                            x2={20 + 9 * Math.sin((Math.PI * hDeg) / 180)}
                            y2={20 - 9 * Math.cos((Math.PI * hDeg) / 180)}
                            stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"
                        />
                        {/* Minute hand */}
                        <line
                            x1="20" y1="20"
                            x2={20 + 13 * Math.sin((Math.PI * mDeg) / 180)}
                            y2={20 - 13 * Math.cos((Math.PI * mDeg) / 180)}
                            stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round"
                        />
                        {/* Second hand */}
                        <line
                            x1="20" y1="20"
                            x2={20 + 15 * Math.sin((Math.PI * sDeg) / 180)}
                            y2={20 - 15 * Math.cos((Math.PI * sDeg) / 180)}
                            stroke="#60a5fa" strokeWidth="0.8" strokeLinecap="round"
                        />
                        <circle cx="20" cy="20" r="1.2" fill="#60a5fa" />
                    </svg>
                </div>
                {/* Digital readout */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[18px] font-mono font-bold text-white tracking-tight leading-none">
                        {hour12}:{minutes}
                        <span className="text-[11px] text-white/40 ml-1">{ampm}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-[9px] font-mono text-white/35">
                            {day} · {isWorking ? 'Working hours' : 'Off hours'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Availability Status Widget ────────────────────────────── */
function AvailabilityStatus() {
    return (
        <div className="border-t border-white/8 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-[0.18em]">Available for opportunities</p>
            </div>
            <div className="flex flex-col gap-2">
                {[
                    { label: 'Type', value: 'Internship · Freelance' },
                    { label: 'Mode', value: 'Remote · Hybrid' },
                    { label: 'From', value: 'Immediately' },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-baseline justify-between gap-2">
                        <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider shrink-0">{label}</span>
                        <span className="text-[10px] font-mono text-white/60 text-right">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Now Playing Widget ─────────────────────────────────────── */

/* ─── Tag Pill ───────────────────────────────────────────────── */
function TagPill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono tracking-wider text-blue-300/80 border border-blue-400/20 bg-blue-500/5 uppercase">
            {children}
        </span>
    );
}

/* ─── Bullet Row ─────────────────────────────────────────────── */
function BulletRow({ emoji, html }: { emoji: string; html: string }) {
    return (
        <li className="flex items-start gap-3 group">
            <span className="mt-0.5 w-5 h-5 flex items-center justify-center text-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{emoji}</span>
            <span
                className="text-[13px] text-white/50 leading-[1.7] font-mono group-hover:text-white/70 transition-colors duration-300"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </li>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function GithubIntro() {
    const { language } = useLanguage();
    const t = translations[language];
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section id="about" className="container mx-auto px-4 lg:px-8 py-16 relative z-10">
            {/* Section Header */}
            <div className="mb-10">
                <div className="mb-4">
                    <SectionTitle index="01">{t.nav.about}</SectionTitle>
                </div>
                <SectionDivider label="README.md" index="01" />
            </div>

            <motion.div
                ref={ref}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="w-full"
            >
                {/* ── Main Card ── */}
                <motion.div
                    variants={itemVariants}
                    className="relative w-full bg-[#030303] border border-white/5 overflow-hidden"
                >
                    {/* Top edge accent line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-400/50 to-transparent" />

                    {/* ── Top bar: filename tag ── */}
                    <div className="relative flex items-center justify-between border-b border-white/5 px-5 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            </div>
                            <span className="ml-2 text-[10px] font-mono text-white/30 tracking-widest uppercase">README.md</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400/60">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse" />
                            sebasreateguib
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="relative flex flex-col lg:flex-row">

                        {/* ── Left Column: Avatar + Stats ── */}
                        <div className="lg:w-[260px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/8">

                            {/* Avatar area */}
                            <div className="flex flex-col items-center justify-center px-8 py-10 gap-5">
                                {/* Avatar with luminous ring */}
                                <div className="relative group cursor-pointer">
                                    {/* Glow layers */}
                                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl scale-125 group-hover:bg-blue-500/35 transition-all duration-500" />
                                    <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-2xl scale-150 group-hover:scale-[1.7] transition-all duration-700" />

                                    {/* Ring */}
                                    <div className="relative w-[108px] h-[108px] rounded-full border border-blue-400/30 p-[3px] group-hover:border-blue-400/60 transition-colors duration-300">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                            {/* Pixelate SVG Filter */}
                                            <svg width="0" height="0" className="absolute">
                                                <filter id="pixelate-v2" x="0" y="0">
                                                    <feFlood x="2" y="2" height="1" width="1" />
                                                    <feComposite width="4" height="4" />
                                                    <feTile result="a" />
                                                    <feComposite in="SourceGraphic" in2="a" operator="in" />
                                                    <feMorphology operator="dilate" radius="2" />
                                                </filter>
                                            </svg>
                                            {/* Normal image */}
                                            <div className="absolute inset-0">
                                                <Image
                                                    src="/Anime Avatar.png"
                                                    alt="Sebastian Reategui"
                                                    fill
                                                    sizes="108px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            {/* Pixelated overlay — fades on hover */}
                                            <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300 hidden md:block">
                                                <Image
                                                    src="/Anime Avatar.png"
                                                    alt="Sebastian Reategui pixel"
                                                    fill
                                                    sizes="108px"
                                                    className="object-cover"
                                                    style={{ filter: 'url(#pixelate-v2)' }}
                                                />
                                                {/* Scanlines */}
                                                <div
                                                    className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
                                                    style={{ backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Name + role */}
                                <div className="text-center">
                                    <p className="text-[15px] font-semibold text-white tracking-tight">Sebastian Reategui</p>
                                    <p className="text-[11px] font-mono text-white/35 mt-0.5 tracking-wider">CS Student @ UTEC</p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    <TagPill>Lima, Peru</TagPill>
                                    <TagPill>Open to work</TagPill>
                                </div>
                            </div>

                            {/* ── Widgets ── */}
                            <div className="mt-auto">
                                <LiveClock />
                                <AvailabilityStatus />
                            </div>
                        </div>

                        {/* ── Right Column: Bio + Bullets + Activity ── */}
                        <div className="flex-1 flex flex-col">

                            {/* Bio */}
                            <div className="px-7 py-7 border-b border-white/5">
                                <p className="text-[11px] font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-3">// introduction</p>
                                <h2 className="text-[22px] font-bold text-white tracking-tight leading-tight mb-3">
                                    {t.intro.hi}
                                </h2>
                                <div className="relative pl-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-linear-to-b from-blue-400/60 via-blue-400/30 to-transparent" />
                                    <p className="text-[13px] font-mono text-white/45 leading-[1.8]">
                                        {t.intro.bio}
                                    </p>
                                </div>
                            </div>

                            {/* Bullets */}
                            <div className="px-7 py-6 border-b border-white/5">
                                <ul className="flex flex-col gap-3.5">
                                    <BulletRow emoji="🚀" html={t.intro.bullet2} />
                                    <BulletRow emoji="🎯" html={t.intro.bullet4} />
                                    <BulletRow emoji="💼" html={t.intro.bullet5} />
                                    <BulletRow emoji="🧩" html={t.intro.bullet3} />
                                </ul>
                            </div>

                            {/* Commits Grid */}
                            <div className="px-7 py-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-[0.2em]">
                                        {t.intro.activity}
                                    </span>
                                    <div className="flex-1 h-px bg-white/6" />
                                </div>

                                <div className="flex justify-center w-full overflow-hidden">
                                    <CommitsGrid text="UTEC" />
                                </div>

                                <div className="flex items-center gap-1.5 mt-4 text-white/25 font-mono text-[10px] justify-end">
                                    <span>{t.intro.less}</span>
                                    {[
                                        'bg-black border border-white/5',
                                        'border border-blue-400/20 bg-blue-500/20',
                                        'border border-blue-400/40 bg-blue-500/40',
                                        'border border-blue-400/60 bg-blue-500/60',
                                        'border border-blue-400/80 bg-blue-500/80',
                                    ].map((cls, i) => (
                                        <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
                                    ))}
                                    <span>{t.intro.more}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom edge accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </motion.div>
            </motion.div>
        </section>
    );
}
