"use client";
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';
import { SectionTitle } from './section-title';
import { SectionDivider } from './section-divider';

/* ─── Marching-ants border ──────────────────────────────────────────── */
const DASH = 5;
const GAP = 9;
const STEP = `${DASH + GAP}px`;
const COLOR = 'rgba(255,255,255,0.2)';
const SPEED = '0.5s';

const dashBg = (dir: '90deg' | '180deg') =>
  `repeating-linear-gradient(${dir}, ${COLOR} 0, ${COLOR} ${DASH}px, transparent ${DASH}px, transparent ${STEP})`;

function AnimatedBorder() {
  return (
    <>
      <style>{`
        @keyframes march-r { from { background-position: 0 0; } to { background-position: ${STEP} 0; } }
        @keyframes march-d { from { background-position: 0 0; } to { background-position: 0 ${STEP}; } }
        @keyframes march-l { from { background-position: 0 0; } to { background-position: -${STEP} 0; } }
        @keyframes march-u { from { background-position: 0 0; } to { background-position: 0 -${STEP}; } }
      `}</style>
      {/* Top — moves right */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: dashBg('90deg'), animation: `march-r ${SPEED} linear infinite`
      }} />
      {/* Right — moves down */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 1,
        background: dashBg('180deg'), animation: `march-d ${SPEED} linear infinite`
      }} />
      {/* Bottom — moves left */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: dashBg('90deg'), animation: `march-l ${SPEED} linear infinite`
      }} />
      {/* Left — moves up */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 1,
        background: dashBg('180deg'), animation: `march-u ${SPEED} linear infinite`
      }} />
    </>
  );
}

function AnimatedVDivider({ left }: { left: string }) {
  return (
    <div className="hidden md:block absolute top-0 bottom-0" style={{
      left, width: 1,
      background: dashBg('180deg'), animation: `march-d ${SPEED} linear infinite`
    }} />
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────── */
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-white/50">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-white/50">
    <path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.967-.516" /><path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-white/50">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

/* ─── Content ─────────────────────────────────────────────────────── */
const philosophyData = {
  en: [
    {
      icon: <BotIcon />,
      badge: "AI · CO-PILOT",
      title: "Approach",
      desc: "My approach bridges traditional software engineering with artificial intelligence. Instead of just writing code, I design the system architecture and leverage AI as a co-pilot to accelerate implementation. I act as the lead orchestrator, ensuring quality and scalability from end to end.",
      tags: ["Systems Architect", "AI Orchestration", "Rapid Delivery", "Problem-solver"],
    },
    {
      icon: <BrainIcon />,
      badge: "SYSTEMS · DESIGN",
      title: "Philosophy",
      desc: "Technology is just a medium; the true goal is solving real problems. My philosophy is to deeply understand the architecture and the need before writing code, ensuring every system I design delivers tangible, scalable, and measurable value.",
      tags: ["User-Centric", "Scalable Impact", "Efficient Design"],
    },
    {
      icon: <StarIcon />,
      badge: "HUMAN · GROWTH",
      title: "Soft Skills",
      desc: "The skills that allow me to adapt to new challenges and work in a team: Systems thinking, Problem solving, Fast learning, Technical communication, Results orientation, and Adaptability.",
      tags: ["Systems Thinking", "Problem Solving", "Fast Learning", "Tech Comms"],
    },
  ],
  es: [
    {
      icon: <BotIcon />,
      badge: "IA · COPILOTO",
      title: "Enfoque",
      desc: "Mi enfoque combina la ingeniería de software tradicional con la inteligencia artificial. En lugar de solo escribir código, diseño la arquitectura del sistema y utilizo la IA como copiloto para acelerar la implementación. Actúo como el orquestador principal, asegurando calidad y escalabilidad de extremo a extremo.",
      tags: ["Arquitecto de Sistemas", "Orquestación IA", "Entrega Rápida", "Resolución de Problemas"],
    },
    {
      icon: <BrainIcon />,
      badge: "SISTEMAS · DISEÑO",
      title: "Filosofía",
      desc: "La tecnología es solo un medio; el verdadero objetivo es resolver problemas reales. Mi filosofía es entender profundamente la arquitectura y la necesidad antes de escribir código, asegurando que cada sistema que diseño aporte un valor tangible, escalable y medible.",
      tags: ["Centrado en el Usuario", "Impacto Escalable", "Diseño Eficiente"],
    },
    {
      icon: <StarIcon />,
      badge: "HUMANO · CRECIMIENTO",
      title: "Soft Skills",
      desc: "Las habilidades que me permiten adaptarme a nuevos retos y trabajar en equipo: Pensamiento sistémico, Problem solving, Aprendizaje rápido, Comunicación técnica, Orientación a resultados y Adaptabilidad.",
      tags: ["Pensamiento Sistémico", "Problem Solving", "Aprendizaje Rápido", "Comunicación Técnica"],
    },
  ],
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-blue-400 shrink-0 mt-px">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ─── Section ───────────────────────────────────────────────────────── */
export default function WorkPhilosophy() {
  const { language } = useLanguage();
  const t = translations[language];
  const cards = philosophyData[language];

  return (
    <section id="philosophy" className="bg-black py-16 lg:py-24 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-16">
          <div className="mb-4">
            <SectionTitle index="04">{t.workPhilosophy.title}</SectionTitle>
          </div>
          <SectionDivider label={t.workPhilosophy.badge} className="mb-0" index="04" />
        </div>

        {/* Animated-border grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3">
          {/* Marching-ants outer border */}
          <AnimatedBorder />

          {/* Animated internal column dividers */}
          <AnimatedVDivider left="33.333%" />
          <AnimatedVDivider left="66.666%" />

          {/* Corner + marks */}
          {[
            'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
            'top-0 right-0  translate-x-1/2  -translate-y-1/2',
            'bottom-0 left-0 -translate-x-1/2  translate-y-1/2',
            'bottom-0 right-0  translate-x-1/2   translate-y-1/2',
          ].map((pos, i) => (
            <span key={i} className={`absolute ${pos} text-white/30 font-mono text-sm select-none pointer-events-none`}>+</span>
          ))}

          {/* Internal + marks (top & bottom of each divider) */}
          {['top-0 -translate-y-1/2', 'bottom-0 translate-y-1/2'].map((pos, i) =>
            ['33.333%', '66.666%'].map((l, j) => (
              <span key={`${i}-${j}`}
                className={`hidden md:block absolute ${pos} -translate-x-1/2 text-white/30 font-mono text-sm select-none pointer-events-none`}
                style={{ left: l }}>+</span>
            ))
          )}

          {/* Cards */}
          {cards.map((card, i) => (
            <div key={i} className={`p-8 lg:p-10 flex flex-col gap-6 ${i < cards.length - 1 ? 'border-b border-dashed border-white/10 md:border-b-0' : ''}`}>
              {/* Icon box */}
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 flex items-center justify-center border border-white/10 bg-white/3">
                  {card.icon}
                </div>
                <span className="font-mono text-[9px] tracking-widest text-white/25 uppercase">{card.badge}</span>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-[16px] font-semibold text-white/90 mb-3 tracking-tight font-section">
                  {card.title}
                </h3>
                <p className="text-[13px] text-white/50 leading-[1.65] font-mono mb-5">
                  {card.desc}
                </p>
              </div>

              {/* Checklist tags */}
              <ul className="flex flex-col gap-2 mt-auto">
                {card.tags.map((tag, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckIcon />
                    <span className="text-[12px] font-mono text-white/55">{tag}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
