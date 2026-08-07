"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MarkerHighlightProps {
  before?: string;
  highlight: string;
  after?: string;
  markerColor?: string;
  baseColor?: string;
  highlightedTextColor?: string;
  speed?: number;
  /** Extra delay (seconds) before the marker sweeps in. Useful for staggering. */
  delay?: number;
  /**
   * When provided, the animation is driven by this flag instead of the viewport.
   * Pass `false` to hold the marker back (e.g. while a loader is still on screen).
   */
  active?: boolean;
  className?: string;
}

const isCssColorValue = (color?: string): boolean => {
  if (!color) return false;
  return (
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.startsWith("var(")
  );
};

export function MarkerHighlight({
  before = "",
  highlight,
  after = "",
  markerColor = "#facc15",
  baseColor,
  highlightedTextColor,
  speed = 1,
  delay = 0,
  active,
  className,
}: MarkerHighlightProps) {
  const [inViewport, setInViewport] = useState(false);
  const isControlled = active !== undefined;
  const isInView = isControlled ? active : inViewport;

  const isMarkerCss = isCssColorValue(markerColor);
  const isBaseCss = isCssColorValue(baseColor);
  const isHighlightTextCss = isCssColorValue(highlightedTextColor);

  const bgClass = markerColor && !isMarkerCss ? markerColor : "";
  const baseTextClass = baseColor && !isBaseCss ? baseColor : "";
  const highlightTextClass =
    highlightedTextColor && !isHighlightTextCss && isInView
      ? highlightedTextColor
      : "";

  const resolvedBaseColor = isBaseCss
    ? baseColor
    : baseColor
      ? undefined
      : "hsl(var(--foreground))";
  const resolvedHighlightedTextColor = highlightedTextColor
    ? isHighlightTextCss
      ? highlightedTextColor
      : undefined
    : resolvedBaseColor;

  const markerTransition = {
    type: "spring" as const,
    damping: 14,
    stiffness: 100,
    delay: 0.2 / speed + delay,
  };

  return (
    <span
      className={cn("inline-block tracking-tight", baseTextClass, className)}
      style={{
        color: resolvedBaseColor,
      }}
    >
      {before && <span>{before} </span>}
      <span style={{ position: "relative", display: "inline-block" }}>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          {...(isControlled
            ? { animate: { scaleX: isInView ? 1 : 0 } }
            : {
                whileInView: { scaleX: 1 },
                viewport: { once: true },
                onViewportEnter: () => setInViewport(true),
              })}
          transition={markerTransition}
          className={cn("absolute origin-left z-0", bgClass)}
          style={{
            inset: "0 -0.1em",
            background: isMarkerCss ? markerColor : undefined,
            transformOrigin: "left center",
          }}
        />
        <span
          className={cn("transition-colors ease-out", highlightTextClass)}
          style={{
            position: "relative",
            zIndex: 1,
            color: isInView ? resolvedHighlightedTextColor : resolvedBaseColor,
            transitionDuration: `${0.25 / speed}s`,
            transitionDelay: `${0.45 / speed + delay}s`,
          }}
        >
          {highlight}
        </span>
      </span>
      {after && <span> {after}</span>}
    </span>
  );
}
