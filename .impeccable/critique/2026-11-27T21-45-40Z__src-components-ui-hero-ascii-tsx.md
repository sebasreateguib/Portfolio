---
target: desktop hero composition with the ASCII Thinker
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-11-27T21-45-40Z
slug: src-components-ui-hero-ascii-tsx
---
# Crítica: composición del hero (desktop) con El Pensador ASCII

## Puntaje de salud de diseño
| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | Typewriter, LIVE, SYSTEM.ACTIVE y la entrada con barrido comunican que la página está viva |
| 2 | Coincidencia con el mundo real | 3 | La metáfora de terminal encaja; "AI & SW / FOCUSED ENG." es jerga y la tapa de la laptop se lee como un rombo |
| 3 | Control y libertad | 3 | Nav y EN/ES siempre visibles; respeta reducir movimiento |
| 4 | Consistencia | 2 | Los bordes no coinciden: texto en x111 y logo del nav en x58; la figura se pasa 31px del borde derecho del nav (66px a 1155) |
| 5 | Prevención de errores | 3 | Pocas acciones de riesgo |
| 6 | Reconocer en vez de recordar | 3 | Todas las acciones visibles y etiquetadas |
| 7 | Flexibilidad y eficiencia | n/a | Hero de portafolio |
| 8 | Estético y minimalista | 2 | Demasiados focos: grilla de puntos, esquinas, banner LIVE, barra de estado, dock del chat, ⊡ suelto, logo con glow y figura |
| 9 | Recuperación de errores | 3 | Poco que pueda fallar |
| 10 | Ayuda y documentación | n/a | Hero de portafolio |
| **Total** | | **22/32** | **Aceptable (69 %)** |

## Veredicto de especificidad
Específico de la persona: El Pensador relleno con BUILD mirando una laptop junto a `guest@sreategui:~$ whoami` solo puede ser este portafolio. El azul une el logo `>_ SR` (arriba a la izquierda) con la pantalla (abajo al centro) en diagonal. Riesgo: El Pensador es un cliché de "pensar"; lo salvan el relleno BUILD y la laptop, y ambos se debilitan cuando la figura se achica (letras de 6px, laptop de ~130px).
Detector CLI: 1 hallazgo (`codex-grid-background`, hero-ascii.tsx:567, la textura `.dither-pattern` de 3px; probable falso positivo de intención). 0 en ascii-thinker.tsx. En la página, dentro de #hero solo `undersized-ui-text`: 12 a 1600 y 16 a 1155 (etiquetas de 9–10px: 001, YEAR CS, SYS.ACT, barra de estado, nav a 1155).

## Problemas prioritarios
1. [P1] La figura flota ~30px por debajo del bloque de texto (medido: +30px de centro a 1600 y a 1155). Su piso queda 95px bajo la línea SYS.ACT y la laptop termina debajo de los botones. Fix: anclar el piso del arte a la línea SYS.ACT (alinear abajo), altura ~1.10–1.15× la del texto, dejar ≥40px bajo el nav. Comando: layout.
2. [P1] En 1150–1300px la figura se achica 36 % mientras el texto no cambia (0.79× la altura del texto a 1155; letras de 6.3px). ~11 % del canvas son puntos de halo casi invisibles. Fix: posicionar por el borde visible de la laptop dejando que el halo pase bajo el texto, gap 32–40px; opcional: columna de texto de 512 a ~460px. Comando: adapt.
3. [P2] El borde derecho usa el viewport (`right-[1.5%]`) y no el sistema de márgenes del texto: 40px a la derecha contra 111px a la izquierda; se pasa del nav; en pantallas ≥1800 la distancia texto–laptop crecería (estimado ~500px a 1920, no capturado). Fix: a ≥1440 espejar el margen izquierdo del texto y limitar el grupo a ~1440–1536px centrado. Comando: layout.
4. [P2] La laptop es débil para su papel de puente: ~140px de ancho, la tapa se lee como rombo, la base en puntos tenues se mezcla con la grilla. Fix: más contraste en base y bisagra, laptop ~1.15× más grande, tapar la grilla de puntos detrás de la figura y la laptop. Comando: polish.
5. [P2] Choques en pantallas de 800px de alto: el dock de SR Copilot tapa la línea SYS.ACT a 1155 (solapa ~10px) y el `001` queda a 11px del nav. Fix: compactar el bloque de texto con max-height:850px o mover el dock a la derecha. Comando: adapt.

## Alertas por persona
- Jordan (primera visita): ve "una estatua de letras"; no lee BUILD bajo 1300px ni reconoce la laptop; cuatro CTAs de peso similar y dos entradas al chat; las letras que fluyen distraen mientras lee la bio.
- Riley (pone a prueba): achica la ventana de 1600 a 1150 y la figura pierde un tercio; a 800px de alto el dock tapa el final del texto; al cambiar a ES el texto cambia de alto y la figura se reacomoda.

## Observaciones menores
- Un glifo ⊡ suelto en el espacio entre texto y figura (x632,y479 a 1600) parece un bug.
- El flujo de BUILD cada 520ms es rápido para la visión periférica; 800–1000ms o esperar a que termine el typewriter.
- Comentario desactualizado sobre la figura en hero-ascii.tsx (todavía describe el avatar).
- Etiquetas de 9–10px (detector), aceptables como micro-etiquetas decorativas pero en el límite.
- Dos entradas al mismo chat (banner "Try it" y dock).

## Preguntas
- ¿Debería la línea SYS.ACT extenderse a la derecha como el piso real donde apoyan la roca y la laptop?
- ¿Y si la pantalla de la laptop brillara al pasar el mouse por un CTA, para que la figura "responda" al texto?
- En pantallas anchas, ¿el espacio entre texto y laptop es aire intencional o el grupo debería ser más compacto?
