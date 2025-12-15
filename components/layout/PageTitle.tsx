import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function PageTitle({
  children,
  className,
  as: Component = "h1",
}: PageTitleProps) {
  return (
    <Component
      className={cn(
        "text-h2 text-primary",
        className
      )}
    >
      {children}
    </Component>
  );
}

