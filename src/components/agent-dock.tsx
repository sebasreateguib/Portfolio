"use client";

import { MessageSquare } from "lucide-react";
import Image from "next/image";

type AgentDockProps = {
  agentName: string;
  /** Optional avatar; falls back to the bot glyph. */
  avatarSrc?: string;
  className?: string;
  status?: string;
  /** Label of the trailing affordance. */
  actionLabel?: string;
  /** Shortcut shown in the trailing key cap. */
  shortcut?: string;
  onOpenChat?: () => void;
};

export function AgentDock({
  agentName,
  avatarSrc,
  className,
  status = "Ready",
  actionLabel = "Chat",
  shortcut = "⌘K",
  onOpenChat,
}: AgentDockProps) {
  // Los logos vectoriales se ven mejor contenidos y con aire; las fotos, al corte.
  const isMark = Boolean(avatarSrc?.toLowerCase().endsWith(".svg"));

  return (
    // El dock entero es un solo control: pulsarlo en cualquier punto abre la
    // terminal, igual que el atajo que anuncia el key cap.
    <button
      type="button"
      onClick={onOpenChat}
      aria-label={`${agentName}. ${status}. ${actionLabel}`}
      aria-keyshortcuts="Meta+K Control+K"
      className={`group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-neutral-950 p-2 text-left text-white shadow-2xl transition-colors hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 cursor-pointer ${className ?? ""}`}
    >
      {avatarSrc ? (
        // Un logo se muestra contenido dentro de su caja; una foto la llena.
        <span
          aria-hidden="true"
          className={
            isMark
              ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10"
              : "flex size-9 shrink-0 overflow-hidden rounded-xl"
          }
        >
          <Image
            alt=""
            className={isMark ? "size-5 object-contain" : "size-9 object-cover"}
            height={36}
            src={avatarSrc}
            unoptimized
            width={36}
          />
        </span>
      ) : (
        // Prompt de terminal: es lo que hay al otro lado del clic.
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/35 bg-[#050505] font-mono text-[15px] leading-none text-blue-400 transition-colors group-hover:border-blue-400/70"
        >
          $
          <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-px bg-blue-400 animate-pulse" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-none">
          {agentName}
        </span>
        <span className="mt-1.5 block truncate text-xs text-neutral-400">
          {status}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium transition-colors group-hover:bg-white/10"
      >
        <MessageSquare className="size-4" />
        <span>{actionLabel}</span>
        <kbd className="hidden h-6 min-w-6 items-center justify-center rounded-md bg-white/10 px-1.5 font-mono text-xs text-white/70 sm:flex">
          {shortcut}
        </kbd>
      </span>
    </button>
  );
}

export default AgentDock;
