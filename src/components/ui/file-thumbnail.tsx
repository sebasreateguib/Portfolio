"use client"

import * as React from "react"
import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export type FileThumbnailProps = {
  file: {
    name: string
    type?: string
  }
  className?: string
  previewAspectRatio?: number | string
  previewClassName?: string
  previewImageUrl?: string
  isLoading?: boolean
  previewContent?: React.ReactNode
}

export function FileThumbnail({
  file,
  className,
  previewAspectRatio = 4 / 3,
  previewClassName,
  previewImageUrl,
  isLoading = false,
  previewContent,
}: FileThumbnailProps) {
  const aspectRatio =
    typeof previewAspectRatio === "number"
      ? String(previewAspectRatio)
      : previewAspectRatio

  return (
    <div
      data-slot="file-thumbnail"
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg border border-border/60 bg-muted/20",
        className
      )}
    >
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden",
          previewClassName
        )}
        style={{ aspectRatio }}
      >
        {isLoading ? (
          <Spinner className="size-5 text-muted-foreground" />
        ) : previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewImageUrl}
            alt={file.name}
            className="size-full object-cover"
          />
        ) : previewContent ? (
          previewContent
        ) : (
          <HugeiconsIcon
            icon={File01Icon}
            className="size-8 text-muted-foreground"
          />
        )}
      </div>
    </div>
  )
}
