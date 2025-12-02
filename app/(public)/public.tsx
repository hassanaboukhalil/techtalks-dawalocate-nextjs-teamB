import Link from "next/link";
import { Search, Heart, Building2, Users, QrCode, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
        Find Medicines,
        <span className="block text-primary">Save Lives.</span>
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
        Quickly locate nearby pharmacies with your needed medicines in stock.
        Connect patients, donors, pharmacies, and charities around hard-to-find
        medications.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/patient/search"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Search className="h-5 w-5" />
          Search Medicines
        </Link>
        <Link
          href="/campaigns"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
        >
          View Campaigns
        </Link>
      </div>
    </div>
  );
}
