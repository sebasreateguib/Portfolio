"use client";

import React, { useState, useEffect } from 'react';
import TypingKeyboard from './typing-keyboard';
import { AnimatePresence, motion } from 'framer-motion';

const TYPING_SPEED: [number, number] = [40, 90];

const BOOT_SEQUENCE = [
    "Loading kernel modules...",
    "Mounting root filesystem... OK",
    "Initializing web components...",
    "Establishing secure connection...",
    "Starting portfolio interface..."
];


export default function PageLoader({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isTypingDone, setIsTypingDone] = useState(false);

    const handleTypingComplete = React.useCallback(() => {
        setIsTypingDone(true);
    }, []);

    useEffect(() => {
        if (!isTypingDone) return;
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [isTypingDone]);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] min-h-screen overflow-hidden"
                    >
                        {/* Scanlines Overlay */}
                        <div 
                            className="absolute inset-0 z-0 pointer-events-none opacity-30"
                            style={{
                                backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0, 0, 0, 0.8) 2px, rgba(0, 0, 0, 0.8) 4px)`
                            }}
                        />

                        <div className="relative z-10 flex flex-col items-center">
                            <TypingKeyboard
                                autoTypeText="init"
                                loop={false}
                                initialDelay={400}
                                accentColor="#111111"
                                secondaryAccent="#60a5fa"
                                screenColor="#111111"
                                onComplete={handleTypingComplete}
                                typingSpeed={TYPING_SPEED}
                                bootSequence={BOOT_SEQUENCE}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* We can choose to wait for loading to finish before mounting children, or mount them behind. 
                Mounting them behind is better for SEO and performance so they load their assets. */}
            <div className={`transition-opacity duration-700 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                {children}
            </div>
        </>
    );
}
