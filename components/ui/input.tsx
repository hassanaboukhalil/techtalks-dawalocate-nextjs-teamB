import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          // BASE LAYOUT & TYPOGRAPHY
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-all duration-200 md:text-sm",
          
          // PLACEHOLDER & FILE INPUT STYLES
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
          
          // INTERACTION STATES (The Professional Touch)
          // 1. Hover: Subtle border highlight
          // 2. Focus: Clean ring with offset for depth
          "hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-400",

          
          // DISABLED STATE
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          // ERROR STATES (Preserved)
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }