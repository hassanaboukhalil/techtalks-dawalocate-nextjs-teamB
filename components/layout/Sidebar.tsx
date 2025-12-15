"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { NavItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { useSidebar } from "./SidebarContext";

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar = ({ navItems }: SidebarProps) => {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  // Close sidebar when route changes on mobile (only if pathname actually changed)
  useEffect(() => {
    // Skip on initial mount
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    // Only close if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Only close if we're on mobile (check sidebar state inside to avoid dependency)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          close();
        }, 100);
      }
    }
  }, [pathname, close]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky left-0 w-64 bg-background border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
          "flex flex-col",
          // Start from top on both mobile and desktop
          "top-0",
          // Full height on both
          "h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo section - hidden on mobile, shown on desktop */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <Logo withTitle width={32} height={32} />
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-4 pt-16 lg:pt-4">
          <ul className="space-y-2 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Check if this is a base dashboard route (exact match only)
              // Base routes: /patient, /pharmacy, /charity, /admin
              const isBaseRoute = [
                "/patient",
                "/pharmacy",
                "/charity",
                "/admin",
              ].includes(item.link);

              // For base routes (Dashboard), only match exactly
              // For other routes, match the route and its children
              const isActive = isBaseRoute
                ? pathname === item.link
                : pathname === item.link ||
                  pathname.startsWith(item.link + "/");

              return (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                    )}
                  >
                    {Icon && <Icon className="size-5" />}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button section */}
        <div className="p-4 border-t border-gray-200">
          <LogoutButton
            variant="ghost"
            size="default"
            className="w-full justify-start text-white hover:bg-gray-100 hover:text-red-600"
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
