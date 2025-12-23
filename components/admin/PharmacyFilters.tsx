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

interface PharmacyFiltersProps {
  statusFilter: string;
  cityFilter: string;
  deliveryFilter: string;
  onStatusFilterChange: (status: string) => void;
  onCityFilterChange: (city: string) => void;
  onDeliveryFilterChange: (delivery: string) => void;
}

export function PharmacyFilters({
  statusFilter,
  cityFilter,
  deliveryFilter,
  onStatusFilterChange,
  onCityFilterChange,
  onDeliveryFilterChange,
}: PharmacyFiltersProps) {
  // Add "All cities" option to the cities list
  const citiesWithAll = ["All cities", ...LEBANON_CITIES];

  const handleCityChange = (city: string) => {
    // If "All cities" is selected, pass empty string to clear the filter
    onCityFilterChange(city === "All cities" ? "" : city);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City Filter - Now with Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <CityAutocomplete
          cities={citiesWithAll}
          value={cityFilter || "All cities"}
          onChange={handleCityChange}
          placeholder="Filter by city..."
          className="border-gray-300 focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Delivery Filter */}
      <div className="space-y-2">
        <Label htmlFor="delivery">Delivery Service</Label>
        <Select value={deliveryFilter} onValueChange={onDeliveryFilterChange}>
          <SelectTrigger id="delivery">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">With Delivery</SelectItem>
            <SelectItem value="false">No Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

