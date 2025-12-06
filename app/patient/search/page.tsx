'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Search, Phone, MapPin, Clock, Truck, AlertCircle, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchParams {
  medicine: string;
  city: string;
  pharmacyName: string;
  status: string;
  includeOutOfStock: boolean;
}

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface AvailabilityInfo {
  status: 'IN_STOCK' | 'LOW' | 'OUT';
  quantity: number;
  expiresAt: string | null;
  lastUpdated: string;
}

interface PharmacyMedicine {
  inventoryId: number;
  medicine: Medicine;
  availability: AvailabilityInfo;
}

interface Pharmacy {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
}

interface PharmacyResult {
  pharmacy: Pharmacy;
  medicines: PharmacyMedicine[];
}

interface SearchResponse {
  success: boolean;
  data?: {
    searchTerm: string;
    matchingMedicines: Medicine[];
    results: PharmacyResult[];
    resultsByCity: Record<string, PharmacyResult[]>;
    total: number;
    filters: {
      city: string | null;
      pharmacyName: string | null;
      status: string[];
    };
    message: string;
  };
  error?: string;
}

export default function PatientSearchPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    medicine: '',
    city: '',
    pharmacyName: '',
    status: 'IN_STOCK,LOW',
    includeOutOfStock: false,
  });

  const [results, setResults] = useState<PharmacyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchingMedicines, setMatchingMedicines] = useState<Medicine[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const handleInputChange = useCallback(
    (field: keyof SearchParams, value: string | boolean) => {
      setSearchParams((prev) => ({
        ...prev,
        [field]: value,
      }));
      setError(null);
    },
    []
  );

  const handleStatusChange = (newStatus: string) => {
    handleInputChange('status', newStatus);
  };

  const toggleOutOfStock = () => {
    handleInputChange('includeOutOfStock', !searchParams.includeOutOfStock);
  };

  const performSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Validate required input
      if (!searchParams.medicine.trim()) {
        setError('Please enter a medicine name to search');
        setIsLoading(false);
        return;
      }

      // Build query parameters
      const params: Record<string, string | boolean> = {
        medicine: searchParams.medicine,
        status: searchParams.status,
        includeOutOfStock: searchParams.includeOutOfStock,
      };

      if (searchParams.city) params.city = searchParams.city;
      if (searchParams.pharmacyName) params.name = searchParams.pharmacyName;

      // Make API call using Axios with timeout
      const response = await axios.get<SearchResponse>(
        '/api/patient/search-medicines',
        {
          params,
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle successful response
      if (response.data.success && response.data.data) {
        setResults(response.data.data.results || []);
        setMatchingMedicines(response.data.data.matchingMedicines || []);
        setTotalResults(response.data.data.total || 0);
      } else {
        throw new Error(response.data.error || 'Failed to search medicines');
      }
    } catch (err) {
      // Enhanced error handling for different error types
      let errorMessage = 'An error occurred during search';

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid search parameters';
        } else if (err.response?.status === 404) {
          errorMessage = 'Medicine not found in our database';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your connection';
        } else if (err.message === 'Network Error') {
          errorMessage = 'Network error. Please check your internet connection';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setResults([]);
      setMatchingMedicines([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OUT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Find Medicines
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Search for medicines across pharmacies near you
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Search Criteria
            </h2>
            <form onSubmit={performSearch} className="space-y-6">
              {/* Medicine Search */}
              <div className="space-y-2">
                <label htmlFor="medicine" className="block text-sm font-medium text-gray-700">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="medicine"
                  type="text"
                  placeholder="e.g., Paracetamol, Aspirin, Ibuprofen"
                  value={searchParams.medicine}
                  onChange={(e) => handleInputChange('medicine', e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* City Filter */}
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City (Optional)
                  </label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., Beirut, Tripoli"
                    value={searchParams.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Pharmacy Name Filter */}
                <div className="space-y-2">
                  <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700">
                    Pharmacy Name (Optional)
                  </label>
                  <Input
                    id="pharmacyName"
                    type="text"
                    placeholder="e.g., Al-Shifa Pharmacy"
                    value={searchParams.pharmacyName}
                    onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Availability Status
                  </label>
                  <select
                    id="status"
                    value={searchParams.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                  >
                    <option value="IN_STOCK,LOW">In Stock & Low Stock</option>
                    <option value="IN_STOCK">In Stock Only</option>
                    <option value="LOW">Low Stock Only</option>
                    <option value="IN_STOCK,LOW,OUT">All (Including Out of Stock)</option>
                  </select>
                </div>
              </div>

              {/* Out of Stock Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeOutOfStock"
                  checked={searchParams.includeOutOfStock}
                  onChange={toggleOutOfStock}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label
                  htmlFor="includeOutOfStock"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Include out of stock items
                </label>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={isLoading || !searchParams.medicine.trim()}
                className="w-full sm:w-auto gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search Medicines
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4 shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 text-base mb-1">Search Error</h3>
              <p className="text-sm text-red-700 mb-3 leading-relaxed">{error}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => performSearch({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry Search
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-4 shadow-sm">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Searching for medicines...</h3>
              <p className="text-sm text-blue-700 mt-1">Please wait while we find pharmacies with your requested medicine</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && (
          <>
            {/* Success Banner */}
            {totalResults > 0 && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Search Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Found <span className="font-semibold">{totalResults}</span> pharmacy{totalResults !== 1 ? 'ies' : ''} with{' '}
                    <span className="font-semibold">{matchingMedicines.length}</span> matching medicine{matchingMedicines.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {totalResults > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">{totalResults}</span> pharmacy
                  {totalResults !== 1 ? 'ies' : ''} available with{' '}
                  <span className="font-semibold text-gray-900">
                    {matchingMedicines.length}
                  </span>{' '}
                  matching medicine{matchingMedicines.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Matching Medicines Info */}
            {matchingMedicines.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Matching Medicines:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchingMedicines.map((medicine) => (
                    <span
                      key={medicine.id}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {medicine.name}
                      {medicine.strength && ` ${medicine.strength}`}
                      {medicine.form && ` (${medicine.form})`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {totalResults > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.pharmacy.id} className="overflow-hidden">
                    <div className="px-6 py-4">
                      {/* Pharmacy Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {result.pharmacy.name}
                        </h3>

                        {/* Pharmacy Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          {result.pharmacy.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span>{result.pharmacy.address}</span>
                            </div>
                          )}

                          {result.pharmacy.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-blue-600 font-medium">
                                {result.pharmacy.city}
                              </span>
                            </div>
                          )}

                          {result.pharmacy.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <a
                                href={`tel:${result.pharmacy.phone}`}
                                className="text-blue-600 hover:underline"
                              >
                                {result.pharmacy.phone}
                              </a>
                            </div>
                          )}

                          {result.pharmacy.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <a
                                href={`mailto:${result.pharmacy.email}`}
                                className="text-blue-600 hover:underline break-all"
                              >
                                {result.pharmacy.email}
                              </a>
                            </div>
                          )}

                          {result.pharmacy.openingHours && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span>{result.pharmacy.openingHours}</span>
                            </div>
                          )}

                          {result.pharmacy.hasDelivery && (
                            <div className="flex items-center gap-2 text-green-600">
                              <Truck className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium">Delivery Available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Medicines Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Available Medicines:
                        </h4>

                        <div className="space-y-3">
                          {result.medicines.map((med) => (
                            <div
                              key={med.inventoryId}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              {/* Medicine Name and Details */}
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {med.medicine.name}
                                  </p>
                                  <div className="text-sm text-gray-600 space-y-0.5">
                                    {med.medicine.genericName && (
                                      <p>Generic: {med.medicine.genericName}</p>
                                    )}
                                    {(med.medicine.strength || med.medicine.form) && (
                                      <p>
                                        {med.medicine.strength && `${med.medicine.strength} `}
                                        {med.medicine.form && `${med.medicine.form}`}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusBadgeStyle(
                                    med.availability.status
                                  )}`}
                                >
                                  {med.availability.status === 'IN_STOCK'
                                    ? 'In Stock'
                                    : med.availability.status === 'LOW'
                                      ? 'Low Stock'
                                      : 'Out of Stock'}
                                </span>
                              </div>

                              {/* Availability Details */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                                <div>
                                  <p className="text-gray-500">Quantity</p>
                                  <p className="font-medium text-gray-900">
                                    {med.availability.quantity} units
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Expires</p>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(med.availability.expiresAt)}
                                  </p>
                                </div>
                                <div className="col-span-2 sm:col-span-2">
                                  <p className="text-gray-500">Last Updated</p>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(med.availability.lastUpdated)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Button */}
                      <div className="mt-4 flex gap-2">
                        {result.pharmacy.phone && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${result.pharmacy.phone}`}>
                              <Phone className="h-4 w-4" />
                              Call Pharmacy
                            </a>
                          </Button>
                        )}
                        {result.pharmacy.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${result.pharmacy.email}`}>
                              <Mail className="h-4 w-4" />
                              Email
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any pharmacies with the medicine you're looking for.
                  Try adjusting your search filters or search for an alternative medicine.
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Search
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a medicine name and optional filters to find nearby pharmacies with
              the medicine in stock.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icon import (for email)
const Mail = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
