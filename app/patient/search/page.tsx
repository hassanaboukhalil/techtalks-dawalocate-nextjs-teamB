'use client';

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { MedicineAutocomplete } from '@/components/ui/MedicineAutocomplete';
import { CityAutocomplete } from '@/components/ui/CityAutocomplete';
import { PharmacyAutocomplete } from '@/components/ui/PharmacyAutocomplete';
import { Search, MapPin, Truck, AlertCircle, Loader2, Package, Pill } from 'lucide-react';
import { LEBANON_CITIES } from '@/constants/lebanon-cities';

interface Medicine { id: number; name: string; genericName?: string; strength?: string; form?: string; }
interface PharmacyMedicine { id: number; medicine: Medicine; status: 'IN_STOCK' | 'LOW' | 'OUT'; quantity: number; expiresAt: string | null; }
interface Pharmacy { id: number; name: string; city: string | null; phone: string | null; hasDelivery: boolean | null; pharmacyMedicines: PharmacyMedicine[]; }
interface SearchResponse { success: boolean; data?: { results: Pharmacy[]; total: number }; error?: string; }

export default function PatientSearchPage() {
  const [medicine, setMedicine] = useState('');
  const [city, setCity] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);

  React.useEffect(() => {
    axios.get('/api/global').then(res => {
      if (res.data.success) {
        setAllMedicines(res.data.data);
      }
    }).catch(console.error);
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!medicine.trim()) { setError('Please enter a medicine name to start searching.'); return; }

    setLoading(true); setError(null); setHasSearched(true);
    try {
      const params = new URLSearchParams({ medicine: medicine.trim() });
      if (city) params.append('city', city);
      if (pharmacyName) params.append('name', pharmacyName);

      const res = await axios.get<SearchResponse>(`/api/patient/search-medicines?${params.toString()}`);

      if (res.data.success && res.data.data) {
        setResults(res.data.data.results);
        setTotal(res.data.data.total);
      } else {
        setError(res.data.error || 'Search failed');
        setResults([]);
      }
    } catch {
      setError('Something went wrong. Please try again later.');
      setResults([]);
    } finally { setLoading(false); }
  };

  const reset = () => { setMedicine(''); setCity(''); setPharmacyName(''); setResults([]); setTotal(0); setError(null); setHasSearched(false); };
  const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString() : 'N/A');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LOW': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'OUT': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4 mb-8 shadow-lg">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Find Your Medicine Locally</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Search available inventory across verified pharmacies nearby. Check stock, prices, and delivery options instantly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20">
        {/* Search Card */}
        <Card className="p-6 md:p-8 shadow-xl border-0 bg-white/95 backdrop-blur rounded-2xl">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Medicine Name <span className="text-red-500">*</span></label>
                <MedicineAutocomplete
                  medicines={allMedicines}
                  value={medicine}
                  onChange={setMedicine}
                  placeholder="e.g. Panadol"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">City</label>
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={city}
                  onChange={setCity}
                  placeholder="Select location..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Pharmacy (Optional)</label>
                <PharmacyAutocomplete
                  value={pharmacyName}
                  onChange={setPharmacyName}
                  placeholder="Search specific pharmacy..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                {loading ? 'Searching...' : 'Find Medicine'}
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition-colors text-gray-700"
              >
                Reset
              </button>
            </div>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        <div className="mt-8 space-y-6">
          {!loading && hasSearched && results.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-gray-800">Search Results</h2>
              <span className="text-sm px-3 py-1 bg-primary-hover text-primary rounded-full font-medium">
                {total} matches found
              </span>
            </div>
          )}

          {results.map((pharmacy) => (
            <Card key={pharmacy.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100 group">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {pharmacy.name}
                    </h3>
                    {(pharmacy.city || pharmacy.phone) && (
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        {pharmacy.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" /> {pharmacy.city}
                          </span>
                        )}
                        {/* Phone could go here if exposed in interface */}
                      </div>
                    )}
                  </div>
                  {pharmacy.hasDelivery && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                      <Truck className="h-3.5 w-3.5" /> Delivery Available
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Stock</h4>
                  {pharmacy.pharmacyMedicines.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50/50 transition-colors border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-primary">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{m.medicine.name}</p>
                          <p className="text-xs text-gray-500">
                            Expires: <span className="font-medium text-gray-700">{formatDate(m.expiresAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(m.status)} mb-1`}>
                          {m.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                          <Package className="h-3 w-3" /> {m.quantity} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No medicines found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                We couldn't find any pharmacies matching your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
