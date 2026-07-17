"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  orientation?: "vertical" | "horizontal" | "both"
  scrollFade?: boolean
  viewportRef?: React.Ref<HTMLDivElement>
  viewportClassName?: string
  viewportProps?: React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.Viewport
  >
}

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  scrollFade = false,
  viewportRef,
  viewportClassName,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both"
  const showHorizontal = orientation === "horizontal" || orientation === "both"

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative flex min-h-0 min-w-0 flex-col", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        data-scroll-fade={scrollFade || undefined}
        className={cn(
          "size-full min-h-0 rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]",
          scrollFade &&
            "mask-[linear-gradient(#000,#000),linear-gradient(#000,#000)] mask-size-[100%_100%,100%_100%] mask-position-[0_0,0_0] mask-no-repeat",
          viewportClassName,
          viewportProps?.className
        )}
        {...viewportProps}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {showVertical ? <ScrollBar orientation="vertical" /> : null}
      {showHorizontal ? <ScrollBar orientation="horizontal" /> : null}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-hover:bg-muted/40",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 w-full flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar, ScrollAreaPrimitive }
