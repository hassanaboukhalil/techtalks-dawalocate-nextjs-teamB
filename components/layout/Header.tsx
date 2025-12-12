"use client";

import Logo from "./Logo";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
