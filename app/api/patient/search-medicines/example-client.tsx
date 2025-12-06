'use client';

/**
 * Example Client Component for Medicine Search API
 * 
 * This is a reference implementation showing how to use the
 * /api/patient/search-medicines endpoint in a React component.
 * 
 * Copy and adapt this code for your actual search page.
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import type { SearchMedicinesResponse, PharmacySearchResult } from './types';

export function MedicineSearchExample() {
  // State management
  const [medicine, setMedicine] = useState('');
  const [city, setCity] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);
  
  const [results, setResults] = useState<PharmacySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  /**
   * Handle search form submission
   */
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicine.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage('');
    setResults([]);

    try {
      const response = await axios.get<SearchMedicinesResponse>(
        '/api/patient/search-medicines',
        {
          params: {
            medicine: medicine.trim(),
            city: city.trim() || undefined,
            name: pharmacyName.trim() || undefined,
            includeOutOfStock: includeOutOfStock || undefined,
          }
        }
      );

      if (response.data.success) {
        setResults(response.data.data.results);
        setMessage(response.data.data.message);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(err.response.data.error || 'Failed to search for medicines');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [medicine, city, pharmacyName, includeOutOfStock]);

  /**
   * Reset search form
   */
  const handleReset = useCallback(() => {
    setMedicine('');
    setCity('');
    setPharmacyName('');
    setIncludeOutOfStock(false);
    setResults([]);
    setError(null);
    setMessage('');
  }, []);

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800';
      case 'LOW':
        return 'bg-orange-100 text-orange-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format status text
   */
  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Medicine Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Medicine Name (Required) */}
          <div>
            <label htmlFor="medicine" className="block text-sm font-medium mb-2">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              id="medicine"
              type="text"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              placeholder="e.g., Paracetamol, Aspirin"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* City (Optional) */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2">
              City (Optional)
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Beirut, Tripoli"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Pharmacy Name (Optional) */}
          <div>
            <label htmlFor="pharmacyName" className="block text-sm font-medium mb-2">
              Pharmacy Name (Optional)
            </label>
            <input
              id="pharmacyName"
              type="text"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              placeholder="e.g., Central Pharmacy"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Include Out of Stock */}
          <div className="flex items-center pt-6">
            <input
              id="includeOutOfStock"
              type="checkbox"
              checked={includeOutOfStock}
              onChange={(e) => setIncludeOutOfStock(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeOutOfStock" className="ml-2 text-sm font-medium">
              Include out of stock pharmacies
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !medicine.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Message */}
      {message && !error && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
          {message}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            Found {results.length} {results.length === 1 ? 'Pharmacy' : 'Pharmacies'}
          </h2>

          {results.map((result) => (
            <div
              key={result.pharmacy.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Pharmacy Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {result.pharmacy.name}
                  </h3>
                  <p className="text-gray-600">
                    {result.pharmacy.address}
                    {result.pharmacy.city && `, ${result.pharmacy.city}`}
                  </p>
                </div>
                {result.pharmacy.hasDelivery && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    🚚 Delivery Available
                  </span>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                {result.pharmacy.phone && (
                  <div>
                    <strong>Phone:</strong> {result.pharmacy.phone}
                  </div>
                )}
                {result.pharmacy.email && (
                  <div>
                    <strong>Email:</strong> {result.pharmacy.email}
                  </div>
                )}
                {result.pharmacy.openingHours && (
                  <div className="md:col-span-2">
                    <strong>Hours:</strong> {result.pharmacy.openingHours}
                  </div>
                )}
              </div>

              {/* Available Medicines */}
              <div>
                <h4 className="font-semibold mb-2">Available Medicines:</h4>
                <div className="space-y-2">
                  {result.medicines.map((med) => (
                    <div
                      key={med.inventoryId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{med.medicine.name}</p>
                        {med.medicine.genericName && (
                          <p className="text-sm text-gray-600">
                            Generic: {med.medicine.genericName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {med.medicine.strength && `${med.medicine.strength} • `}
                          {med.medicine.form}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            med.availability.status
                          )}`}
                        >
                          {formatStatus(med.availability.status)}
                        </span>
                        {med.availability.quantity > 0 && (
                          <p className="text-sm text-gray-600">
                            Qty: {med.availability.quantity}
                          </p>
                        )}
                        {med.availability.expiresAt && (
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(med.availability.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && results.length === 0 && message && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No pharmacies found with the requested medicine</p>
          <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}

/**
 * Usage in a Next.js page:
 * 
 * import { MedicineSearchExample } from '@/app/api/patient/search-medicines/example-client';
 * 
 * export default function SearchPage() {
 *   return <MedicineSearchExample />;
 * }
 */

