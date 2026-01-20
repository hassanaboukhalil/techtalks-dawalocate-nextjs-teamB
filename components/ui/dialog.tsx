"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/* =========================
   Root Wrappers (unchanged)
========================= */

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}

/* =========================
   Overlay – glass focus
========================= */

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50",
        "bg-gradient-to-br from-black/40 via-black/50 to-black/40",
        "backdrop-blur-md",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   Content – premium card
========================= */

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50",
          "w-full max-w-xl -translate-x-1/2 -translate-y-1/2",
          "overflow-hidden rounded-2xl",
          "bg-white dark:bg-slate-900",
          "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.35)]",
          "border border-slate-200/60 dark:border-slate-800",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0",
          className
        )}
        {...props}
      >
        {/* Accent Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500" />

        {children}

        {/* Close Button */}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4",
            "rounded-full p-2",
            "text-slate-500 hover:text-slate-800",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/* =========================
   Header / Footer
========================= */

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-6 pt-6 pb-3",
        "border-b border-slate-100 dark:border-slate-800",
        "space-y-1",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-6 py-4",
        "border-t border-slate-100 dark:border-slate-800",
        "bg-slate-50/60 dark:bg-slate-900/60",
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   Typography
========================= */

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-bold tracking-tight",
        "text-slate-900 dark:text-slate-50",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-sm text-slate-500 dark:text-slate-400 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   Exports
========================= */

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
