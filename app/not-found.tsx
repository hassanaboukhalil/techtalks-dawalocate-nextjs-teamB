import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header
        className={`my-container w-screen flex justify-between items-center py-4 fixed left-0 top-0 z-50 bg-background/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100`}
      >
        <Logo withTitle />
        <Button asChild size="sm" className="text-sm border-primary text-white">
          <Link href="/">
            <Home className="size-4" />
            Go to Homepage
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 mt-16">
        <div className="max-w-2xl w-full text-center">
          {/* Title */}
          <h2 className="text-h2 sm:text-5xl font-bold text-primary mb-12">
            404 - Page Not Found
          </h2>

          {/* 404 Illustration */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/images/404-img.svg"
              alt="404 - Page Not Found"
              width={350}
              height={329}
              priority
              className="w-full max-w-sm"
            />
          </div>

          {/* Action Button */}
          <Link className="lg:hidden" href="/">
            <Button size="lg">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
