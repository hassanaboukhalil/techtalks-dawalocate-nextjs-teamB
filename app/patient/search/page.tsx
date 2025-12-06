'use client';

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { 
  Search, Phone, MapPin, Clock, Truck, AlertCircle, 
  Loader2, RefreshCw, CheckCircle, Mail, TrendingUp, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: 'IN_STOCK,LOW', label: 'In Stock & Low Stock' },
  { value: 'IN_STOCK', label: 'In Stock Only' },
  { value: 'LOW', label: 'Low Stock Only' },
  { value: 'IN_STOCK,LOW,OUT', label: 'All (Including Out of Stock)' },
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

  return errorMessage;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PatientSearchPage() {
  // State Management
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

  // Memoized derived values for performance
  const hasSearchFilters = useMemo(
    () => searchParams.medicine.trim().length > 0,
    [searchParams.medicine]
  );

  const isSearchDisabled = useMemo(
    () => isLoading || !hasSearchFilters,
    [isLoading, hasSearchFilters]
  );

  // Event handlers with useCallback for optimization
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

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      handleInputChange('status', newStatus);
    },
    [handleInputChange]
  );

  const toggleOutOfStock = useCallback(() => {
    handleInputChange('includeOutOfStock', !searchParams.includeOutOfStock);
  }, [handleInputChange, searchParams.includeOutOfStock]);

  const resetSearch = useCallback(() => {
    setSearchParams({
      medicine: '',
      city: '',
      pharmacyName: '',
      status: 'IN_STOCK,LOW',
      includeOutOfStock: false,
    });
    setResults([]);
    setError(null);
    setHasSearched(false);
    setMatchingMedicines([]);
    setTotalResults(0);
  }, []);

  const performSearch = useCallback(async (e: React.FormEvent) => {
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
        medicine: searchParams.medicine.trim(),
        status: searchParams.status,
        includeOutOfStock: searchParams.includeOutOfStock,
      };

      if (searchParams.city.trim()) params.city = searchParams.city.trim();
      if (searchParams.pharmacyName.trim()) params.name = searchParams.pharmacyName.trim();

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
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setResults([]);
      setMatchingMedicines([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Retry search handler
  const handleRetrySearch = useCallback(() => {
    void performSearch({ preventDefault: () => {} } as React.FormEvent);
  }, [performSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Section */}
      <PageHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form Card */}
        <SearchFormCard
          searchParams={searchParams}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onStatusChange={handleStatusChange}
          onToggleOutOfStock={toggleOutOfStock}
          onSearch={performSearch}
        />

        {/* Error Banner */}
        {error && (
          <ErrorBanner 
            error={error} 
            isLoading={isLoading}
            onRetry={handleRetrySearch}
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingBanner />}

        {/* Results Section */}
        {hasSearched && !isLoading && (
          <ResultsSection
            totalResults={totalResults}
            matchingMedicines={matchingMedicines}
            results={results}
            onReset={resetSearch}
          />
        )}

        {/* Empty State */}
        {!hasSearched && <EmptyState />}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Page header component */
const PageHeader = () => (
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
);

/** Search form card component */
interface SearchFormCardProps {
  searchParams: SearchParams;
  isLoading: boolean;
  onInputChange: (field: keyof SearchParams, value: string | boolean) => void;
  onStatusChange: (status: string) => void;
  onToggleOutOfStock: () => void;
  onSearch: (e: React.FormEvent) => Promise<void>;
}

const SearchFormCard = ({
  searchParams,
  isLoading,
  onInputChange,
  onStatusChange,
  onToggleOutOfStock,
  onSearch,
}: SearchFormCardProps) => (
  <Card className="mb-8">
    <div className="px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Search Criteria</h2>
      </div>
      
      <form onSubmit={onSearch} className="space-y-6">
        {/* Medicine Search Input */}
        <div className="space-y-2">
          <label 
            htmlFor="medicine" 
            className="block text-sm font-medium text-gray-700"
          >
            Medicine Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="medicine"
            type="text"
            placeholder="e.g., Paracetamol, Aspirin, Ibuprofen"
            value={searchParams.medicine}
            onChange={(e) => onInputChange('medicine', e.target.value)}
            disabled={isLoading}
            className="w-full"
            autoComplete="off"
            required
          />
          <p className="text-xs text-gray-500">
            Enter the medicine name you're looking for
          </p>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* City Filter */}
          <div className="space-y-2">
            <label 
              htmlFor="city" 
              className="block text-sm font-medium text-gray-700"
            >
              City <span className="text-gray-400">(Optional)</span>
            </label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Beirut, Tripoli"
              value={searchParams.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {/* Pharmacy Name Filter */}
          <div className="space-y-2">
            <label 
              htmlFor="pharmacyName" 
              className="block text-sm font-medium text-gray-700"
            >
              Pharmacy Name <span className="text-gray-400">(Optional)</span>
            </label>
            <Input
              id="pharmacyName"
              type="text"
              placeholder="e.g., Al-Shifa Pharmacy"
              value={searchParams.pharmacyName}
              onChange={(e) => onInputChange('pharmacyName', e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label 
              htmlFor="status" 
              className="block text-sm font-medium text-gray-700"
            >
              Availability Status
            </label>
            <select
              id="status"
              value={searchParams.status}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={isLoading}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Out of Stock Toggle */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="includeOutOfStock"
            checked={searchParams.includeOutOfStock}
            onChange={onToggleOutOfStock}
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
          />
          <label
            htmlFor="includeOutOfStock"
            className="text-sm text-gray-700 cursor-pointer flex-1"
          >
            Include out of stock items in results
          </label>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          disabled={isLoading || !searchParams.medicine.trim()}
          className="w-full sm:w-auto gap-2 font-medium"
          size="lg"
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
);

/** Error banner component */
interface ErrorBannerProps {
  error: string;
  isLoading: boolean;
  onRetry: () => void;
}

const ErrorBanner = ({ error, isLoading, onRetry }: ErrorBannerProps) => (
  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h3 className="font-semibold text-red-900 text-base mb-1">Search Error</h3>
      <p className="text-sm text-red-700 mb-3 leading-relaxed">{error}</p>
      <Button
        onClick={onRetry}
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
);

/** Loading banner component */
const LoadingBanner = () => (
  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
    <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0" />
    <div>
      <h3 className="font-semibold text-blue-900">Searching for medicines...</h3>
      <p className="text-sm text-blue-700 mt-1">
        Please wait while we find pharmacies with your requested medicine
      </p>
    </div>
  </div>
);

/** Results section component */
interface ResultsSectionProps {
  totalResults: number;
  matchingMedicines: Medicine[];
  results: PharmacyResult[];
  onReset: () => void;
}

const ResultsSection = ({
  totalResults,
  matchingMedicines,
  results,
  onReset,
}: ResultsSectionProps) => (
  <>
    {/* Success Banner */}
    {totalResults > 0 && (
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900">Search Successful!</h3>
          <p className="text-sm text-green-700 mt-1">
            Found <span className="font-semibold">{totalResults}</span> pharmacy
            {totalResults !== 1 ? 'ies' : ''} with{' '}
            <span className="font-semibold">{matchingMedicines.length}</span> matching medicine
            {matchingMedicines.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    )}

    {/* Results Summary */}
    {totalResults > 0 && (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">{totalResults}</span> pharmacy
            {totalResults !== 1 ? 'ies' : ''} available with{' '}
            <span className="font-semibold text-gray-900">
              {matchingMedicines.length}
            </span>{' '}
            matching medicine{matchingMedicines.length !== 1 ? 's' : ''}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-blue-600 hover:text-blue-700"
          >
            New Search
          </Button>
        </div>
      </div>
    )}

    {/* Matching Medicines Info */}
    {matchingMedicines.length > 0 && (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Matching Medicines:
        </h3>
        <div className="flex flex-wrap gap-2">
          {matchingMedicines.map((medicine) => (
            <span
              key={medicine.id}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
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
          <PharmacyCard key={result.pharmacy.id} result={result} />
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          We couldn't find any pharmacies with the medicine you're looking for.
          Try adjusting your search filters or search for an alternative medicine.
        </p>
        <Button variant="outline" onClick={onReset}>
          Start New Search
        </Button>
      </div>
    )}
  </>
);

/** Pharmacy card component */
interface PharmacyCardProps {
  result: PharmacyResult;
}

const PharmacyCard = ({ result }: PharmacyCardProps) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow">
    <div className="px-6 py-4">
      {/* Pharmacy Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {result.pharmacy.name}
        </h3>

        {/* Pharmacy Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          {result.pharmacy.address && (
            <PharmacyDetailItem icon={MapPin}>
              {result.pharmacy.address}
            </PharmacyDetailItem>
          )}

          {result.pharmacy.city && (
            <PharmacyDetailItem icon={MapPin} highlight>
              {result.pharmacy.city}
            </PharmacyDetailItem>
          )}

          {result.pharmacy.phone && (
            <a
              href={`tel:${result.pharmacy.phone}`}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {result.pharmacy.phone}
            </a>
          )}

          {result.pharmacy.email && (
            <a
              href={`mailto:${result.pharmacy.email}`}
              className="flex items-center gap-2 text-blue-600 hover:underline truncate"
            >
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{result.pharmacy.email}</span>
            </a>
          )}

          {result.pharmacy.openingHours && (
            <PharmacyDetailItem icon={Clock}>
              {result.pharmacy.openingHours}
            </PharmacyDetailItem>
          )}

          {result.pharmacy.hasDelivery && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Truck className="h-4 w-4 flex-shrink-0" />
              <span>Delivery Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Medicines Section */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">
          Available Medicines ({result.medicines.length})
        </h4>

        <div className="space-y-3">
          {result.medicines.map((med) => (
            <MedicineAvailabilityItem key={med.inventoryId} medicine={med} />
          ))}
        </div>
      </div>

      {/* Contact Actions */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {result.pharmacy.phone && (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${result.pharmacy.phone}`}>
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call Pharmacy</span>
              <span className="sm:hidden">Call</span>
            </a>
          </Button>
        )}
        {result.pharmacy.email && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${result.pharmacy.email}`}>
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  </Card>
);

/** Pharmacy detail item component */
interface PharmacyDetailItemProps {
  icon: React.ComponentType<{ className: string }>;
  children: ReactNode;
  highlight?: boolean;
}

const PharmacyDetailItem = ({ 
  icon: Icon, 
  children, 
  highlight = false 
}: PharmacyDetailItemProps) => (
  <div className={`flex items-start gap-2 ${highlight ? 'text-blue-600 font-medium' : ''}`}>
    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

/** Medicine availability item component */
interface MedicineAvailabilityItemProps {
  medicine: PharmacyMedicine;
}

const MedicineAvailabilityItem = ({ medicine }: MedicineAvailabilityItemProps) => {
  const badgeConfig = getStatusBadgeConfig(medicine.availability.status);
  
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Medicine Header */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{medicine.medicine.name}</p>
          <div className="text-sm text-gray-600 space-y-0.5 mt-1">
            {medicine.medicine.genericName && (
              <p className="text-gray-500">
                Generic: <span className="text-gray-700">{medicine.medicine.genericName}</span>
              </p>
            )}
            {(medicine.medicine.strength || medicine.medicine.form) && (
              <p>
                {medicine.medicine.strength && `${medicine.medicine.strength} `}
                {medicine.medicine.form && `${medicine.medicine.form}`}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
        >
          {badgeConfig.label}
        </span>
      </div>

      {/* Availability Details Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
        <div>
          <p className="text-gray-500 font-medium">Quantity</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {medicine.availability.quantity} {medicine.availability.quantity === 1 ? 'unit' : 'units'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">Expires</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {formatDate(medicine.availability.expiresAt)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">Updated</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {formatDate(medicine.availability.lastUpdated)}
          </p>
        </div>
      </div>
    </div>
  );
};

/** Empty state component */
const EmptyState = () => (
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
);
