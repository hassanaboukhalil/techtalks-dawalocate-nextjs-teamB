"use client";

import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { Menu, X, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav>
      {/* Desktop navbar */}
      <div className="hidden lg:flex gap-8 items-center">
        <ul className="flex gap-6">
          {PUBLIC_NAV_ITEMS.map((navItem) => (
            <Link
              key={navItem.id}
              href={navItem.link}
              className="text-sm font-medium text-gray-700 hover:text-[#2699b2]! transition-colors duration-200"
            >
              {navItem.label}
            </Link>
          ))}
        </ul>
        <div className="w-px h-6 bg-gray-200"></div>
        <Button asChild size="sm" className="text-sm border-primary text-white">
          <Link href="/login">
            <LogIn className="size-4" />
            Login
          </Link>
        </Button>
      </div>

      {/* Mobile navbar */}
      <div className="flex flex-col lg:hidden items-end">
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="cursor-pointer hover:text-primary transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
        {isMenuOpen && (
          <div
            className={`border-b border-gray-200 flex flex-col w-screen absolute top-16 pt-6 left-0 px-4 gap-4 bg-background pb-6 z-50 shadow-md`}
          >
            {PUBLIC_NAV_ITEMS.map((navItem) => (
              <Link
                key={navItem.id}
                href={navItem.link}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {navItem.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <Button
                asChild
                size="sm"
                className="w-full bg-primary hover:bg-[#094A58] text-white"
              >
                <Link href="/login">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
