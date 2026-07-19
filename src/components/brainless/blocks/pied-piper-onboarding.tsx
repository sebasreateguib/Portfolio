"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ClaudeMessage } from "@/components/brainless/claude/claude-message";
import { ClaudeThinking } from "@/components/brainless/claude/claude-thinking";
import { ClaudePrompt } from "@/components/brainless/claude/claude-prompt";
import { ClaudeTodoList, type Todo } from "@/components/brainless/claude/claude-todo-list";

import { FULL_STACK_BIO, SKILLS_CONTENT, PROJECTS_DATA, CONTACT_INFO, PERSONAL_EXTRA } from '@/data/content';
import { useLanguage } from '@/context/LanguageContext';
import { TerminalMarkdown } from '@/components/ui/terminal-markdown';

/**
 * PiedPiperOnboarding — an interactive sign-up flow built from brainless
 * components. Refactored into a functional AI Terminal Copilot.
 */

const CLI_BRAND = "#ffffff"; // White
const CLAUDE_COLOR = "#cd694a"; // Claude's Terracotta
const GRAY = "#8c8273"; // Warm Taupe
const FG = "#eaddcf"; // Warm Off-White

// Claude Code logo as a 1-bit terminal sprite.
import { LOGO3 } from '@/components/ui/ascii';

const LOGO_BITS = [
  "000111111111111000",
  "000110111111011000",
  "011111111111111110",
  "000111111111111000",
  "000010100001010000",
];

function ClaudeLogo({
  scale = 4,
  color = CLAUDE_COLOR,
  className,
}: {
  scale?: number;
  color?: string;
  className?: string;
}) {
  const w = LOGO_BITS[0].length;
  const h = LOGO_BITS.length;
  const PH = 2.4;
  const rects: React.ReactElement[] = [];
  LOGO_BITS.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] === "1") {
        let end = x;
        while (end < w && row[end] === "1") end += 1;
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y * PH} width={end - x} height={PH} />,
        );
        x = end;
      } else {
        x += 1;
      }
    }
  });
  return (
    <svg
      aria-hidden
      width={w * scale}
      height={h * PH * scale}
      viewBox={`0 0 ${w} ${h * PH}`}
      shapeRendering="crispEdges"
      fill={color}
      className={className}
    >
      {rects}
    </svg>
  );
}

function PiedPiperHeader({ className }: { className?: string }) {
  const { language } = useLanguage();
  return (
    <fieldset
      className={cn(
        "rounded-[6px] border px-4 pb-3.5 pt-1 font-mono text-[13px] leading-[1.5]",
        className,
      )}
      style={{ borderColor: CLI_BRAND, color: FG }}
    >
      <legend className="px-2" style={{ color: CLI_BRAND }}>
        SR Copilot <span style={{ color: GRAY }}>v3.1.4</span>
      </legend>

      <div className="grid gap-4 sm:grid-cols-[1fr_1px_1.1fr]">
        <div className="flex flex-col items-center gap-2 py-1 text-center">
          <div className="font-semibold">{language === 'es' ? 'Bienvenido a SR Copilot' : 'Welcome to SR Copilot'}</div>

          <div className="flex items-center justify-center gap-3 my-2">
            <pre className="text-[7px] leading-tight text-[#e9c46a] text-left">
              {LOGO3.trim()}
            </pre>
            <span className="text-sm font-bold opacity-30" style={{ color: GRAY }}>✕</span>
            <ClaudeLogo />
          </div>

          <div className="space-y-0.5" style={{ color: GRAY }}>
            <div>portfolio · terminal</div>
            <div>ai · assistant</div>
          </div>
        </div>

        <div
          aria-hidden
          className="hidden sm:block"
          style={{ background: `${CLI_BRAND}55` }}
        />

        <div className="min-w-0 space-y-1">
          <div className="font-semibold" style={{ color: CLI_BRAND }}>
            {language === 'es' ? 'Comandos rápidos' : 'Quick commands'}
          </div>
          <div className="truncate text-[12px]"><span style={{ color: CLI_BRAND }}>/help</span> — {language === 'es' ? 'Ver comandos' : 'View commands'}</div>
          <div className="truncate text-[12px]"><span style={{ color: CLI_BRAND }}>/about</span> — {language === 'es' ? 'Información' : 'Information'}</div>
          <div className="truncate text-[12px]"><span style={{ color: CLI_BRAND }}>/projects</span> — {language === 'es' ? 'Ver proyectos' : 'View projects'}</div>
          <div className="my-1.5 h-px" style={{ background: CLI_BRAND }} />
          <div className="font-semibold" style={{ color: CLI_BRAND }}>
            {language === 'es' ? 'Preguntas libres' : 'Free chat'}
          </div>
          <div className="truncate whitespace-normal text-[12px] text-white/70">
            {language === 'es' ? 'Escribe cualquier pregunta y la IA responderá basándose en mi portafolio.' : 'Type any question and the AI will answer based on my portfolio.'}
          </div>
        </div>
      </div>
    </fieldset>
  );
}

