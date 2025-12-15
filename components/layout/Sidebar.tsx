"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import { NavItem } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/ui/LogoutButton";

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar = ({ navItems }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  }, [pathname]);

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
      {/* Mobile toggle button - only show when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Toggle sidebar"
          aria-expanded={isOpen}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-background border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo section */}
        <div className="p-6 border-b border-gray-200">
          <Logo withTitle width={32} height={32} />
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
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
