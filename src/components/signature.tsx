"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";

import { cn } from "@/lib/utils";

// Cursiva monolínea que deletrea "Sebastian", dibujada sobre una grilla de
// 560x200 con baseline y=130, altura de x en y=88 y ascendentes en y=46; el
// viewBox de abajo la recorta a los límites de la tinta.
//
// Los subpaths van en el orden en que los haría una pluma: la "S" mayúscula,
// "ebastian" de un solo trazo, la barra de la "t", el punto de la "i" y el
// floreo final, que barre a la derecha y vuelve por debajo de todo el nombre.
const DEFAULT_SIGNATURE_PATH =
  "M108 68 C104 54 86 46 72 55 C57 65 61 81 78 89 C95 97 112 103 112 117 C112 131 96 140 80 135 C72 132 68 127 69 122 " +
  "M104 132 C110 118 116 96 128 86 C138 78 146 86 138 96 C130 106 116 104 112 98 C106 90 108 116 120 128 C128 134 142 128 150 116 " +
  "C160 100 168 70 172 56 C175 46 167 42 164 54 C161 66 156 100 156 118 C155 130 168 136 178 130 C188 124 184 108 173 106 C166 105 162 109 165 114 " +
  "C172 120 178 124 188 126 C196 118 210 102 221 88 C214 82 203 88 203 104 C203 118 210 130 220 128 C228 126 229 112 227 100 C225 92 223 89 221 88 " +
  "C221 100 219 116 222 127 C225 134 233 132 239 126 C245 114 250 100 254 90 C255 86 253 83 251 87 C248 95 242 107 243 116 C244 125 252 131 262 127 " +
  "C272 106 282 74 291 58 C295 48 300 50 297 62 C294 76 288 106 288 120 C288 130 296 133 304 126 " +
  "C308 124 312 122 314 118 C316 110 318 100 320 92 C321 87 320 96 319 105 C318 115 318 124 320 128 C323 134 330 133 336 127 " +
  "C344 118 356 102 365 88 C358 82 347 88 347 104 C347 118 354 130 364 128 C372 126 373 112 371 100 C369 92 367 89 365 88 " +
  "C365 100 363 116 366 127 C369 134 377 132 383 126 C387 122 393 108 399 92 C403 82 411 84 412 96 C413 106 412 118 411 127 " +
  "C413 112 419 94 428 87 C436 82 443 88 443 100 C443 110 442 120 445 128 " +
  "M276 74 C288 70 300 68 310 68 " +
  "M328 72 L330 71 " +
  "M445 128 C463 138 493 138 511 122 C525 109 509 96 497 108 C483 122 459 150 417 154 C327 164 177 160 87 148 C67 144 55 138 57 130";
const DEFAULT_SIGNATURE_EASING = "cubic-bezier(0.2, 0.2, 0.8, 0.9)";

type SignatureProps = {
  path?: string;
  viewBox?: string;
  size?: number | string;
  strokeWidth?: number;
  duration?: number | string;
  delay?: number | string;
  easing?: string;
  className?: string;
  ariaLabel?: string;
};

function toCssTime(value: number) {
  return `${value}s`;
}

/** Acepta 2.8, "2.8s" o "2800ms" y devuelve segundos. */
function toSeconds(value: number | string) {
  if (typeof value === "number") return value;
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.trim().endsWith("ms") ? amount / 1000 : amount;
}

/** Pausa entre trazos, como el levantar la pluma al firmar. */
const PEN_LIFT = 0.06;

export function Signature({
  path = DEFAULT_SIGNATURE_PATH,
  viewBox = "45 34 482 134",
  size = "100%",
  strokeWidth = 4,
  duration = 2.8,
  delay = 0,
  easing = DEFAULT_SIGNATURE_EASING,
  className,
  ariaLabel = "Animated signature",
}: SignatureProps) {
  const width = typeof size === "number" ? `${size}px` : size;

  // La firma vive muy abajo en la página: sin esto el trazo se dibujaría al
  // montar, fuera de pantalla, y llegarías a la sección con la firma ya hecha.
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  // Un <path> por trazo. En un solo path el patrón de guiones se reinicia en
  // cada subpath, así que los cinco se dibujarían a la vez y los cortos (la
  // barra de la "t", el punto de la "i") saldrían de golpe.
  const strokes = useMemo(
    () => path.split(/(?=M)/).map((d) => d.trim()).filter(Boolean),
    [path]
  );

  // El reparto del tiempo se hace por longitud real, para que la pluma vaya
  // siempre a la misma velocidad en vez de tardar lo mismo en cada trazo.
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lengths, setLengths] = useState<number[]>([]);

  useEffect(() => {
    setLengths(
      strokes.map((_, i) => pathRefs.current[i]?.getTotalLength() ?? 0)
    );
  }, [strokes]);

  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  const totalSeconds = toSeconds(duration);
  const baseDelay = toSeconds(delay);
  // Las pausas salen del presupuesto total, así que `duration` sigue siendo
  // lo que tarda la firma entera de principio a fin.
  const lifts = Math.max(strokes.length - 1, 0) * PEN_LIFT;
  const drawSeconds = Math.max(totalSeconds - lifts, 0.001);

  let elapsed = baseDelay;
  const timings = strokes.map((_, i) => {
    const share = totalLength > 0 ? (lengths[i] ?? 0) / totalLength : 1 / strokes.length;
    const strokeDuration = drawSeconds * share;
    const timing = { delay: elapsed, duration: strokeDuration };
    elapsed += strokeDuration + PEN_LIFT;
    return timing;
  });

  // Hasta medir no se anima nada: los trazos quedan ocultos por el dashoffset.
  const measured = totalLength > 0;

  return (
    <svg
      ref={ref}
      aria-label={ariaLabel}
      className={cn("block overflow-visible", className)}
      role="img"
      style={{ width, height: "auto" }}
      viewBox={viewBox}
    >
      {strokes.map((d, i) => (
        <path
          key={i}
          ref={(node) => {
            pathRefs.current[i] = node;
          }}
          className={cn(
            "dqnamo-signature-stroke",
            isInView && measured && "is-drawing"
          )}
          d={d}
          pathLength={1}
          style={{
            animationDelay: toCssTime(timings[i].delay),
            animationDuration: toCssTime(timings[i].duration),
            animationTimingFunction: easing,
            strokeWidth,
          }}
        />
      ))}

      <style>{`
        .dqnamo-signature-stroke {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          /* Un trazo oculto por el dashoffset aún pinta el remate redondo como
             un punto suelto; con visibility no aparece hasta que le toca. */
          visibility: hidden;
        }

        /* El trazo sólo empieza a correr cuando la firma entra en pantalla. */
        .dqnamo-signature-stroke.is-drawing {
          animation-name: dqnamo-draw-signature;
          animation-fill-mode: forwards;
        }

        @keyframes dqnamo-draw-signature {
          from {
            visibility: visible;
            stroke-dashoffset: 1;
          }
          to {
            visibility: visible;
            stroke-dashoffset: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dqnamo-signature-stroke {
            animation-duration: 1ms !important;
            animation-delay: 0s !important;
          }
        }
      `}</style>
    </svg>
  );
}

export default Signature;
