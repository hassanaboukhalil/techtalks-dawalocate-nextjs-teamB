"use client";

import { useEffect, useState } from "react";
import { PharmaciesTable } from "@/components/admin/PharmaciesTable";
import { PharmacyFilters } from "@/components/admin/PharmacyFilters";
import { PharmacyStats } from "@/components/admin/PharmacyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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

export default function AdminPharmaciesPage() {
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (cityFilter) params.append("city", cityFilter);
      if (deliveryFilter !== "all")
        params.append("hasDelivery", deliveryFilter);
      params.append("limit", pagination.limit.toString());
      params.append("offset", pagination.offset.toString());

      const response = await fetch(`/api/admin/pharmacies?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pharmacies");
      }

      if (data.success) {
        setPharmacies(data.data);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch pharmacies");
      }
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [statusFilter, searchQuery, cityFilter, deliveryFilter, pagination.offset]);

  const handleRefresh = () => {
    fetchPharmacies();
  };

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleCityFilterChange = (city: string) => {
    setCityFilter(city);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleDeliveryFilterChange = (delivery: string) => {
    setDeliveryFilter(delivery);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacies Management</h1>
          <p className="text-gray-600 mt-1">
            Review, approve, and manage pharmacy accounts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <PharmacyStats stats={stats} loading={loading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <PharmacyFilters
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            cityFilter={cityFilter}
            deliveryFilter={deliveryFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onSearchChange={handleSearchChange}
            onCityFilterChange={handleCityFilterChange}
            onDeliveryFilterChange={handleDeliveryFilterChange}
          />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Pharmacies Table */}
      <Card>
        <CardContent className="pt-6">
          <PharmaciesTable
            pharmacies={pharmacies}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={fetchPharmacies}
          />
        </CardContent>
      </Card>
    </div>
  );
}

