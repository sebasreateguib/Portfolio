'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    id?: string;
    delay?: number;
}

const MOBILE_MAX_WIDTH = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return isMobile;
}

export function ScrollReveal({ children, className, id, delay = 0 }: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const triggerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(triggerRef, { once: true, amount: 0.15 });
    const [hasRevealed, setHasRevealed] = useState(false);

    const blurPx = isMobile ? 8 : 12;
    const blur = `blur(${blurPx}px)`;
    const duration = isMobile ? 0.55 : 0.7;
    const filterDuration = isMobile ? 0.4 : 0.55;
    const filterDelay = delay + (isMobile ? 0.06 : 0.1);

    if (shouldReduceMotion) {
        return (
            <div id={id} className={className}>
                {children}
            </div>
        );
    }

    const hidden = {
        filter: blur,
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
                    duration,
                    delay,
                    ease: [0.25, 1, 0.5, 1],
                    filter: { duration: filterDuration, delay: filterDelay },
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
