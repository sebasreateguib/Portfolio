"use client";
import { useState, useEffect, useRef, useTransition } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { LOGO } from './ascii';
import { Download, MessageSquare, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useLoaderTransition } from '../../context/LoaderTransitionContext';
import { translations } from '../../data/translations';
import { FrameButton } from './frame-button';
import { PixelAvatar } from './pixel-avatar';
import { Waveform } from './audiovisualizer';
import { DotFieldBackground } from './dot-field-background';
import { AsciiGlobe } from './ascii-globe';
import { AsciiThinker } from './ascii-thinker';

// What sits to the right of the copy on desktop: Rodin's Thinker in text looking
// at a laptop, the turning ASCII globe it replaced, or the pixel avatar before
// that (all 2026-11-27). Switch by changing this one value.
const HERO_FIGURE = 'thinker' as 'thinker' | 'globe' | 'avatar';

// The copy's SYS.ACT rule: the row is 9px type on the default line height, so its
// 1px line sits ~7px above the copy block's bottom edge.
const COPY_FLOOR = 'calc(var(--hero-copy-top, 18%) + var(--hero-copy-height, 64%) - 7px)';
// The Thinker's top: level with the top of the >_ SR logo, so the figure spans
// the copy from its logo down to its SYS.ACT floor.
const THINKER_TOP = 'var(--hero-logo-top, var(--hero-copy-top, 18%))';
// Horizontal extent of the Thinker and its floor line. Left: 36px past the copy.
// Right: 28px from the edge below 1440px; from 1440px the right margin mirrors the
// copy's left margin, and the box is capped at ~900px wide so on very wide screens
// the figure stays with the copy instead of drifting to the far edge.
const THINKER_X = 'right-[28px] min-[1440px]:right-[max(var(--hero-copy-left,111px),calc(100%_-_var(--hero-copy-right,44%)_-_936px))]';

