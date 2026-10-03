"use client";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { STACK_GROUPS } from '../../data/stack';
import { FlowingLogos } from './flowing-logos';
import AgenticWorkflow from './agentic-workflow';

/** Per-logo height tweaks for the marquee, where logos sit bare instead of on tiles. */
const MARQUEE_SIZES: Record<string, string> = {
    AWS: '!h-8',
    Docker: '!h-12',
};

interface LogoCloudMarqueeProps {
    className?: string;
}

export default function LogoCloudMarquee({ className }: LogoCloudMarqueeProps) {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <section className={cn('relative w-full overflow-hidden py-24 bg-black', className)}>
            <div className='container mx-auto px-6 lg:px-8 relative z-10'>
                {/* Section Header */}
                <div className="mb-16">
                    <div className="mb-4">
                        <SectionTitle index="04">{t.logoCloud.title}</SectionTitle>
                    </div>
                    <SectionDivider label={t.logoCloud.badge} index="04" />
                </div>

                <div className="w-screen relative left-1/2 ml-[-50vw] -mt-8 mb-4">
                    <AgenticWorkflow />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className='relative mt-14'
                >
                    <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-linear-to-r from-black via-black/60 to-transparent' />
                    <div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-linear-to-l from-black via-black/60 to-transparent' />
                    <div className="flex flex-col gap-12">
                        {STACK_GROUPS.map((group, i) => (
                            <FlowingLogos
                                key={group.label}
                                data={group.logos.map((logo) => ({
                                    ...logo,
                                    className: MARQUEE_SIZES[logo.name],
                                }))}
                                reverse={i % 2 === 1}
                                className={i % 2 === 1 ? '[--duration:45s]' : '[--duration:40s]'}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Exactly as requested in the reference code */}
            <div className="relative -mt-16 h-96 w-full overflow-hidden mask-[radial-gradient(50%_50%,white,transparent)] flex flex-col items-center">
                <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,rgba(59,130,246,1),transparent_70%)] before:opacity-40" />
                <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-white/20 bg-zinc-950" />
            </div>
        </section>
    );
}
