'use client';

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { 
  Search, Phone, MapPin, AlertCircle, 
  Loader2, RefreshCw, CheckCircle, Mail, Truck, Filter 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: 'IN_STOCK,LOW', label: 'In Stock & Low Stock' },
  { value: 'IN_STOCK', label: 'In Stock Only' },
  { value: 'LOW', label: 'Low Stock Only' },
  { value: 'IN_STOCK,LOW,OUT', label: 'All (Including Out of Stock)' },
] as const;

const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Beirut', label: 'Beirut' },
  { value: 'Tripoli', label: 'Tripoli' },
  { value: 'Sidon', label: 'Sidon' },
  { value: 'Jounieh', label: 'Jounieh' },
] as const;

const getStatusBadgeConfig = (status: string) => {
  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    IN_STOCK: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-300',
      label: 'In Stock'
    },
    LOW: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      border: 'border-yellow-300',
      label: 'Low Stock'
    },
    OUT: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      border: 'border-red-300',
      label: 'Out of Stock'
    },
  };
  return configs[status] || configs.OUT;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 400) {
      return err.response.data?.message || 'Invalid search parameters';
    } else if (err.response?.status === 404) {
      return 'Medicine not found in our database';
    } else if (err.response?.status === 500) {
      return 'Server error. Please try again later';
    } else if (err.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection';
    } else if (err.message === 'Network Error') {
      return 'Network error. Please check your internet connection';
    } else if (err.response?.data?.error) {
      return err.response.data.error;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An error occurred during search';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PatientSearchPage() {
  // Form state
  const [medicine, setMedicine] = useState('');
  const [city, setCity] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);

  // Results state
  const [results, setResults] = useState<PharmacyResult[]>([]);
  const [matchingMedicines, setMatchingMedicines] = useState<Medicine[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!medicine.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      params.append('medicine', medicine.trim());
      params.append('includeOutOfStock', String(includeOutOfStock));
      
      if (city.trim()) params.append('city', city.trim());
      if (pharmacyName.trim()) params.append('name', pharmacyName.trim());

      const response = await axios.get<SearchResponse>(
        `/api/patient/search-medicines?${params.toString()}`,
        { timeout: 10000 }
      );

      if (response.data.success && response.data.data) {
        setResults(response.data.data.results || []);
        setMatchingMedicines(response.data.data.matchingMedicines || []);
        setTotalResults(response.data.data.total || 0);
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setResults([]);
      setMatchingMedicines([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMedicine('');
    setCity('');
    setPharmacyName('');
    setIncludeOutOfStock(false);
    setResults([]);
    setMatchingMedicines([]);
    setTotalResults(0);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
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
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Search Criteria</h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Medicine Name Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="medicine" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                {/* Debug: Show current value */}
                <div className="text-xs text-blue-600 mb-1">Current value: "{medicine}"</div>
                <textarea
                  id="medicine"
                  placeholder="e.g., Paracetamol, Aspirin, Ibuprofen"
                  value={medicine}
                  onChange={(e) => {
                    console.log('Medicine input changed:', e.target.value);
                    setMedicine(e.target.value);
                  }}
                  disabled={isLoading}
                  rows={1}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'white',
                    color: 'black',
                    fontSize: '14px',
                    resize: 'none'
                  }}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500">
                  Enter the medicine name you're looking for
                </p>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <label 
                    htmlFor="city" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    City <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: 'black',
                      fontSize: '14px'
                    }}
                  >
                    {CITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pharmacy Name */}
                <div className="space-y-2">
                  <label 
                    htmlFor="pharmacy" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pharmacy Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="pharmacy"
                    type="text"
                    placeholder="e.g., City Pharmacy"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: 'black',
                      fontSize: '14px'
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  id="outOfStock"
                  type="checkbox"
                  checked={includeOutOfStock}
                  onChange={(e) => setIncludeOutOfStock(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <label 
                  htmlFor="outOfStock" 
                  className="text-sm text-gray-700"
                >
                  Include out of stock items
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !medicine.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </Card>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <p className="text-blue-800">Searching for medicines...</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results
                </h3>
                <p className="text-sm text-gray-600">
                  Found {totalResults} results across {results.length} pharmacies
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                New Search
              </button>
            </div>

            {/* Pharmacy Results */}
            {results.map((result) => (
              <Card key={result.pharmacy.id} className="overflow-hidden">
                <div className="p-6">
                  {/* Pharmacy Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {result.pharmacy.name}
                      </h4>
                      {result.pharmacy.city && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {result.pharmacy.city}
                        </p>
                      )}
                    </div>
                    {result.pharmacy.hasDelivery && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <Truck className="h-4 w-4" />
                        Delivery Available
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                    {result.pharmacy.phone && (
                      <a
                        href={`tel:${result.pharmacy.phone}`}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {result.pharmacy.phone}
                      </a>
                    )}
                    {result.pharmacy.email && (
                      <a
                        href={`mailto:${result.pharmacy.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {result.pharmacy.email}
                      </a>
                    )}
                  </div>

                  {/* Medicines */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      Available Medicines ({result.medicines.length})
                    </h5>
                    <div className="space-y-2">
                      {result.medicines.map((item) => {
                        const config = getStatusBadgeConfig(item.availability.status);
                        return (
                          <div
                            key={item.inventoryId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.medicine.name}
                              </p>
                              {item.medicine.strength && (
                                <p className="text-sm text-gray-600">
                                  {item.medicine.strength}
                                  {item.medicine.form && ` • ${item.medicine.form}`}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Qty: {item.availability.quantity}
                                {item.availability.expiresAt && (
                                  <>
                                    {' '}• Expires: {formatDate(item.availability.expiresAt)}
                                  </>
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
                            >
                              {config.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results State */}
        {hasSearched && !isLoading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try searching with different keywords or filters
            </p>
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Start a new search
            </button>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && !error && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">
              Enter a medicine name and click search to find nearby pharmacies
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
