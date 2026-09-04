"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground/70 flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-sm",
        "transition-[color,box-shadow,border-color] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-3",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3",
        "disabled:pointer-events-none disabled:opacity-50",
        // 16px on coarse pointers — anything smaller makes iOS Safari zoom the
        // viewport on focus, which throws the whole layout out.
        "max-[480px]:text-base",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
