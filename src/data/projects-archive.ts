import type { FileSystemItem } from "@/components/ui/file-system"

/**
 * Archive projects shown in the FileSystem panel (no live demo required).
 * Organize by category folders. Replace placeholders with real repos when ready.
 */
export const projectsArchiveItems: FileSystemItem[] = [
  { kind: "folder", path: "Software/", name: "Software" },
  { kind: "folder", path: "AI/", name: "AI" },
  { kind: "folder", path: "Algorithms/", name: "Algorithms" },
  {
    kind: "file",
    path: "Software/AppleMusicTUI.md",
    name: "Apple Music TUI",
    contentType: "text/markdown",
    url: "https://github.com/sebasreateguib/AppleMusicTUI",
    updatedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    kind: "file",
    path: "AI/FraudNet.md",
    name: "FraudNet",
    contentType: "text/markdown",
    url: "https://github.com/sebasreateguib/FraudNet",
    updatedAt: "2025-06-01T00:00:00.000Z",
    createdAt: "2025-01-15T00:00:00.000Z",
  },
  {
    kind: "file",
    path: "Algorithms/QuadTreeParticleSimulator.md",
    name: "QuadTree Particle Simulator",
    contentType: "text/markdown",
    url: "https://github.com/sebasreateguib/QuadTreeParticleSimulator",
    updatedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
]
