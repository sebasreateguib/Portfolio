'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Terminal, Code, Cpu, Globe } from 'lucide-react';

const reasons = [
  {
    title: "La Magia de Crear",
    description: "Descubrí que con solo unas líneas de código podía construir herramientas y mundos enteros desde cero. Es el superpoder más cercano a la magia en la vida real.",
    icon: <Terminal className="w-10 h-10 text-emerald-400" />,
    color: "from-emerald-950/40 to-black"
  },
  {
    title: "Resolución de Problemas",
    description: "Me apasiona el desafío intelectual. Cada bug es un rompecabezas, y cada arquitectura es un sistema complejo esperando ser optimizado al máximo.",
    icon: <Code className="w-10 h-10 text-blue-400" />,
    color: "from-blue-950/40 to-black"
  },
  {
    title: "El Futuro en mis Manos",
    description: "Desde Inteligencia Artificial hasta sistemas distribuidos, CS me pone en la vanguardia de las tecnologías que están redefiniendo el futuro de la humanidad.",
    icon: <Cpu className="w-10 h-10 text-purple-400" />,
    color: "from-purple-950/40 to-black"
  },
  {
    title: "Impacto Global",
    description: "El software no tiene fronteras. Un buen producto puede escalar instantáneamente y mejorar la vida de millones de personas de forma simultánea.",
    icon: <Globe className="w-10 h-10 text-orange-400" />,
    color: "from-orange-950/40 to-black"
  }
];

export default function WhyCSCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative bg-black" style={{ height: `${reasons.length * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-20">
        
        <div className="text-center mb-12 z-10 px-4">
          <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-white mb-4">
            ¿Por qué <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Computer Science?</span>
          </h2>
          <p className="text-white/50 text-lg font-mono">El código como herramienta para moldear el futuro</p>
        </div>

        <div className="relative w-full max-w-2xl aspect-[4/3] md:aspect-[16/9]">
          {reasons.map((reason, i) => {
            // Calculating the progress for each individual card
            // We want cards to stack one by one
            const targetScale = 1 - ((reasons.length - i) * 0.05);
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const range = [i * 0.25, 1];
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const scale = useTransform(scrollYProgress, range, [1, targetScale]);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const y = useTransform(scrollYProgress, range, [0, -30 * (reasons.length - i)]);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(scrollYProgress, [(i - 1) * 0.25, i * 0.25], [0, 1]);

            return (
              <motion.div
                key={i}
                style={{
                  scale,
                  y,
                  top: `calc(10vh + ${i * 20}px)`,
                  opacity: i === 0 ? 1 : opacity,
                }}
                className={`absolute inset-0 flex flex-col justify-center p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-b ${reason.color} backdrop-blur-xl shadow-2xl origin-top`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    {reason.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-white font-sans mb-4">{reason.title}</h3>
                    <p className="text-white/70 font-mono text-base md:text-lg leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
                
                <div className="absolute top-6 right-8 text-white/20 font-mono text-4xl font-bold">
                  0{i + 1}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
