import Link from 'next/link';
import { Package } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">DawaLocate</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/patient/search"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Search
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* CTA Button */}
          <Link
            href="/patient/search"
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Search Medicines
          </Link>
        </div>
      </div>
    </header>
  );
}
