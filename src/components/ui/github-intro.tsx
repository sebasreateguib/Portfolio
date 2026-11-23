"use client";
import { useRef, useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CommitsGrid } from './commits-grid';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';

const LinkedInIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const WhatsAppIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
);

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

/* ─── Shared bits ────────────────────────────────────────────── */
const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';

/* ─── Local time in Lima ─────────────────────────────────────── */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Digital readout only; a dash holds the row's height until the clock is read on the client. */
function LocalTime() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        const tick = () => setTime(new Date());
        const frame = requestAnimationFrame(tick);
        // minutes are all that is shown; a 10s beat keeps it honest without a per-second render
        const id = setInterval(tick, 10_000);
        return () => {
            cancelAnimationFrame(frame);
            clearInterval(id);
        };
    }, []);

    if (!time) {
        return (
            <dd className="mt-1.5 flex items-baseline justify-between gap-3 text-white/30">
                <span className="text-lg leading-none">--:--</span>
            </dd>
        );
    }

    const lima = new Date(time.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const hours = lima.getHours();
    const minutes = lima.getMinutes().toString().padStart(2, '0');
    const hour12 = (hours % 12 || 12).toString().padStart(2, '0');
    const isWorking = hours >= 9 && hours < 22;

    return (
        <dd className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-lg leading-none font-bold tracking-tight text-white normal-case">
                {hour12}:{minutes}
                <span className="ml-1 text-[11px] font-normal text-white/40">{hours >= 12 ? 'PM' : 'AM'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/45">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isWorking ? 'bg-emerald-400' : 'bg-white/20'}`} aria-hidden="true" />
                {DAY_NAMES[lima.getDay()]} · {isWorking ? 'Working hours' : 'Off hours'}
            </span>
        </dd>
    );
}

/* ─── Contact row ────────────────────────────────────────────── */
function ContactLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
    const address = href.replace(/^https?:\/\/(www\.)?/, '').replace(/\?.*$/, '');
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group/contact flex min-h-11 items-center justify-between gap-3 border border-white/8 bg-white/[0.02] px-3 py-2.5 transition-colors duration-200 hover:border-blue-400/45 hover:bg-blue-400/[0.06] active:bg-blue-400/[0.1] ${focusRing}`}
        >
            <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 text-white/45 transition-colors duration-200 group-hover/contact:text-blue-200">{icon}</span>
                <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-blue-100">{label}</span>
                    <span className="block truncate font-mono text-[10px] tracking-wide text-white/30">{address}</span>
                </span>
            </span>
            <ArrowUpRight
                className="size-4 shrink-0 text-blue-300/70 transition-transform duration-200 group-hover/contact:translate-x-0.5 group-hover/contact:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/contact:translate-x-0 motion-reduce:group-hover/contact:translate-y-0"
                aria-hidden="true"
            />
        </a>
    );
}

const FACTS = [
    { label: 'Location', value: 'Lima, Peru' },
    { label: 'From', value: 'Immediately' },
    { label: 'Type', value: 'Internship · Freelance' },
    { label: 'Mode', value: 'Remote · Hybrid' },
];

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
                {/* Subject record: same dossier language as the Experience and Education cards */}
                <motion.article
                    variants={itemVariants}
                    className="group relative w-full border border-white/5 bg-[#030303] transition-colors duration-300 hover:border-blue-400/40"
                >
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 z-10 h-3 w-3 border-t border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                    <div className="absolute top-0 right-0 z-10 h-3 w-3 border-t border-r border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 z-10 h-3 w-3 border-b border-l border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />
                    <div className="absolute right-0 bottom-0 z-10 h-3 w-3 border-r border-b border-white/30 transition-colors duration-300 group-hover:border-blue-300" aria-hidden="true" />

                    {/* Status bar */}
                    <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.01] px-4 py-3 font-mono text-[10px] tracking-widest md:px-6">
                        <div className="flex min-w-0 items-center gap-2 text-white/50">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" aria-hidden="true" />
                            <span className="truncate uppercase">
                                SUBJECT_01 <span className="text-white/25">/</span> sebasreateguib
                            </span>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] tracking-[0.16em] text-emerald-300 uppercase">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" aria-hidden="true" />
                            <span className="sm:hidden">Available</span>
                            <span className="hidden sm:inline">Available for opportunities</span>
                        </span>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                        {/* ── Who: greeting, bio, what I'm on, how to reach me ── */}
                        <div className="flex flex-col justify-between gap-10 p-6 md:p-10 order-2">
                            <div>
                                <p className="font-mono text-[11px] tracking-[0.2em] text-blue-300/80 uppercase">// introduction</p>
                                <h3 className="font-section mt-4 text-3xl leading-[1.05] font-semibold tracking-tight text-balance break-words text-white md:text-4xl xl:text-5xl">
                                    {t.intro.hi}
                                </h3>
                                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">{t.intro.bio}</p>

                                {/* Activity: the commit grid, spelling UTEC */}
                                <div className="mt-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">{t.intro.activity}</span>
                                        <div className="h-px flex-1 bg-white/6" />
                                    </div>
                                    <CommitsGrid text="UTEC" />
                                    <div className="mt-3 flex items-center justify-end gap-[3px] font-mono text-[10px] text-white/25">
                                        <span className="mr-1.5">{t.intro.less}</span>
                                        {/* the same tones the grid lights its cells with */}
                                        {['bg-white/[0.05]', 'bg-blue-700', 'bg-blue-600', 'bg-blue-500', 'bg-blue-400'].map((tone) => (
                                            <span key={tone} className={`h-2.5 w-2.5 ${tone}`} aria-hidden="true" />
                                        ))}
                                        <span className="ml-1.5">{t.intro.more}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <ContactLink
                                    href="https://www.linkedin.com/in/sebasreateguib"
                                    icon={<LinkedInIcon size={16} />}
                                    label="Connect on LinkedIn"
                                />
                                <ContactLink
                                    href="https://wa.me/51947546421?text=Hola%20Sebastián,%20vi%20tu%20portfolio..."
                                    icon={<WhatsAppIcon size={16} />}
                                    label="Chat on WhatsApp"
                                />
                            </div>
                        </div>

                        {/* ── The file: portrait and the facts (left on desktop, first on phones) ── */}
                        <div className="order-1 flex flex-col border-b border-white/5 lg:border-r lg:border-b-0">
                            <div className="group/photo relative min-h-64 flex-1 overflow-hidden bg-black sm:min-h-80">
                                <Image
                                    src="/mainprofile.png"
                                    alt="Sebastian Reategui"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 560px"
                                    className="object-cover object-[center_22%] opacity-80 grayscale transition-[filter,opacity] duration-500 group-hover:opacity-100 group-hover/photo:grayscale-0 motion-reduce:transition-none"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/20 to-transparent" aria-hidden="true" />
                                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                                    <p className="font-section text-xl font-semibold tracking-tight text-white">Sebastian Reategui</p>
                                    <p className="mt-1 font-mono text-[11px] tracking-wider text-white/50">Computer Science @ UTEC</p>
                                </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-px border-t border-white/5 bg-white/5 font-mono text-[10px] tracking-widest uppercase">
                                <div className="col-span-2 bg-[#030303] px-5 py-3.5 md:px-6">
                                    <dt className="text-white/30">Local Time · Lima, PE</dt>
                                    <LocalTime />
                                </div>
                                {FACTS.map(({ label, value }) => (
                                    <div key={label} className="bg-[#030303] px-5 py-3.5 md:px-6">
                                        <dt className="text-white/30">{label}</dt>
                                        <dd className="mt-1.5 text-white/75">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </motion.article>
            </motion.div>
        </section>
    );
}
