'use client';

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Truck, AlertCircle, Loader2 } from 'lucide-react';

interface Medicine { id: number; name: string; }
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

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!medicine.trim()) { setError('Please enter a medicine name'); return; }

    setLoading(true); setError(null);
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
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => { setMedicine(''); setCity(''); setPharmacyName(''); setResults([]); setTotal(0); setError(null); };
  const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString() : 'N/A');
  const statusBadge = (status: string) => ({ IN_STOCK: 'bg-green-100 text-green-800', LOW: 'bg-yellow-100 text-yellow-800', OUT: 'bg-red-100 text-red-800' }[status] || 'bg-red-100 text-red-800');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <form onSubmit={handleSearch} className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Search Medicines</h2>

          <input value={medicine} onChange={(e)=>setMedicine(e.target.value)} placeholder="Medicine name..." className="w-full border rounded-md px-3 py-2" />

          {/* City dropdown */}
          <select value={city} onChange={(e)=>setCity(e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="">Select city</option>
            <option value="Akkar">Akkar</option>
            <option value="Tripoli">Tripoli</option>
            <option value="Beirut">Beirut</option>
            <option value="Saida">Saida</option>
            <option value="Sour">Sour</option>
          </select>

          <input value={pharmacyName} onChange={(e)=>setPharmacyName(e.target.value)} placeholder="Pharmacy name..." className="w-full border rounded-md px-3 py-2" />

          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />} Search
            </button>
            <button type="button" onClick={reset} className="border px-4 py-2 rounded-md">Reset</button>
          </div>
        </form>
      </Card>

      {error && <div className="mb-6 p-4 bg-red-50 border rounded flex gap-2"><AlertCircle className="h-5 w-5 text-red-600" />{error}</div>}

      {results.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Found {total} results</p>
          {results.map((pharmacy)=>(
            <Card key={pharmacy.id} className="p-6">
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
                  {pharmacy.city && <p className="text-sm flex gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{pharmacy.city}</p>}
                </div>
                {pharmacy.hasDelivery && <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1"><Truck className="h-4 w-4" /> Delivery</span>}
              </div>

              {pharmacy.pharmacyMedicines.map((m)=>(
                <div key={m.id} className="flex justify-between bg-muted p-3 rounded mb-2">
                  <div>
                    <p className="font-medium">{m.medicine.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {m.quantity} • Expires: {formatDate(m.expiresAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${statusBadge(m.status)}`}>{m.status}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && !error && <div className="text-center py-12 text-muted-foreground">No results found</div>}
    </div>
  );
}
