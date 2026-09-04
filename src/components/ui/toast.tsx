"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Wrap the portal subtree once; `useToast()` then works anywhere beneath it. */
const ToastProvider = ToastPrimitive.Provider

/** Fires toasts: `const toast = useToast(); toast.add({ title, description })`. */
const useToast = ToastPrimitive.useToastManager

/**
 * Renders the live toast stack. Mount once, inside ToastProvider.
 *
 * Sits above the mobile tab bar and inside the safe area so a confirmation
 * never hides behind the navigation it's confirming.
 */
function Toaster() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        className={cn(
          "fixed z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none",
          "inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))]",
          "md:inset-x-auto md:right-6 md:bottom-6",
        )}
      >
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            toast={toast}
            className={cn(
              "border-border bg-card relative rounded-xl border p-4 pr-10 shadow-lg",
              "transition-[transform,opacity] duration-200 ease-out",
              "data-starting-style:translate-y-2 data-starting-style:opacity-0",
              "data-ending-style:translate-y-1 data-ending-style:opacity-0",
              "motion-reduce:transition-opacity motion-reduce:data-starting-style:translate-y-0",
            )}
          >
            <ToastPrimitive.Title className="text-foreground text-sm font-medium" />
            <ToastPrimitive.Description className="text-muted-foreground mt-0.5 text-sm leading-relaxed" />
            <ToastPrimitive.Close
              aria-label="Dismiss"
              className={cn(
                "text-muted-foreground hover:text-foreground absolute top-3 right-3 grid size-7 place-items-center rounded-full",
                "transition-colors duration-150",
                "focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
              )}
            >
              <X size={14} aria-hidden="true" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { ToastProvider, Toaster, useToast }
