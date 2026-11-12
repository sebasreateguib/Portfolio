"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

type ScrollTarget = string | HTMLElement | number;

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  scrollTo: (target: ScrollTarget) => void;
  lock: () => void;
  unlock: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lockCountRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis();
    const updateScrollTrigger = () => ScrollTrigger.update();
    const raf = (time: number) => instance.raf(time * 1000);

    lenisRef.current = instance;
    setLenis(instance);
    instance.on("scroll", updateScrollTrigger);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    if (lockCountRef.current > 0) instance.stop();

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      instance.scrollTo(target);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      instance.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo = useCallback((target: ScrollTarget) => {
    lenisRef.current?.scrollTo(target);
  }, []);

  const lock = useCallback(() => {
    lockCountRef.current += 1;
    lenisRef.current?.stop();
  }, []);

  const unlock = useCallback(() => {
    lockCountRef.current = Math.max(0, lockCountRef.current - 1);
    if (lockCountRef.current === 0) lenisRef.current?.start();
  }, []);

  const value = useMemo(
    () => ({ lenis, scrollTo, lock, unlock }),
    [lenis, scrollTo, lock, unlock],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error("useSmoothScroll must be used inside SmoothScrollProvider");
  }
  return context;
}

export function useLenisLock(locked: boolean) {
  const { lock, unlock } = useSmoothScroll();

  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked, lock, unlock]);
}
