'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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

    /*
     * Transform + opacity only. The previous version animated `clip-path` from
     * inset(8% 12%) to inset(0%) together with a 12px blur, which made every
     * section visibly expand as it revealed — with nine of them chained down the
     * page, something was almost always mid-animation while scrolling. Both
     * properties also force repaints; `y` and `opacity` stay on the compositor.
     */
    const hidden = { opacity: 0, y: 16 };
    const visible = { opacity: 1, y: 0 };

    return (
        <div ref={triggerRef} id={id} className={className}>
            <motion.div
                initial={hidden}
                animate={isInView ? visible : hidden}
                transition={{
                    duration: 0.7,
                    delay,
                    ease: [0.25, 1, 0.5, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