type ChatLine =
  | { kind: "assistant"; text: string; isAI?: boolean }
  | { kind: "user"; text: string };

function useTypewriter(
  text: string,
  active: boolean,
  ms = 22,
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = React.useState("");
  const prefersReduced = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!active) return;
    if (prefersReduced) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [text, active, ms, prefersReduced]);

  const done = active && displayed.length >= text.length;
  return { displayed, done };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * PiedPiperOnboarding — interactive demo block refactored as a functional chatbot.
 */
export function PiedPiperOnboarding() {
  const { language } = useLanguage();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const welcomeMessage = React.useMemo(() => language === 'es'
    ? "Hola — ¿en qué te puedo ayudar hoy? (escribe /help para comandos)"
    : "Hey — how can I help you today? (type /help for commands)", [language]);

  const [phase, setPhase] = React.useState<"greeting" | "chat">("greeting");
  const [lines, setLines] = React.useState<ChatLine[]>([]);
  const [draft, setDraft] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);

  const { displayed, done: typed } = useTypewriter(
    welcomeMessage,
    phase === "greeting",
  );

  React.useEffect(() => {
    if (!typed) return;
    if (phase === "greeting") {
      setLines([{ kind: "assistant", text: welcomeMessage, isAI: false }]);
      setPhase("chat");
    }
  }, [typed, phase, welcomeMessage]);

  const commands = {
    'help': () => language === 'es' ? `
**[COMANDOS_DISPONIBLES]**

- \`about\`       Mostrar información personal
- \`projects\`    Ver el portafolio de proyectos
- \`skills\`      Mostrar habilidades técnicas
- \`education\`   Ver historial educativo
- \`contact\`     Mostrar información de contacto
- \`clear\`       Limpiar la pantalla de la terminal
- \`exit\`        Cerrar la terminal
- \`help\`        Mostrar este mensaje de ayuda

**[AI COPILOT ACTIVADO]**
También puedes escribir cualquier pregunta en lenguaje natural (ej. "¿Cuál es tu lenguaje de programación principal?") y la IA responderá basándose en mi portafolio.
    ` : `
**[AVAILABLE_COMMANDS]**

- \`about\`       Display personal information
- \`projects\`    View project portfolio
- \`skills\`      Show technical skills
- \`education\`   View educational background
- \`contact\`     Show contact information
- \`clear\`       Clear terminal screen
- \`exit\`        Close the terminal
- \`help\`        Display this help message

**[AI COPILOT ENABLED]**
You can also type any question in natural language (e.g. "What is your main programming language?") and the AI will answer based on my portfolio.
    `,
    'about': () => `
**${language === 'es' ? 'Nombre' : 'Name'}**: Sebastián Reátegui
**${language === 'es' ? 'Rol' : 'Role'}**: Full Stack Software Engineer / CS Student
**${language === 'es' ? 'Ubicación' : 'Location'}**: Lima, Peru
**${language === 'es' ? 'Estado' : 'Status'}**: ${language === 'es' ? CONTACT_INFO.status.es : CONTACT_INFO.status.en}

**Bio**: ${language === 'es' ? FULL_STACK_BIO.es : FULL_STACK_BIO.en}
    `,
    'projects': () => `
**${language === 'es' ? '[PORTAFOLIO DE PROYECTOS]' : '[PROJECT PORTFOLIO]'}**

` + PROJECTS_DATA.map((p, i) => `${i + 1}. **${language === 'es' ? p.name.es : p.name.en}**\n   ${(language === 'es' ? p.content.es : p.content.en).replace(/\n/g, '\n   ')}`).join('\n\n'),
    'skills': () => language === 'es' ? SKILLS_CONTENT.es : SKILLS_CONTENT.en,
    'education': () => language === 'es' ? `
**[EDUCACIÓN]**

**Universidad de Ingeniería y Tecnología (UTEC)**
Bachiller en Ciencia de la Computación (Computer Science)
Estado: 3er Año / 5to Semestre

*Logros:*
• Finalista en el Concurso Berners Lee - Desarrollo Basado en Plataformas CS2031
    ` : `
**[EDUCATION]**

**Universidad de Ingeniería y Tecnología (UTEC)**
Bachelor of Science in Computer Science
Status: 3rd Year / 5th Semester

*Honors:*
• Berners Lee Contest Finalist - CS2031 Platform-Based Development
    `,
    'contact': () => language === 'es' ? `
**INFORMACIÓN DE CONTACTO**
-----------------------
📧 **Email:**    reateguisebastian@gmail.com
🐙 **GitHub:**   https://github.com/sebasreateguib

Actualmente abierto a nuevas oportunidades, colaboraciones o simplemente para charlar sobre tecnología!
    ` : `
**CONTACT INFORMATION**
-------------------
📧 **Email:**    reateguisebastian@gmail.com
🐙 **GitHub:**   https://github.com/sebasreateguib

I'm currently open to new opportunities, collaborations, or just to chat about tech!
    `,
    'clear': () => {
      setLines([])
      return ''
    }
  }

  // Auto-focus composer when not thinking
  React.useEffect(() => {
    if (!isThinking) {
      const input = rootRef.current?.querySelector<HTMLInputElement>('input[aria-label="Prompt"]');
      input?.focus({ preventScroll: true });
    }
  }, [isThinking]);

  // Auto-scroll on new message
  React.useEffect(() => {
    if (rootRef.current) {
      const messagesContainer = rootRef.current.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [lines, isThinking]);

  async function submit() {
    const value = draft.trim();
    if (!value || isThinking) return;

    setLines((prev) => [...prev, { kind: "user", text: value }]);
    setDraft("");

    const cmdText = value.toLowerCase().replace('/', '');

    if (cmdText === 'clear') {
      setLines([]);
      return;
    }

    const commandFn = commands[cmdText as keyof typeof commands];
    if (commandFn) {
      const output = commandFn();
      if (output) {
        setLines((prev) => [...prev, { kind: "assistant", text: output, isAI: true }]);
      }
      return;
    }

    // AI Copilot Integration Fallback
    setIsThinking(true);

    try {
      const systemInstruction = `
You are "Terminal Copilot", an AI terminal assistant representing Sebastián Reátegui.
Your tone should be very warm, incredibly friendly, enthusiastic, and highly conversational, while still maintaining the developer-friendly terminal aesthetic.
Don't be a cold robot. Use an engaging, conversational voice, and feel free to use a couple of emojis to lighten the mood!
Answer questions about Sebastian concisely but in a very friendly, supportive, and natural way (1 or 2 short paragraphs max).
Keep formatting clean using line breaks and hyphens for lists.
Answer in the language of the user (default to Spanish if they speak Spanish). 

Here is Sebastian's full portfolio information for your context:
- BIO: ${language === "es" ? FULL_STACK_BIO.es : FULL_STACK_BIO.en}
- PERSONAL INFO & HOBBIES: ${language === "es" ? PERSONAL_EXTRA.es : PERSONAL_EXTRA.en}
- LANGUAGES: ${language === "es" ? "Español (Nativo) e Inglés 🇺🇸 (C1 avanzado)" : "Spanish (Native) and English 🇺🇸 (Advanced C1)"}
- SKILLS: ${language === "es" ? SKILLS_CONTENT.es : SKILLS_CONTENT.en}
- PROJECTS: ${PROJECTS_DATA.map(p => language === "es" ? p.content.es : p.content.en).join('\n\n')}
- CONTACT: Email: ${CONTACT_INFO.email}, GitHub: ${CONTACT_INFO.github}, Status: ${language === "es" ? CONTACT_INFO.status.es : CONTACT_INFO.status.en}

Answer user questions accurately and professionally using the portfolio information above. If you don't know something, or the user asks a question unrelated to Sebastian, politely say you only have access to his professional portfolio details.
`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cmdText,
          systemInstruction
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Missing GEMINI_API_KEY") {
          setLines((prev) => [...prev, {
            kind: "assistant",
            text: "Command not found. Type `help` to see available commands.\n*(AI Copilot is offline: API key not configured)*",
            isAI: true
          }]);
          return;
        }
        throw new Error(data.error || "Failed to communicate with AI");
      }

      let responseText = data.text.trim();
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
      }

      setLines((prev) => [...prev, { kind: "assistant", text: responseText, isAI: true }]);
    } catch (error) {
      console.error('Error connecting to AI:', error);
      setLines((prev) => [...prev, {
        kind: "assistant",
        text: "Error connecting to AI Copilot. Please try again later or type `help`.",
        isAI: true
      }]);
    } finally {
      setIsThinking(false);
    }
  }

  const systemTodos: Todo[] = [
    {
      label: language === 'es' ? 'Inicializar SR Copilot v3.1.4' : 'Initialize SR Copilot v3.1.4',
      status: 'done'
    },
    {
      label: language === 'es' ? 'Cargar datos del portafolio' : 'Load portfolio data',
      status: 'done'
    },
    {
      label: isThinking
        ? (language === 'es' ? 'Procesando consulta...' : 'Processing AI response...')
        : (language === 'es' ? 'Esperando entrada del usuario' : 'Awaiting user input'),
      status: 'active'
    }
  ];

  return (
    <div
      ref={rootRef}
      className="space-y-3 font-mono text-[13px] leading-[1.6] flex flex-col flex-1 min-h-0"
      style={{ color: FG }}
    >
      <PiedPiperHeader className="shrink-0" />

      <ClaudeTodoList todos={systemTodos} className="shrink-0 mt-2" />

      <div className="space-y-3 pt-1 flex-1 overflow-y-auto messages-container pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {lines.map((line, i) =>
          line.kind === "user" ? (
            <ClaudeMessage key={i} role="user">
              {line.text}
            </ClaudeMessage>
          ) : (
            <ClaudeMessage key={i}>
              {line.isAI || true ? (
                <TerminalMarkdown text={line.text} className="text-inherit" />
              ) : (
                line.text
              )}
            </ClaudeMessage>
          ),
        )}

        {phase === "greeting" ? (
          <ClaudeMessage>
            {displayed}
            {!typed ? (
              <span
                aria-hidden
                className="ml-0.5 inline-block w-[0.55ch] animate-pulse"
                style={{
                  background: CLI_BRAND,
                  height: "1.1em",
                  verticalAlign: "text-bottom",
                }}
              />
            ) : null}
          </ClaudeMessage>
        ) : null}

        {isThinking ? (
          <ClaudeThinking
            verbs={["Analyzing query", "Searching portfolio", "Generating response"]}
            showTokens={false}
          />
        ) : null}
      </div>

      <div className="pt-2 shrink-0">
        <ClaudePrompt
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isThinking) submit();
            }
          }}
          placeholder={language === 'es' ? "Escribe un comando o hazme una pregunta..." : "Type a command or ask a question..."}
          mode="auto"
          effort={false}
          className={cn(isThinking && "pointer-events-none opacity-50")}
        />
      </div>
    </div>
  );
}
