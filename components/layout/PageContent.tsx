import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
  contentPadding?: string;
}

export function PageContent({
  children,
  className,
  contentPadding = "p-4 lg:p-8",
}: PageContentProps) {
  return (
    <main
      className={cn(
        "flex-1 lg:ml-0 overflow-x-hidden pt-16 lg:pt-0 w-full max-w-full",
        className
      )}
    >
      <div className={cn("w-full max-w-full", contentPadding)}>{children}</div>
    </main>
  );
}
