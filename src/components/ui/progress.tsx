"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

/**
 * Determinate progress bar. `value` is 0–100.
 *
 * Base UI puts the accessible semantics on the root, so a screen reader gets
 * the real percentage rather than a decorative div.
 */
function Progress({
  value,
  className,
  trackClassName,
  ...props
}: ProgressPrimitive.Root.Props & { trackClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("w-full", className)}
      {...props}
    >
      <ProgressPrimitive.Track
        className={cn("bg-muted h-1.5 w-full overflow-hidden rounded-full", trackClassName)}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "bg-primary h-full rounded-full",
            // Width, not transform: the bar grows from its start edge.
            "transition-[width] duration-500 ease-out motion-reduce:transition-none",
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
