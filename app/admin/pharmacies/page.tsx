"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, User, Phone, Mail, Sparkles, Filter } from "lucide-react";

// Components
import { PharmaciesTable } from "@/components/admin/PharmaciesTable";
import { PharmacyFilters } from "@/components/admin/PharmacyFilters";
import { PharmacyStats } from "@/components/admin/PharmacyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ===================== Interfaces ===================== */

interface Pharmacy {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  medicineCount: number;
}

interface PharmacyStats {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  total: number;
}

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/* ===================== Main Content ===================== */

function AdminPharmaciesContent() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [stats, setStats] = useState<PharmacyStats>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    total: 0,
  });

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all");

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchName(query);
  }, [searchParams]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (statusFilter !== "all") params.append("status", statusFilter);

      const searchTerms = [searchName, searchPhone, searchEmail]
        .filter((t) => t.trim())
        .join(" ");
      if (searchTerms) params.append("search", searchTerms);

      if (cityFilter) params.append("city", cityFilter);
      if (deliveryFilter !== "all") params.append("hasDelivery", deliveryFilter);

      params.append("limit", pagination.limit.toString());
      params.append("offset", pagination.offset.toString());

      const res = await fetch(`/api/admin/pharmacies?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setPharmacies(data.data);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [
    statusFilter,
    searchName,
    searchPhone,
    searchEmail,
    cityFilter,
    deliveryFilter,
    pagination.offset,
  ]);

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900">
            <Sparkles className="h-8 w-8 text-indigo-500" />
            Pharmacies Management
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Review, approve, and manage pharmacy accounts
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={fetchPharmacies}
          disabled={loading}
          className="gap-2 bg-white border-slate-200 shadow-sm hover:border-indigo-300"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin text-indigo-600" : "text-slate-500"
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* ================= STATS ================= */}
      <PharmacyStats stats={stats} loading={loading} />

      {/* ================= FILTERS ================= */}
      <Card className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_0_0_rgba(15,23,42,0.04)]">
        <CardHeader className="border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-700 uppercase tracking-wide">
            <Filter className="h-5 w-5 text-indigo-500" />
            Advanced Filtering
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* SEARCH INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-blue-600 flex items-center gap-2">
                <User className="h-4 w-4" /> Search by Name
              </Label>
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter name..."
                className="border-blue-200 bg-blue-50/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-emerald-600 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Search by Phone
              </Label>
              <Input
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter phone..."
                className="border-emerald-200 bg-emerald-50/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-purple-600 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Search by Email
              </Label>
              <Input
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter email..."
                className="border-purple-200 bg-purple-50/30"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <PharmacyFilters
            statusFilter={statusFilter}
            cityFilter={cityFilter}
            deliveryFilter={deliveryFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPagination((p) => ({ ...p, offset: 0 }));
            }}
            onCityFilterChange={(v) => {
              setCityFilter(v);
              setPagination((p) => ({ ...p, offset: 0 }));
            }}
            onDeliveryFilterChange={(v) => {
              setDeliveryFilter(v);
              setPagination((p) => ({ ...p, offset: 0 }));
            }}
          />
        </CardContent>
      </Card>

      {/* ================= ERROR ================= */}
      {error && (
        <Card className="border border-red-300 bg-red-50">
          <CardContent className="pt-6 text-red-700 font-medium">
            {error}
          </CardContent>
        </Card>
      )}

      {/* ================= TABLE ================= */}
      <Card className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.04)] overflow-hidden">
        <CardContent className="p-0">
          <PharmaciesTable
            pharmacies={pharmacies}
            loading={loading}
            pagination={pagination}
            onPageChange={(offset) =>
              setPagination((p) => ({ ...p, offset }))
            }
            onRefresh={fetchPharmacies}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== Page Wrapper ===================== */

export default function AdminPharmaciesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      }
    >
      <AdminPharmaciesContent />
    </Suspense>
  );
}
