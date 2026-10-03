"use client";
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { ExperienceStack, type ExperienceEntry } from '../services-stack';
import { SectionDivider } from './section-divider';
import { SectionTitle } from './section-title';
import { AvailabilityMarquee } from './availability-marquee';

export default function ExperienceSection() {
    const { language } = useLanguage();
    const copy = translations[language].experience;

    const entries: ExperienceEntry[] = copy.list.map((item) => ({
        id: item.id,
        role: item.role,
        type: item.type,
        company: item.company,
        period: `${item.period} · ${item.duration}`,
        location: item.location,
        focus: item.focus,
        summary: item.summary,
        ongoing: item.ongoing,
        capabilities: item.capabilities,
        tech: item.tech,
        clients: item.clients,
    }));

    return (
        /* No overflow clipping here: the stacked panels below rely on position: sticky. */
        <section id="experience" className="bg-transparent pt-16 lg:pt-24 relative">
            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="mb-10 md:mb-16">
                    <div className="mb-4">
                        <SectionTitle index="04">{copy.title}</SectionTitle>
                    </div>
                    <SectionDivider label={copy.badge} className="mb-0" index="04" />
                </div>

                {/* Availability marquee */}
                <div className="mb-10 md:mb-14">
                    <AvailabilityMarquee />
                </div>
            </div>

            {/* One sticky panel per role, each with a drawing of what was built */}
            <ExperienceStack
                entries={entries}
                labels={{
                    capabilities: copy.capabilitiesLabel,
                    stack: copy.stackLabel,
                    current: copy.current,
                    clients: copy.clientsLabel,
                    period: copy.periodLabel,
                    location: copy.locationLabel,
                }}
            />
        </section>
    );
}
