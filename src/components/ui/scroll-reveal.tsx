'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useLoaderTransition } from '../../context/LoaderTransitionContext';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    id?: string;
    delay?: number;
}

export function ScrollReveal({ children, className, id, delay = 0 }: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();
    const { phase } = useLoaderTransition();
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    /*
     * Only start observing AFTER the loader finishes.
     * This prevents `isInView` from being set to `true` while the loader
     * is still covering the screen, which would cause sections to appear
     * instantly with no animation when the loader exits.
     */
    useEffect(() => {
        if (phase !== 'revealed') return;
        const el = triggerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [phase]);

    if (shouldReduceMotion) {
        return (
            <div id={id} className={className}>
                {children}
            </div>
        );
    }

    const hidden = {
        filter: 'blur(12px)',
        clipPath: 'inset(8% 12% 8% 12% round 12px)',
        opacity: 0.35,
    };

    const visible = {
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        opacity: 1,
    };

    return (
        <div ref={triggerRef} id={id} className={className}>
            <motion.div
                className={cn(!hasRevealed && 'will-change-[filter,clip-path,opacity]')}
                initial={hidden}
                animate={isInView ? visible : hidden}
                transition={{
                    duration: 0.7,
                    delay,
                    ease: [0.25, 1, 0.5, 1],
                    filter: { duration: 0.55, delay: delay + 0.1 },
                }}
                onAnimationComplete={() => {
                    if (isInView) setHasRevealed(true);
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
