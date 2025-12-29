"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CampaignHero from "@/components/pages-components/campaigns/CampaignHero";
import CampaignStats from "@/components/pages-components/campaigns/CampaignStats";
import CampaignFilters from "@/components/pages-components/campaigns/CampaignFilters";
import CampaignGrid from "@/components/pages-components/campaigns/CampaignGrid";
import CampaignResultsSummary from "@/components/pages-components/campaigns/CampaignResultsSummary";
import {
  Campaign,
  StatusFilter,
  getFilterCount,
} from "@/lib/utils/campaignHelpers";

interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
}

interface Charity {
  id: number;
  name: string;
  city?: string | null;
  phone?: string | null;
  email: string;
}

export default function PharmacyCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchMedicine, setSearchMedicine] = useState("");
  const [searchCharity, setSearchCharity] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMedicines(), fetchCharities()]);
      await fetchCampaigns();
    };
    loadData();
  }, [statusFilter]);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get("/api/global/medicines");
      if (response.data.success) {
        setMedicines(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  };

  const fetchCharities = async () => {
    try {
      const response = await axios.get("/api/global/charities");
      if (response.data.success) {
        setCharities(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch charities:", err);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("status", statusFilter);
      params.append("limit", "50");
      if (searchMedicine) params.append("medicine", searchMedicine);
      if (searchCharity) params.append("charity", searchCharity);

      const response = await axios.get(
        `/api/global/campaigns?${params.toString()}`
      );

      if (response.data.success) {
        setCampaigns(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCampaigns();
  };

  const handleReturnToAll = () => {
    setSearchMedicine("");
    setSearchCharity("");
    setStatusFilter("all");
  };

  const filterCounts: Record<StatusFilter, number> = {
    all: getFilterCount(campaigns, "all", totalCount),
    active: getFilterCount(campaigns, "active", totalCount),
    upcoming: getFilterCount(campaigns, "upcoming", totalCount),
  };

  const hasFilters =
    searchMedicine !== "" || searchCharity !== "" || statusFilter !== "all";

  return (
    <div className="p-6">
      <CampaignHero variant="pharmacy" />

      {!loading && !error && (
        <CampaignStats
          campaigns={campaigns}
          totalCount={totalCount}
          variant="pharmacy"
        />
      )}

      <CampaignFilters
        medicines={medicines}
        charities={charities}
        searchMedicine={searchMedicine}
        searchCharity={searchCharity}
        statusFilter={statusFilter}
        filterCounts={filterCounts}
        onSearchMedicineChange={setSearchMedicine}
        onSearchCharityChange={setSearchCharity}
        onStatusFilterChange={setStatusFilter}
        onSearch={handleSearch}
        onReturnToAll={handleReturnToAll}
        showReturnButton={hasFilters}
        variant="pharmacy"
      />

      <CampaignGrid
        campaigns={campaigns}
        loading={loading}
        error={error}
        onRetry={fetchCampaigns}
        onReturnToAll={handleReturnToAll}
        hasFilters={hasFilters}
        onCardClick={(id: number) => router.push(`/pharmacy/campaigns/${id}`)}
      />

      {!loading && !error && campaigns.length > 0 && (
        <CampaignResultsSummary
          showing={campaigns.length}
          total={totalCount}
          searchMedicine={searchMedicine}
          searchCharity={searchCharity}
        />
      )}
    </div>
  );
}