export default function HeroAscii() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    // Where the left-hand copy block ("001" rule down to the SYS.ACT rule) sits
    // inside the copy layer, so on desktop the avatar spans the same height.
    const [copyBox, setCopyBox] = useState<{ top: number; height: number; left: number; right: number; logoTop: number } | null>(null);
    // Only md and up get the hero figure beside the copy. Null until mounted, so it
    // never loads on phones.
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    const { language, setLanguage } = useLanguage();
    const { phase, skipHeroTypewriter } = useLoaderTransition();
    const t = translations[language];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [, startTransition] = useTransition();

    const toggleLanguage = () => {
        startTransition(() => {
            setLanguage(language === 'en' ? 'es' : 'en');
        });
    };

    // Typewriter effect state for terminal command & response
    const [commandText, setCommandText] = useState('');
    const [showResponse, setShowResponse] = useState(false);
    const [roleDisplayText, setRoleDisplayText] = useState('');

    useEffect(() => {
        if (phase === "loading") return;

        if (skipHeroTypewriter) {
            setCommandText("whoami");
            setRoleDisplayText("");
            setShowResponse(false);

            if (phase === "revealed") {
                const responseTimer = window.setTimeout(() => {
                    setShowResponse(true);
                }, 280);
                return () => window.clearTimeout(responseTimer);
            }
            return;
        }

        if (phase !== "revealed") return;

        setCommandText('');
        setShowResponse(false);
        setRoleDisplayText('');

        let cmdIndex = 0;
        const targetCommand = "whoami";

        const cmdInterval = setInterval(() => {
            setCommandText(targetCommand.substring(0, cmdIndex + 1));
            cmdIndex++;
            if (cmdIndex >= targetCommand.length) {
                clearInterval(cmdInterval);
                setTimeout(() => {
                    setShowResponse(true);
                }, 300);
            }
        }, 80);

        return () => {
            clearInterval(cmdInterval);
        };
    }, [language, phase, skipHeroTypewriter]);

    useEffect(() => {
        if (!showResponse) return;

        let roleIndex = 0;
        const targetRole = t.hero.role;

        const roleInterval = setInterval(() => {
            setRoleDisplayText(targetRole.substring(0, roleIndex + 1));
            roleIndex++;
            if (roleIndex >= targetRole.length) {
                clearInterval(roleInterval);
            }
        }, 55);

        return () => clearInterval(roleInterval);
    }, [showResponse, t.hero.role]);

    useEffect(() => {
        const content = contentRef.current;
        const copy = copyRef.current;
        if (!content || !copy) return;

        // offsetTop ignores transforms, so the entrance and parallax
        // animations don't skew the measurement.
        const measure = () => {
            let top = 0;
            let left = 0;
            let el: HTMLElement | null = copy;
            while (el && el !== content) {
                top += el.offsetTop;
                left += el.offsetLeft;
                el = el.offsetParent as HTMLElement | null;
            }
            // The logo's offset inside the copy (both share the copy's transform, so the
            // difference of their rects is unaffected by the entrance animation).
            const logo = copy.querySelector<HTMLElement>('[data-hero-logo-ascii]');
            const logoOffset = logo ? logo.getBoundingClientRect().top - copy.getBoundingClientRect().top : 0;
            if (el === content) setCopyBox({ top, height: copy.offsetHeight, left, right: left + copy.offsetWidth, logoTop: top + logoOffset });
        };

        // The copy is vertically centred, so it moves whenever any block
        // between it and the copy layer changes size, and it grows when the
        // typewriter adds a line.
        const observer = new ResizeObserver(measure);
        for (let el: HTMLElement | null = copy; el; el = el.parentElement) {
            observer.observe(el);
            if (el === content) break;
        }
        measure();
        return () => observer.disconnect();
    }, []);

    // Scanner Effect State
    const [tick, setTick] = useState(0);
    const asciiLines = LOGO.split('\n');
    const L = asciiLines.length;

    useEffect(() => {
        // 1 tick = 80ms
        // 3 scans = L * 3 ticks
        // 5 seconds pause = 5000 / 80 = ~63 ticks
        const totalCycleTicks = L * 3 + 63;

        const timer = setInterval(() => {
            setTick(t => (t + 1) % totalCycleTicks);
        }, 80);

        return () => clearInterval(timer);
    }, [L]);

    // If we are within the first 3 scans, calculate the active row using modulo
    const scanRow = tick < L * 3 ? tick % L : -1;
    const heroVisible = phase !== "loading";

    useEffect(() => {
        const hero = heroRef.current;
        // No parallax on phones (the original mobile hero).
        if (
            !hero ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            window.matchMedia('(max-width: 767.98px)').matches
        ) {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const context = gsap.context(() => {
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            timeline
                .to('[data-hero-parallax="content"]', {
                    yPercent: 34,
                    ease: 'none',
                }, 0)
                .to('[data-hero-parallax="detail"]', {
                    yPercent: 12,
                    ease: 'none',
                }, 0);
        }, hero);

        return () => context.revert();
    }, []);

    return (
        <main ref={heroRef} id="hero" className="relative min-h-[70vh] lg:min-h-[90vh] overflow-hidden bg-black pb-12">
            {/* Drifting dot-field background */}
            {isDesktop !== null && (
                <motion.div
                    initial={false}
                    animate={{ opacity: heroVisible ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    // Ends at the footer's bottom edge, like the corner frames.
                    className="absolute inset-x-0 top-0 z-0"
                    style={{ bottom: '2vh' }}
                >
                    <DotFieldBackground spacing={18} scale={0.125} />
                </motion.div>
            )}
            {/* Top Header */}
            <motion.div
                initial={false}
                // Opacity only: the loader's S.REATEGUI lands exactly on the logo below,
                // so the header can't slide in under it.
                animate={{ opacity: heroVisible ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                data-thermal-field-top
                className="absolute top-0 left-0 right-0 z-20 border-b border-white/20"
            >
                <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* data-hero-logo: where the loader's S.REATEGUI flies to (page-loader.tsx).
                            Hidden until the loader is gone, then shown in the same frame the
                            landed logo goes: a swap, never two logos on screen together. */}
                        <div
                            data-hero-logo
                            style={{ opacity: phase === "revealed" ? 1 : 0 }}
                            className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12 select-none"
                        >
                            S.REATEGUI
                        </div>
                        <div className="hidden sm:block lg:hidden xl:block h-3 lg:h-4 w-px bg-white/40"></div>
                        <span className="hidden sm:inline lg:hidden xl:inline text-white/60 text-[8px] lg:text-[10px] font-mono tracking-widest">{t.hero.portfolio}</span>
                    </div>

                    <nav className="hidden lg:flex items-center lg:gap-4 xl:gap-8 lg:text-[10px] xl:text-[11px] tracking-wider font-mono text-white/70 uppercase">
                        <a href="#about" className="hover:text-blue-400 transition-colors duration-200">{t.nav.about}</a>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <a href="#projects" className="hover:text-blue-400 transition-colors duration-200">{t.nav.projects}</a>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <a href="#education" className="hover:text-blue-400 transition-colors duration-200">{t.nav.education}</a>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <a href="#Skills" className="hover:text-blue-400 transition-colors duration-200">{t.nav.skills}</a>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <a href="#contact" className="hover:text-blue-400 transition-colors duration-200">{t.nav.contact}</a>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <FrameButton
                            as="button"
                            variant="outline"
                            onClick={toggleLanguage}
                            className="px-3 py-1 text-[10px] text-white border-transparent hover:border-transparent focus:outline-none"
                            offset={2}
                            hoverOffset={2}
                            size={10}
                        >
                            <span className={language === 'en' ? 'font-bold' : 'text-white/50'}>EN</span>
                            <span className="text-white/30 mx-1">/</span>
                            <span className={language === 'es' ? 'font-bold' : 'text-white/50'}>ES</span>
                        </FrameButton>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-white/70 hover:text-white p-2"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl lg:hidden flex flex-col pt-24 px-8 font-mono"
                    >
                        <button
                            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={24} />
                        </button>

                        <nav className="flex flex-col gap-10 text-lg tracking-widest text-white/90 mt-8 uppercase">
                            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition-colors duration-200">{t.nav.about}</a>
                            <a href="#projects" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition-colors duration-200">{t.nav.projects}</a>
                            <a href="#education" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition-colors duration-200">{t.nav.education}</a>
                            <a href="#Skills" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition-colors duration-200">{t.nav.skills}</a>
                            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition-colors duration-200">{t.nav.contact}</a>

                            <div className="pt-8 mt-4 border-t border-white/10 flex items-center">
                                <FrameButton
                                    as="button"
                                    variant="outline"
                                    onClick={toggleLanguage}
                                    className="px-4 py-2 text-sm text-white border-transparent hover:border-transparent focus:outline-none"
                                    offset={2}
                                    hoverOffset={2}
                                    size={10}
                                >
                                    <span className={language === 'en' ? 'font-bold' : 'text-white/50'}>EN</span>
                                    <span className="text-white/30 mx-2">/</span>
                                    <span className={language === 'es' ? 'font-bold' : 'text-white/50'}>ES</span>
                                </FrameButton>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner Frame Accents */}
            <div data-hero-parallax="detail" className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
            <div data-hero-parallax="detail" className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
            <div data-hero-parallax="detail" className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" style={{ bottom: '2vh' }}></div>
            <div data-hero-parallax="detail" className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" style={{ bottom: '2vh' }}></div>

            <div ref={contentRef} data-hero-parallax="content" className="relative z-10 flex md:flex-row min-h-[70vh] md:min-h-[90vh] md:justify-start items-center pt-16 lg:pt-0" style={{ marginTop: '2vh' }}>
                {/* Desktop only: the hero figure (see HERO_FIGURE). It lives in the same
                    parallax layer as the copy so it stays level with it while scrolling,
                    and is laid out from the copy block's measured box (the "001" rule
                    down to the SYS.ACT rule). */}
                {isDesktop && <motion.div
                    initial={false}
                    animate={{ opacity: heroVisible ? 1 : 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-x-0 top-0 bottom-0 md:-bottom-12"
                    style={copyBox === null ? undefined : ({ '--hero-copy-top': `${copyBox.top}px`, '--hero-copy-height': `${copyBox.height}px`, '--hero-copy-left': `${copyBox.left}px`, '--hero-copy-right': `${copyBox.right}px`, '--hero-logo-top': `${copyBox.logoTop}px` } as React.CSSProperties)}
                >
                    {HERO_FIGURE === 'thinker' ? (
                        <>
                            {/* The Thinker and his laptop stand on the copy's SYS.ACT rule: the
                                box runs from the top of the >_ SR logo down to that line, and the
                                art's floor row sits on its bottom edge. Starts just past the copy
                                so the laptop never runs under it. */}
                            <AsciiThinker
                                revealed={heroVisible}
                                className={`absolute left-[calc(var(--hero-copy-right,44%)_+_36px)] ${THINKER_X}`}
                                style={{
                                    top: THINKER_TOP,
                                    height: `calc(${COPY_FLOOR} - ${THINKER_TOP})`,
                                }}
                            />
                            {/* The SYS.ACT rule carried on to the right as the floor they stand on. */}
                            <div
                                aria-hidden
                                className={`absolute left-[calc(var(--hero-copy-right,44%)_+_12px)] h-px bg-white opacity-40 ${THINKER_X}`}
                                style={{ top: COPY_FLOOR }}
                            />
                        </>
                    ) : HERO_FIGURE === 'globe' ? (
                        <AsciiGlobe
                            revealed={heroVisible}
                            remoteLabel={language === 'es' ? 'REMOTO' : 'REMOTE'}
                            className="absolute right-[3%] top-[calc(var(--hero-copy-top,18%)_-_var(--hero-copy-height,64%)_*_0.06)] h-[calc(var(--hero-copy-height,64%)_*_1.12)] w-[54%]"
                        />
                    ) : (
                        <PixelAvatar
                            revealed={heroVisible}
                            fitArtQuery="(min-width: 768px)"
                            fieldQuery="(min-width: 768px)"
                            backdropGrid
                            className="absolute items-start -right-[3%] top-[calc(var(--hero-copy-top,18%)_+_var(--hero-copy-height,64%)_*_0.125)] h-[calc(var(--hero-copy-height,64%)_*_0.75)] w-[56%] opacity-90"
                        />
                    )}
                </motion.div>}

                <div className="container mx-auto px-6 md:px-8 md:ml-[2%] xl:ml-[5%]">
                    <motion.div
                        initial={false}
                        animate={{
                            opacity: heroVisible ? 1 : 0,
                            y: heroVisible ? 0 : 28,
                        }}
                        transition={{
                            duration: 0.55,
                            ease: [0.22, 1, 0.36, 1],
                            delay: phase === "transitioning" ? 0.16 : 0,
                        }}
                        className="max-w-lg md:max-w-[44vw] lg:max-w-lg lg:max-[1439px]:max-w-[460px] relative"
                        ref={copyRef}
                    >
                        {/* Mobile only: the pixel avatar in the top-right corner, from the 001
                            rule down beside the logo and the whoami line. */}
                        {isDesktop === false && (
                            <PixelAvatar
                                revealed={heroVisible}
                                field={false}
                                className="pointer-events-none absolute -right-4 top-0 h-36 w-36"
                            />
                        )}

                        {/* Top decorative line */}
                        <div className="flex items-center gap-2 mb-3 opacity-60">
                            <div className="w-8 h-px bg-white"></div>
                            <span className="text-white text-[10px] font-mono tracking-wider">001</span>
                            {/* On phones the rule stops short of the avatar's head. */}
                            <div className="flex-1 h-px bg-white mr-[140px] md:mr-0"></div>
                        </div>

                        {/* Title with dithered accent */}
                        <div className="relative">
                            <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>                            <div data-hero-logo-ascii className="mb-7 [@media(max-height:850px)]:mb-5 w-fit text-[9px] md:text-[15px] md:[@media(max-height:850px)]:text-[13px] leading-none whitespace-pre drop-shadow-[0_0_15px_rgba(96,165,250,0.8)] flex flex-col font-bold">
                                {asciiLines.map((line, i) => {
                                    const isScanning = i === scanRow;
                                    const rowColor = 'text-blue-400';

                                    return (
                                        <pre
                                            key={i}
                                            className={`${isScanning ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] brightness-150 font-black' : rowColor} transition-colors duration-75 ease-in-out m-0 p-0 leading-[1.1]`}
                                        >
                                            {line}
                                        </pre>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Decorative dots pattern - desktop only */}
                        <div className="hidden md:flex gap-1 mb-8 [@media(max-height:850px)]:mb-5 opacity-40 flex-wrap max-w-max">
                            {Array.from({ length: 52 }).map((_, i) => (
                                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full shrink-0"></div>
                            ))}
                        </div>

                        {/* Description with subtle grid pattern */}
                        <div className="relative">
                            <p className="text-xs md:text-base text-gray-200 mb-5 md:mb-6 leading-relaxed font-mono opacity-100 max-w-md [text-shadow:_0_2px_4px_rgb(0_0_0_/_100%),_0_0_10px_rgb(0_0_0_/_100%)] md:[text-shadow:_none]">
                                <span className="text-white font-bold block w-fit mb-2">
                                    <span className="text-blue-400">guest@sreategui:~$ </span>
                                    <span>{commandText}</span>
                                    {!showResponse && (
                                        <span className="inline-block w-1.5 h-[1.1em] bg-blue-400 ml-1 animate-pulse align-middle -translate-y-px" />
                                    )}
                                    {/* Always rendered, hidden until the command is typed, so the
                                        line's height is reserved and nothing below it jumps. */}
                                    <span className={`block mt-1.5 text-white ${showResponse ? '' : 'invisible'}`} aria-hidden={!showResponse}>
                                        {roleDisplayText}
                                        <span className="inline-block w-1.5 h-[1.1em] bg-blue-400 ml-1 animate-pulse align-middle -translate-y-px" />
                                    </span>
                                </span>
                                {t.hero.description}
                            </p>

                        </div>

                        <div className="flex flex-col gap-8 md:gap-10 md:[@media(max-height:850px)]:gap-7">
                            {/* Quick Metrics */}
                            <div className="order-2 md:order-1 flex items-center gap-4 md:gap-8 opacity-90 max-w-max border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
                                <div className="flex flex-col">
                                    <span className="text-white font-extrabold text-xl md:text-3xl tracking-tight">{t.hero.metrics.metric1.value}</span>
                                    <span className="text-[9px] md:text-[10px] text-white/50 tracking-widest font-mono uppercase mt-1">{t.hero.metrics.metric1.label}</span>
                                </div>
                                <div className="w-px h-8 md:h-10 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-white font-extrabold text-xl md:text-3xl tracking-tight">{t.hero.metrics.metric2.value}</span>
                                    <span className="text-[9px] md:text-[10px] text-white/50 tracking-widest font-mono uppercase mt-1">{t.hero.metrics.metric2.label}</span>
                                </div>
                                <div className="w-px h-8 md:h-10 bg-white/10"></div>
                                <div className="flex flex-col items-start">
                                    <span className="text-white font-extrabold text-xl md:text-3xl tracking-tight">{t.hero.metrics.metric3.value}</span>
                                    <span className="text-[9px] md:text-[10px] text-white/50 tracking-widest font-mono uppercase mt-1">{t.hero.metrics.metric3.label}</span>
                                </div>
                            </div>

                            {/* Buttons with technical accents */}
                            <div className="order-1 md:order-2 grid w-[min(100%,19rem)] grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3 md:w-full md:max-w-none md:gap-3">
                                <a
                                    href="https://www.linkedin.com/in/sebasreateguib"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative col-span-2 md:col-span-1 flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 md:px-6 lg:max-[1439px]:px-3 md:py-3 bg-blue-500/20 text-white font-mono text-xs md:text-xs lg:text-sm border border-blue-400/70 hover:bg-blue-500/35 hover:border-blue-300 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                                >
                                    <span className="hidden md:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="hidden md:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <svg className="w-4 h-4 fill-current text-blue-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    {t.contact.linkedin}
                                </a>

                                <a href={language === 'es' ? '/CV-SebastianReategui-ES.pdf' : '/CV-SebastianReategui-EN.pdf'} download={language === 'es' ? 'CV-SebastianReategui-ES.pdf' : 'CV-SebastianReategui-EN.pdf'} className="relative col-span-2 md:col-span-1 lg:col-span-3 order-last flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-4 py-2 md:px-3 lg:px-6 md:py-2.5 bg-transparent text-white font-mono text-xs md:text-xs lg:text-sm border border-white hover:bg-white hover:text-black transition-all duration-200 group">
                                    <span className="hidden md:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="hidden md:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <Download className="w-4 h-4" />
                                    {t.hero.downloadResume}
                                </a>

                                <a href="https://github.com/sebasreateguib" target="_blank" rel="noopener noreferrer" className="relative col-span-2 md:col-span-1 flex min-h-11 items-center justify-center gap-2 px-3 py-2 md:px-6 lg:max-[1439px]:px-3 md:py-2.5 bg-transparent border border-white text-white font-mono text-xs md:text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    GitHub
                                </a>

                                <a href="#contact" className="relative col-span-2 md:col-span-1 hidden md:flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-3 py-2 md:px-6 lg:max-[1439px]:px-3 md:py-2.5 bg-transparent border border-white text-white font-mono text-xs md:text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200 group">
                                    <span className="hidden md:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <span className="hidden md:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    <MessageSquare className="w-4 h-4" />
                                    {t.hero.letsTalk}
                                </a>
                            </div>
                        </div>

                        {/* Bottom technical notation - desktop only */}
                        <div className="hidden md:flex items-center gap-2 mt-8 [@media(max-height:850px)]:mt-5 opacity-40">
                            <span className="text-white text-[9px] font-mono">∞</span>
                            <div className="flex-1 h-px bg-white"></div>
                            <span className="text-white text-[9px] font-mono">SYS.ACT</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Footer */}
            <motion.div
                initial={false}
                animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                className="absolute left-0 right-0 z-20 border-t border-white/20 bg-black/40 backdrop-blur-sm"
                style={{ bottom: '2vh' }}
            >
                <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
                        <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
                        <span className="lg:hidden">SYS.ACT</span>
                        <Waveform
                            bars={8}
                            intensity="low"
                            playing={heroVisible}
                            compact
                            className="hidden lg:block"
                        />
                        <span>V1.0.0</span>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
                        <span className="hidden lg:inline">◐ RENDERING</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="hidden lg:inline">FRAME: ∞</span>
                    </div>
                </div>
            </motion.div>

            <style>{`
        .dither-pattern {
          background-image: 
            repeating-linear-gradient(0deg, transparent 0px, transparent 1px, white 1px, white 2px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 1px, white 1px, white 2px);
          background-size: 3px 3px;
        }      `}</style>
        </main>
    );
}
