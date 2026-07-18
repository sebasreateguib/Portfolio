"use client";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  X,
} from "lucide-react";

/* ─── Touch detection ─────────────────────────────────────────── */
function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouch(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return isTouch;
}

/* ─── Types ────────────────────────────────────────────────────── */
export type ArchiveFile = {
  kind: "file";
  name: string;
  path: string;
  url?: string;
  contentType?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type ArchiveFolder = {
  kind: "folder";
  name: string;
  path: string;
};

export type ArchiveItem = ArchiveFile | ArchiveFolder;

/* ─── Helpers ──────────────────────────────────────────────────── */
function parentPath(path: string) {
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  const idx = trimmed.lastIndexOf("/");
  return idx === -1 ? "" : trimmed.slice(0, idx + 1);
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normFolder(p: string) {
  return p.endsWith("/") ? p : `${p}/`;
}

/* ─── SVG Glyphs ───────────────────────────────────────────────── */

// macOS-style folder icon (matches the file-system.tsx style)
function FolderGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={className} aria-hidden>
      {/* Back wall */}
      <rect x="0" y="16" width="96" height="60" rx="6" fill="#3a8ef6" opacity="0.18" />
      {/* Folder body */}
      <rect x="0" y="22" width="96" height="54" rx="6" fill="url(#fg)" />
      {/* Tab */}
      <path d="M4 22 Q4 16 10 16 L36 16 Q42 16 44 22 Z" fill="#4a9ef8" opacity="0.7" />
      {/* Shine */}
      <rect x="8" y="28" width="80" height="4" rx="2" fill="white" opacity="0.07" />
      <defs>
        <linearGradient id="fg" x1="48" y1="22" x2="48" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5aabff" />
          <stop offset="1" stopColor="#2e7fe0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Markdown / generic file icon
function FileGlyph({ ext, className }: { ext?: string; className?: string }) {
  const color =
    ext === "md" ? "#6eb9f7"
    : ext === "pdf" ? "#e06c6c"
    : ext === "ts" || ext === "tsx" ? "#4a9ef8"
    : "#8899aa";

  return (
    <svg viewBox="0 0 64 80" fill="none" className={className} aria-hidden>
      <rect x="0" y="0" width="52" height="76" rx="5" fill={color} opacity="0.15" />
      <rect x="0" y="0" width="52" height="76" rx="5" fill="url(#ff)" />
      {/* Dog-ear */}
      <path d="M38 0 L52 14 L38 14 Z" fill="white" opacity="0.08" />
      <path d="M38 0 L52 14 L38 14 L38 0 Z" fill={color} opacity="0.3" />
      {/* Lines */}
      <rect x="8" y="24" width="28" height="3" rx="1.5" fill="white" opacity="0.2" />
      <rect x="8" y="32" width="24" height="3" rx="1.5" fill="white" opacity="0.15" />
      <rect x="8" y="40" width="28" height="3" rx="1.5" fill="white" opacity="0.2" />
      <rect x="8" y="48" width="18" height="3" rx="1.5" fill="white" opacity="0.12" />
      {/* Ext badge */}
      {ext && (
        <>
          <rect x="0" y="55" width="52" height="21" rx="0" fill={color} opacity="0.35" />
          <rect x="0" y="71" width="52" height="5" rx="0" fill={color} opacity="0.5" />
        </>
      )}
      <defs>
        <linearGradient id="ff" x1="26" y1="0" x2="26" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a3a4a" />
          <stop offset="1" stopColor="#1a2535" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Icon View ────────────────────────────────────────────────── */
function IconGrid({
  items,
  onOpenFolder,
  onOpenFile,
  selected,
  onSelect,
  openOnSingleClick,
}: {
  items: ArchiveItem[];
  onOpenFolder: (folder: ArchiveFolder) => void;
  onOpenFile: (file: ArchiveFile) => void;
  selected: string | null;
  onSelect: (path: string | null) => void;
  openOnSingleClick: boolean;
}) {
  return (
    <div
      className="grid gap-x-1 gap-y-3 p-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
    >
      {items.map((item) => {
        const isSelected = item.path === selected;
        const ext = item.kind === "file"
          ? item.name.split(".").pop()?.toLowerCase()
          : undefined;

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => {
              if (openOnSingleClick) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              } else if (isSelected) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              } else {
                onSelect(item.path);
              }
            }}
            onDoubleClick={() => {
              if (!openOnSingleClick) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              }
            }}
            className="group flex h-25.5 flex-col items-center gap-1.5 outline-none"
          >
            <span
              className={`flex h-16 w-20 shrink-0 items-center justify-center rounded-lg p-1 transition-colors ${
                isSelected ? "bg-white/10 ring-1 ring-blue-400/40" : ""
              }`}
            >
              {item.kind === "folder" ? (
                <FolderGlyph className="h-12 w-auto drop-shadow-sm" />
              ) : (
                <FileGlyph ext={ext} className="h-14 w-auto drop-shadow-sm" />
              )}
            </span>
            <span
              className={`max-w-full rounded-sm px-1.5 py-px text-center text-xs leading-tight wrap-break-word ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "text-white/80"
              }`}
            >
              <span className="line-clamp-2">{item.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── List View ────────────────────────────────────────────────── */
function ListTable({
  items,
  onOpenFolder,
  onOpenFile,
  selected,
  onSelect,
  openOnSingleClick,
}: {
  items: ArchiveItem[];
  onOpenFolder: (folder: ArchiveFolder) => void;
  onOpenFile: (file: ArchiveFile) => void;
  selected: string | null;
  onSelect: (path: string | null) => void;
  openOnSingleClick: boolean;
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center border-b border-white/8 bg-[#161616] px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase text-white/30">
        <span className="w-7 shrink-0" />
        <span className="flex-1">Name</span>
        <span className="w-36 shrink-0 hidden sm:block">Date Modified</span>
      </div>

      {items.map((item) => {
        const isSelected = item.path === selected;
        const ext = item.kind === "file"
          ? item.name.split(".").pop()?.toLowerCase()
          : undefined;
        const date = item.kind === "file"
          ? formatDate(item.updatedAt ?? item.createdAt)
          : "—";

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => {
              if (openOnSingleClick) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              } else if (isSelected) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              } else {
                onSelect(item.path);
              }
            }}
            onDoubleClick={() => {
              if (!openOnSingleClick) {
                if (item.kind === "folder") onOpenFolder(item);
                else onOpenFile(item);
              }
            }}
            className={`group flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors outline-none ${
              isSelected
                ? "bg-blue-500/20 text-white"
                : "text-white/75 hover:bg-white/5"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {item.kind === "folder" ? (
                <FolderGlyph className="h-5 w-auto" />
              ) : (
                <FileGlyph ext={ext} className="h-6 w-auto" />
              )}
            </span>
            <span className="flex-1 truncate">{item.name}</span>
            <span className="w-36 shrink-0 hidden text-xs text-white/30 sm:block">
              {date}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Toolbar ──────────────────────────────────────────────────── */
function Toolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  folderName,
}: {
  view: "icons" | "list";
  onViewChange: (v: "icons" | "list") => void;
  search: string;
  onSearchChange: (s: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  folderName: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="relative grid h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-white/8 bg-[#161616] px-2">
      {/* Left: nav + folder name */}
      <div className="flex min-w-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Forward"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="ml-1 truncate text-sm font-semibold text-white/80">
          {folderName}
        </span>
      </div>

      {/* Center: view toggle tabs */}
      <div className="flex h-8 items-center gap-px rounded-lg bg-white/6 p-0.5">
        <button
          type="button"
          onClick={() => onViewChange("icons")}
          aria-label="Icon view"
          className={`flex h-7 items-center justify-center rounded-md px-2.5 transition-colors ${
            view === "icons"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onViewChange("list")}
          aria-label="List view"
          className={`flex h-7 items-center justify-center rounded-md px-2.5 transition-colors ${
            view === "list"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right: search */}
      <div className="flex min-w-0 items-center justify-end">
        {searchOpen ? (
          <div className="flex h-7 min-w-0 flex-1 items-center gap-1 rounded-lg border border-white/15 bg-white/6 px-2 text-sm text-white/80 focus-within:border-blue-400/50 focus-within:ring-1 focus-within:ring-blue-400/30">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/30" />
            <input
              autoFocus
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); onSearchChange(""); }}
              className="shrink-0 text-white/30 hover:text-white/60"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Status Bar ───────────────────────────────────────────────── */
function StatusBar({
  selected,
  items,
  onOpenFile,
}: {
  selected: ArchiveItem | null;
  items: ArchiveItem[];
  onOpenFile: (file: ArchiveFile) => void;
}) {
  const count = items.length;
  const label = selected
    ? selected.name
    : `${count} item${count !== 1 ? "s" : ""}`;

  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/8 bg-[#161616] px-3">
      <span className="truncate font-mono text-[10px] text-white/30">{label}</span>
      {selected?.kind === "file" && selected.url && (
        <button
          type="button"
          onClick={() => onOpenFile(selected as ArchiveFile)}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] text-blue-400 transition-colors hover:bg-blue-400/10"
        >
          Open
          <ExternalLink className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export function ArchiveBrowser({ items }: { items: ArchiveItem[] }) {
  const [view, setView] = useState<"icons" | "list">("icons");
  const [history, setHistory] = useState<{ stack: string[]; index: number }>({
    stack: [""],
    index: 0,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const openOnSingleClick = useIsTouch();

  const currentPath = history.stack[history.index] ?? "";
  const canGoBack = history.index > 0;
  const canGoForward = history.index < history.stack.length - 1;

  /* ── Derive current folder name ── */
  const currentFolderName = currentPath
    ? items.find(
        (i) => i.kind === "folder" && normFolder(i.path) === currentPath
      )?.name ?? currentPath.replace(/\/$/, "").split("/").pop() ?? "Archive"
    : "Archive";

  /* ── Navigate into a folder ── */
  function navigateTo(path: string) {
    const normalized = path === "" ? "" : normFolder(path);
    setHistory((prev) => {
      if (prev.stack[prev.index] === normalized) return prev;
      const stack = [...prev.stack.slice(0, prev.index + 1), normalized];
      return { stack, index: stack.length - 1 };
    });
    setSelected(null);
    setSearch("");
  }

  /* ── Filter items for current folder ── */
  const currentItems: ArchiveItem[] = items.filter((item) => {
    // For the root (""), show top-level items
    const itemPath = item.kind === "folder" ? normFolder(item.path) : item.path;

    if (currentPath === "") {
      // Root: show items with no "/" in their path (or folders at top level)
      const rel = itemPath.replace(/\/$/, "");
      return !rel.includes("/");
    }

    // In a folder: show direct children
    if (!itemPath.startsWith(currentPath)) return false;
    const rel = itemPath.slice(currentPath.length).replace(/\/$/, "");
    return rel.length > 0 && !rel.includes("/");
  });

  /* ── Apply search ── */
  const visibleItems = search.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) &&
          i.kind === "file"
      )
    : currentItems;

  /* ── Handlers ── */
  function handleOpenFolder(folder: ArchiveFolder) {
    navigateTo(normFolder(folder.path));
  }

  function handleOpenFile(file: ArchiveFile) {
    if (file.url) window.open(file.url, "_blank", "noopener,noreferrer");
  }

  const selectedItem =
    selected ? items.find((i) => i.path === selected) ?? null : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] text-white">
      <Toolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={() => {
          setHistory((prev) => ({
            ...prev,
            index: Math.max(0, prev.index - 1),
          }));
          setSelected(null);
        }}
        onForward={() => {
          setHistory((prev) => ({
            ...prev,
            index: Math.min(prev.stack.length - 1, prev.index + 1),
          }));
          setSelected(null);
        }}
        folderName={search ? "Search Results" : currentFolderName}
      />

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y">
        {visibleItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-white/25">
            {search ? "No results" : "This folder is empty"}
          </div>
        ) : view === "icons" ? (
          <IconGrid
            items={visibleItems}
            onOpenFolder={handleOpenFolder}
            onOpenFile={handleOpenFile}
            selected={selected}
            onSelect={setSelected}
            openOnSingleClick={openOnSingleClick}
          />
        ) : (
          <ListTable
            items={visibleItems}
            onOpenFolder={handleOpenFolder}
            onOpenFile={handleOpenFile}
            selected={selected}
            onSelect={setSelected}
            openOnSingleClick={openOnSingleClick}
          />
        )}
      </div>

      <StatusBar
        selected={selectedItem}
        items={visibleItems}
        onOpenFile={handleOpenFile}
      />
    </div>
  );
}
