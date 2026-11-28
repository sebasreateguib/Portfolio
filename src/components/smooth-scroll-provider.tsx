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

/**
 * A scroll gate: the page can't be scrolled down past `getY()` (a scroll
 * position) until it's released. Attempts to go further call `onBlocked`.
 * Navigating (an in-page link or scrollTo) to anything below the gate
 * releases it, so the menus never leave anyone stuck.
 */
type ScrollGate = {
  getY: () => number;
  onBlocked: () => void;
  /** Called when navigation opens the gate (not when setGate clears it). */
  onRelease?: () => void;
};

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  scrollTo: (target: ScrollTarget) => void;
  lock: () => void;
  unlock: () => void;
  /** Sets the gate (null clears it). */
  setGate: (gate: ScrollGate | null) => void;
};

// Where a scroll target lands, as a page scroll position.
function targetY(target: ScrollTarget) {
  if (typeof target === "number") return target;
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}

const BLOCKED_THROTTLE_MS = 700;
const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lockCountRef = useRef(0);
  const gateRef = useRef<ScrollGate | null>(null);

  // Anything sent below the gate on purpose opens it.
  const passGate = useCallback((y: number) => {
    const gate = gateRef.current;
    if (gate && y > gate.getY() + 1) {
      gateRef.current = null;
      gate.onRelease?.();
    }
  }, []);

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
      passGate(targetY(target));
      instance.scrollTo(target);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);

    // ---- the scroll gate ----
    let lastBlocked = 0;
    const blocked = () => {
      const now = performance.now();
      if (now - lastBlocked < BLOCKED_THROTTLE_MS) return;
      lastBlocked = now;
      gateRef.current?.onBlocked();
    };
    const atGate = () => {
      const gate = gateRef.current;
      return gate !== null && Math.max(window.scrollY, instance.targetScroll) >= gate.getY() - 1;
    };
    // Runs before Lenis sees the wheel, so a blocked turn never moves the page.
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || !atGate()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      blocked();
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (y >= touchY || !atGate()) return; // finger moving up scrolls down
      event.preventDefault();
      blocked();
    };
    const onKey = (event: KeyboardEvent) => {
      if (!DOWN_KEYS.has(event.key) || (event.key === " " && event.shiftKey) || !atGate()) return;
      const el = event.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName))) return;
      event.preventDefault();
      blocked();
    };
    // A fling or the scrollbar can still carry the page past it: bring it back.
    const holdAtGate = () => {
      const gate = gateRef.current;
      if (!gate) return;
      const y = gate.getY();
      if (window.scrollY > y + 8) {
        instance.scrollTo(y, { immediate: true, force: true });
        blocked();
      } else if (instance.targetScroll > y) {
        instance.scrollTo(y, { force: true });
      }
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("keydown", onKey, { capture: true });
    instance.on("scroll", holdAtGate);
    window.addEventListener("scroll", holdAtGate, { passive: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      instance.off("scroll", holdAtGate);
      window.removeEventListener("scroll", holdAtGate);
      instance.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [passGate]);

  const scrollTo = useCallback((target: ScrollTarget) => {
    passGate(targetY(target));
    lenisRef.current?.scrollTo(target);
  }, [passGate]);

  const setGate = useCallback((gate: ScrollGate | null) => {
    gateRef.current = gate;
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
    () => ({ lenis, scrollTo, lock, unlock, setGate }),
    [lenis, scrollTo, lock, unlock, setGate],
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
