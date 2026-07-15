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
            icon: Cloud,
            label: "Cloud-Native Infrastructure",
            title: "Cloud-Native Infrastructure",
            description: language === "es"
                ? "Diseño e implementación de sistemas escalables y resilientes en la nube. Orientado a eventos, sin preocuparse por la infraestructura subyacente y optimizando costos."
                : "Design and implementation of scalable and resilient cloud systems. Event-driven approach, zero infrastructure management, and cost optimization.",
            video: "/cloud2.jpg",
            card: {
                heading: "CLOUD-NATIVE",
                badge: "AWS",
                goal: "RESILIENCY & SCALE",
                tasks: [
                    { title: "Event-Driven", meta: "Practice", status: "completed" },
                    { title: "Microservices", meta: "Practice", status: "completed" },
                    { title: "Infra as Code", meta: "Practice", status: "completed" },
                    { title: "Serverless Framework", meta: "Practice", status: "completed" },
                ],
            },
        },
        {
            icon: Code,
            label: "Clean Code",
            title: "Clean Code & Patrones",
            description: language === "es"
                ? "Desarrollo de software mantenible, testeable y fácil de leer. Aplicación de principios SOLID, Patrones de Diseño y refactorización continua."
                : "Development of maintainable, testable, and readable software. Application of SOLID principles, Design Patterns, and continuous refactoring.",
            video: "/code2-compressed.mp4",
            card: {
                heading: "SOFTWARE DESIGN",
                badge: "SOLID",
                goal: "MAINTAINABILITY",
                tasks: [
                    { title: "TDD", meta: "Practice", status: "completed" },
                    { title: "Design Patterns", meta: "Practice", status: "completed" },
                    { title: "Code Review", meta: "Practice", status: "completed" },
                    { title: "Refactoring", meta: "Practice", status: "completed" },
                ],
            },
        },
        {
            icon: Zap,
            label: "Performance",
            title: "Rendimiento y Escalabilidad",
            description: language === "es"
                ? "Optimización de algoritmos y bases de datos para manejar alto tráfico. Profiling, estrategias de caché, estructuras de datos eficientes y concurrencia."
                : "Algorithm and database optimization for high traffic. Profiling, caching strategies, efficient data structures, and concurrency.",
            video: "/opti-compressed.mp4",
            card: {
                heading: "OPTIMIZATION",
                badge: "O(1)",
                goal: "SPEED & EFFICIENCY",
                tasks: [
                    { title: "Caching", meta: "Practice", status: "completed" },
                    { title: "Load Balancing", meta: "Practice", status: "completed" },
                    { title: "DB Indexing", meta: "Practice", status: "completed" },
                    { title: "Profiling", meta: "Practice", status: "completed" },
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
                <div className="relative overflow-hidden h-[560px] lg:h-[540px] lg:max-w-5xl lg:mx-auto custom-clip shadow-2xl">

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
                                className="w-[calc(100%-3rem)] max-w-[280px] sm:max-w-none sm:w-[320px] rounded-[22px] sm:rounded-[26px] border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-4 sm:p-5"
                            >

                                {/* HEADER */}
                                <div className="flex items-center justify-between">

                                    <h3 className="text-[16px] sm:text-[18px] font-semibold text-white flex items-center gap-2">
                                        <activeItem.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                        {activeItem.card.heading}
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        {/* Links removed for Core Competencies */}
                                    </div>

                                </div>

                                {/* GOAL */}
                                <div className="mt-3 sm:mt-4 border border-zinc-800 rounded-xl p-2.5 sm:p-3">

                                    <p className="text-[10px] sm:text-[11px] text-zinc-400">
                                        {language === "es" ? "Descripción" : "Description"}
                                    </p>

                                    <p className="text-[12px] sm:text-[13px] leading-[18px] sm:leading-[20px] mt-1 text-white">
                                        {activeItem.description}
                                    </p>

                                </div>

                                {/* TASKS */}
                                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2 sm:gap-y-3">

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
                            text-[12px] sm:text-[13px]
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
                                <div className="mt-3 sm:mt-5 flex items-center justify-start gap-2">
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