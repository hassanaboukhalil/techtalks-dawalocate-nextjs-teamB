/**
 * PageTitle Component
 *
 * A reusable page title component that provides consistent styling for page headings
 * across the application using the DawaLocate design system.
 *
 * @example
 * // Basic usage (renders as h1 with primary color)
 * <PageTitle>Patient Dashboard</PageTitle>
 *
 * @example
 * // With custom semantic element
 * <PageTitle as="h2">Inventory Management</PageTitle>
 *
 * @example
 * // With additional styling
 * <PageTitle className="mb-8">Campaign Details</PageTitle>
 *
 * WHEN TO USE:
 * - Use for main page headings on dashboard pages (Patient, Pharmacy, Admin, Charity)
 * - Use at the top of content sections to establish page hierarchy
 * - Use when you need a consistent, prominent heading with primary brand color
 * - Default renders as <h1> for main page titles
 * - Use `as="h2"` for sub-page or section headings
 * - Use `as="h3"` for tertiary headings if needed
 *
 * WHEN NOT TO USE:
 * - Don't use for landing page hero titles (use .text-h1 directly)
 * - Don't use for card titles (use .text-h4 or <h3> with custom styling)
 * - Don't use for body text or descriptions
 * - Don't use inside small UI components like modals or cards (too large)
 *
 * DESIGN SYSTEM:
 * - Uses .text-h2 typography class (4xl → 5xl responsive)
 * - Uses .text-primary color (#0AA6C8)
 * - Can be overridden with className prop if needed
 */

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
    <Component className={cn("text-h2 text-primary", className)}>
      {children}
    </Component>
  );
}
