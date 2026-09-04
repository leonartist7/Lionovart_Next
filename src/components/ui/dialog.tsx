"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      {/* A modal task dims its background and pushes it back, so attention has
          one place to land. */}
      <DialogPrimitive.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]",
          "transition-opacity duration-200 ease-out",
          "data-closed:opacity-0 data-open:opacity-100",
          "motion-reduce:transition-none",
        )}
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "bg-card border-border fixed z-50 flex flex-col gap-4 border p-6 shadow-2xl outline-none",
          // Phone: a bottom sheet, which is where the thumb already is.
          "inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl",
          "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          // Tablet up: a centred panel.
          "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-6",
          // Materialise rather than plain-fade: the surface arrives from the
          // direction it will leave in.
          "transition-[opacity,transform] duration-200 ease-out",
          "data-closed:opacity-0 data-open:opacity-100",
          "data-closed:translate-y-3 data-open:translate-y-0",
          "sm:data-closed:translate-y-[calc(-50%+0.5rem)] sm:data-open:-translate-y-1/2",
          "sm:data-closed:scale-[0.98] sm:data-open:scale-100",
          "motion-reduce:transition-opacity motion-reduce:data-closed:translate-y-0 motion-reduce:data-open:translate-y-0",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted absolute top-4 right-4 grid size-8 place-items-center rounded-full",
              "transition-colors duration-150",
              "focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
            )}
          >
            <X size={16} aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-foreground text-lg leading-tight font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
