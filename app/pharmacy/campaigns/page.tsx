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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchCampaigns = async (
    medicine?: string,
    charity?: string,
    status?: StatusFilter
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const statusValue = status ?? statusFilter;
      const medicineValue = medicine ?? searchMedicine;
      const charityValue = charity ?? searchCharity;

      params.append("status", statusValue);
      params.append("limit", "50");
      if (medicineValue) params.append("medicine", medicineValue);
      if (charityValue) params.append("charity", charityValue);

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

  const handleMedicineSelect = (medicineName: string) => {
    setSearchMedicine(medicineName);
    fetchCampaigns(medicineName, searchCharity, statusFilter);
  };

  const handleCharitySelect = (charityName: string) => {
    setSearchCharity(charityName);
    fetchCampaigns(searchMedicine, charityName, statusFilter);
  };

  const handleReturnToAll = () => {
    setSearchMedicine("");
    setSearchCharity("");
    setStatusFilter("all");
    fetchCampaigns("", "", "all");
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

      {/* ✨ MAGICAL FRAME START */}
      <div className="relative mt-8 rounded-3xl p-[2px] overflow-hidden">
        {/* Walking gradient border */}
        <div
          className="absolute inset-0 rounded-3xl
          bg-[conic-gradient(from_0deg,
            #6366f1,
            #22d3ee,
            #14b8a6,
            #a855f7,
            #6366f1)]
          animate-[spin_10s_linear_infinite]"
        />
        <div
          className="absolute inset-[-10px] rounded-[2rem]
          bg-gradient-to-r from-indigo-400/30 via-cyan-400/30 to-violet-400/30
          blur-2xl opacity-70
          animate-[pulseGlow_6s_ease-in-out_infinite]"
        />


        {/* Inner surface */}
        <div className="relative rounded-[1.6rem] shadow-xl border border-slate-100 p-6
          bg-[linear-gradient(120deg,#ffffff, #f8fafc, #ffffff)]
          animate-[bgFlow_12s_ease-in-out_infinite]
        ">

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
            onMedicineSelect={handleMedicineSelect}
            onCharitySelect={handleCharitySelect}
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
            onCardClick={(id: number) =>
              router.push(`/pharmacy/campaigns/${id}`)
            }
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
      </div>
      {/* ✨ MAGICAL FRAME END */}
    </div>
  );
}
