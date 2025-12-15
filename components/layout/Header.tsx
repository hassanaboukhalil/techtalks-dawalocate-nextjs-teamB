"use client";

import Logo from "./Logo";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { useSidebarOptional } from "./SidebarContext";

const Header = () => {
  const { data: session } = useSession();
  const sidebarContext = useSidebarOptional();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dashboard header (when user is logged in and sidebar context is available)
  if (session && sidebarContext) {
    return (
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={sidebarContext.toggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarContext.isOpen}
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <Logo withTitle width={32} height={32} />
        </div>
      </header>
    );
  }

  // Landing page header (when user is not logged in)
  return (
    <header
      className={`my-container sections-max-width w-full flex justify-between items-center py-4 fixed top-0 z-50 bg-background/95 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? "shadow-lg border-b border-gray-100"
          : "border-b border-gray-100"
      }`}
    >
      <Logo withTitle />
      <Navbar />
    </header>
  );
};
export default Header;
