"use client";

import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav>
      {/* Desktop navbar */}
      <ul className="hidden lg:flex gap-6">
        {PUBLIC_NAV_ITEMS.map((navItem) => (
          <Link
            key={navItem.id}
            href={navItem.link}
            className="text-body-4 text-black hover:text-[#0AA6C8]"
          >
            {navItem.label}
          </Link>
        ))}
      </ul>

      {/* Mobile navbar */}
      <ul className="flex flex-col lg:hidden items-end">
        <div onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </div>
        {isMenuOpen && (
          <div
            className={`border-b-2 border-[#999999] flex flex-col w-[100%] absolute top-16 pt-8 left-0 my-container gap-6 border-solid bg-background pb-4 z-50`}
          >
            {PUBLIC_NAV_ITEMS.map((navItem) => (
              <Link
                key={navItem.id}
                href={navItem.link}
                className="text-body-4 text-black hover:text-[#0AA6C8]"
                onClick={() => setIsMenuOpen(false)}
              >
                {navItem.label}
              </Link>
            ))}
          </div>
        )}
      </ul>
    </nav>
  );
};
export default Navbar;
