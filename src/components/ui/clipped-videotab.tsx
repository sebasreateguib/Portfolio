"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    BrainCircuit,
    Bot,
    Database,
    CheckCircle2,
    LoaderCircle,
    Circle,
    Cloud,
    Code,
    Zap,
} from "lucide-react";
import { TerminalIcon } from "../term-icon";
import { SectionTitle } from "./section-title";
import { SectionDivider } from "./section-divider";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../data/translations";
import { ViewportVideo } from "./viewport-video";

export default function ClippedVideoTab() {
    const { language } = useLanguage();
    const t = translations[language];

    const items = [
        {
            icon: Bot,
            label: language === "es" ? "Mi Enfoque" : "My Approach",
            title: language === "es" ? "Mi Enfoque (AI Co-pilot)" : "My Approach (AI Co-pilot)",
            description: language === "es"
                ? "Mi enfoque combina la ingeniería de software tradicional con la inteligencia artificial. En lugar de solo escribir código, diseño la arquitectura del sistema y utilizo la IA como copiloto para acelerar la implementación. Actúo como el orquestador principal, asegurando calidad y escalabilidad de extremo a extremo."
                : "My approach bridges traditional software engineering with artificial intelligence. Instead of just writing code, I design the system architecture and leverage AI as a co-pilot to accelerate implementation. I act as the lead orchestrator, ensuring quality and scalability from end to end.",
            video: "/approach-compressed.mp4",
            card: {
                heading: "MY APPROACH",
                badge: "AI",
                goal: "SPEED & PRECISION",
                tasks: [
                    { title: language === "es" ? "Arquitecto de sistemas" : "Systems Architect", meta: "Role", status: "completed" },
                    { title: "AI Orchestration", meta: "Workflow", status: "completed" },
                    { title: "Rapid Delivery", meta: "Result", status: "completed" },
                    { title: "Problem-solver", meta: "Skill", status: "completed" },
                ],
            },
        },
        {
            icon: BrainCircuit,
            label: language === "es" ? "Filosofía" : "Philosophy",
            title: language === "es" ? "Mi Filosofía" : "My Philosophy",
            description: language === "es"
                ? "Teniendo los fundamentos claros y orquestando Agents adecuadamente, se pueden entregar resultados y sistemas complejos hasta 10 veces más rápido."
                : "By having a strong grasp of fundamentals and properly orchestrating Agents, it's possible to deliver complex systems and results up to 10x faster.",
            video: "/code2-compressed.mp4",
            card: {
                heading: "PHILOSOPHY",
                badge: "SYSTEMS",
                goal: "BEST DESIGN",
                tasks: [
                    { title: "System Design", meta: "Core", status: "completed" },
                    { title: "Architecture", meta: "Focus", status: "completed" },
                    { title: "Less is More", meta: "Code", status: "completed" },
                    { title: "Scalability", meta: "Goal", status: "completed" },
                ],
            },
        },
        {
            icon: CheckCircle2,
            label: "Soft Skills",
            title: "Soft Skills",
            description: language === "es"
                ? "Las habilidades que me permiten adaptarme a nuevos retos y trabajar en equipo: Pensamiento sistémico, Problem solving, Aprendizaje rápido, Comunicación técnica, Orientación a resultados y Adaptabilidad."
                : "The skills that allow me to adapt to new challenges and work in a team: Systems thinking, Problem solving, Fast learning, Technical communication, Results orientation, and Adaptability.",
            video: "/glass-compressed.jpg",
            card: {
                heading: "SOFT SKILLS",
                badge: "HUMAN",
                goal: "TEAM & GROWTH",
                tasks: [
                    { title: language === "es" ? "Pensamiento sistémico" : "Systems thinking", meta: "Skill", status: "completed" },
                    { title: "Problem solving", meta: "Skill", status: "completed" },
                    { title: language === "es" ? "Aprendizaje rápido" : "Fast learning", meta: "Skill", status: "completed" },
                    { title: language === "es" ? "Comunicación técnica" : "Tech Comms", meta: "Skill", status: "completed" },
                ],
            },
        },
    ];

    const [activeTab, setActiveTab] = useState(0);

    const activeItem = items[activeTab];

    return (
        <section className="bg-black py-20 overflow-hidden relative">
            <style>{`
                .custom-clip {
                    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                    border-radius: 28px;
                }
                @media (min-width: 1024px) {
                    .custom-clip {
                        clip-path: polygon(0 0, 92% 0, 100% 12%, 100% 100%, 30% 100%, 22% 88%, 0 88%);
                        border-radius: 34px;
                    }
                }
            `}</style>

            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"></div>


            {/* TOP HEADER */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="mb-4">
                    <SectionTitle index="02">{language === "es" ? "Filosofía de Trabajo" : "Work Philosophy"}</SectionTitle>
                </div>
                <SectionDivider label={language === "es" ? "Conceptos_Core" : "Core_Concepts"} index="02" />
            </div>

            {/* IMAGE AREA */}
            <div className="max-w-7xl mx-auto px-6 relative">

                {/* MOBILE TABS (Hidden on Desktop) */}
                <div className="flex lg:hidden overflow-x-auto gap-3 pb-6 -mx-6 px-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((tab, index) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`
                                    snap-center shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300
                                    ${activeTab === index
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                    }
                                `}
                            >
                                <Icon size={16} />
                                <span className="text-[14px] font-medium whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* FLOATING TABS (Desktop Only) */}
                <div className="hidden lg:block absolute left-2 bottom-16 z-20">

                    <div className="bg-zinc-950/80 backdrop-blur-md rounded-[28px] shadow-xl border border-zinc-800 p-3 w-[240px]">

                        <div className="flex flex-col gap-2">

                            {items.map((tab, index) => {
                                const Icon = tab.icon;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(index)}
                                        className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 border
                      ${activeTab === index
                                                ? "bg-zinc-900 border-zinc-700"
                                                : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/50"
                                            }
                    `}
                                    >
                                        <Icon
                                            size={20}
                                            className={`
                        transition-colors duration-300
                        ${activeTab === index
                                                    ? "text-blue-400"
                                                    : "text-zinc-500 group-hover:text-blue-400"
                                                }
                      `}
                                        />

                                        <span
                                            className={`
                        text-[15px] font-medium transition-colors duration-300
                        ${activeTab === index
                                                    ? "text-blue-400"
                                                    : "text-zinc-400 group-hover:text-blue-400"
                                                }
                      `}
                                        >
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}

                        </div>

                    </div>

                </div>

                {/* VIDEO CONTAINER */}
                <div className="relative overflow-hidden h-[420px] md:h-[500px] lg:h-[540px] lg:max-w-5xl lg:mx-auto custom-clip shadow-2xl">

                    {/* VIDEO */}
                    <AnimatePresence mode="wait">

                        {activeItem.video.match(/\.(mp4|webm)$/i) ? (
                            <motion.div
                                key={activeItem.video}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45 }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <ViewportVideo
                                    src={activeItem.video}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    wrapperClassName="absolute inset-0 w-full h-full"
                                />
                            </motion.div>
                        ) : (
                            <motion.img
                                key={activeItem.video}
                                src={activeItem.video}
                                alt={activeItem.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45 }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}

                    </AnimatePresence>

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/10" />

                    {/* CENTER CARD */}
                    <div className="absolute inset-0 flex items-center justify-center">

                        <AnimatePresence mode="wait">

                            <motion.div
                                key={activeItem.card.heading}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 14 }}
                                transition={{ duration: 0.35 }}
                                className="w-[calc(100%-4rem)] max-w-[260px] sm:max-w-none sm:w-[320px] rounded-[20px] sm:rounded-[26px] border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-3 sm:p-5"
                            >

                                {/* HEADER */}
                                <div className="flex items-center justify-between">

                                    <h3 className="text-[15px] sm:text-[18px] font-semibold text-white flex items-center gap-2">
                                        <activeItem.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                        {activeItem.card.heading}
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        {/* Links removed for Core Competencies */}
                                    </div>

                                </div>

                                {/* GOAL */}
                                <div className="mt-2.5 sm:mt-4 border border-zinc-800 rounded-[10px] sm:rounded-xl p-2 sm:p-3">

                                    <p className="text-[10px] sm:text-[11px] text-zinc-400">
                                        {language === "es" ? "Descripción" : "Description"}
                                    </p>

                                    <p className="text-[11px] sm:text-[13px] leading-[16px] sm:leading-[20px] mt-1 text-white">
                                        {activeItem.description}
                                    </p>

                                </div>

                                {/* TASKS */}
                                <div className="mt-2.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-y-3">

                                    {activeItem.card.tasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2"
                                        >

                                            {/* ICON */}
                                            <div className="mt-[2px]">

                                                {task.status === "completed" && (
                                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                                                )}

                                                {task.status === "progress" && (
                                                    <LoaderCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                                                )}

                                                {task.status === "pending" && (
                                                    <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600" />
                                                )}

                                            </div>

                                            {/* CONTENT */}
                                            <div>

                                                <p
                                                    className={`
                            text-[11px] sm:text-[13px]
                            ${task.status === "completed"
                                                            ? "text-zinc-200 font-medium"
                                                            : task.status === "progress"
                                                                ? "text-blue-400 font-medium"
                                                                : "text-zinc-500"
                                                        }
                          `}
                                                >
                                                    {task.title}
                                                </p>



                                            </div>

                                        </div>
                                    ))}

                                </div>

                                {/* CATEGORY BADGE */}
                                <div className="mt-2.5 sm:mt-5 flex items-center justify-start gap-2">
                                    <span className="text-[10px] sm:text-[11px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded-md font-mono tracking-wide">
                                        {activeItem.card.badge}
                                    </span>
                                </div>

                            </motion.div>

                        </AnimatePresence>

                    </div>

                </div>

            </div>

        </section>
    );
}