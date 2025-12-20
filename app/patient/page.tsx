import Link from 'next/link';
import { Pill, Heart, Settings } from 'lucide-react';

export default function PatientPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Patient Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage your health and find medicines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Medicines Card */}
        <Link
          href="/patient/search"
          className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <Pill className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Search Medicines
          </h2>
          <p className="text-gray-700">
            Find pharmacies with your needed medicines in stock
          </p>
        </Link>

        {/* Health Profile Card */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 opacity-50 cursor-not-allowed">
          <Heart className="h-12 w-12 text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Health Profile
          </h2>
          <p className="text-gray-700">
            Manage your health information and QR card
          </p>
          <span className="inline-block mt-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>

        {/* Settings Card */}
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 opacity-50 cursor-not-allowed">
          <Settings className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Settings
          </h2>
          <p className="text-gray-700">
            Manage your account preferences
          </p>
          <span className="inline-block mt-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
