"use client"

import { cn } from "@/lib/utils"

/** Base UI has no textarea part, so this is a plain element sharing Input's skin. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground/70 field-sizing-content flex min-h-16 w-full rounded-lg border px-3 py-2 text-sm",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-3",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3",
        "disabled:pointer-events-none disabled:opacity-50",
        "max-[480px]:text-base",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
