"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";
import { Activity, MapPin } from "lucide-react";

/* ===================== Types (UNCHANGED) ===================== */

interface CharityFiltersProps {
  statusFilter: string;
  cityFilter: string;
  onStatusFilterChange: (status: string) => void;
  onCityFilterChange: (city: string) => void;
}

/* ===================== Component ===================== */

export function CharityFilters({
  statusFilter,
  cityFilter,
  onStatusFilterChange,
  onCityFilterChange,
}: CharityFiltersProps) {
  const citiesWithAll = ["All cities", ...LEBANON_CITIES];

  const handleCityChange = (city: string) => {
    onCityFilterChange(city === "All cities" ? "" : city);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ================= STATUS FILTER ================= */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
          <Activity className="h-4 w-4" />
          Account Status
        </Label>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger
            id="status"
            className="bg-indigo-50/40 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              <span className="text-sm font-medium text-slate-700">
                All Statuses
              </span>
            </SelectItem>

            {/* 🟡 PENDING */}
            <SelectItem value="PENDING">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-amber-700">
                  Pending
                </span>
              </div>
            </SelectItem>

            {/* 🟢 APPROVED */}
            <SelectItem value="APPROVED">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  Approved
                </span>
              </div>
            </SelectItem>

            {/* 🔴 REJECTED */}
            <SelectItem value="REJECTED">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-sm font-medium text-rose-700">
                  Rejected
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ================= CITY FILTER ================= */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
          <MapPin className="h-4 w-4" />
          Location (City)
        </Label>

        <CityAutocomplete
          cities={citiesWithAll}
          value={cityFilter || "All cities"}
          onChange={handleCityChange}
          placeholder="Filter by city..."
          className="bg-emerald-50/40 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
        />
      </div>
    </div>
  );
}
