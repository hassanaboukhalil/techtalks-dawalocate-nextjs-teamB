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
import { 
  Activity, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LayoutGrid 
} from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* --- Status Filter (PERMANENT BLUE THEME) --- */}
      <div className="space-y-2">
        <Label 
          htmlFor="status" 
          className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2"
        >
          <Activity className="h-3.5 w-3.5" />
          Account Status
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger 
            id="status" 
            className="h-10 border-blue-200 bg-blue-50/50 text-slate-700 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2 text-slate-600">
                <LayoutGrid className="h-4 w-4" />
                <span>All Statuses</span>
              </div>
            </SelectItem>
            <SelectItem value="PENDING">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700 font-medium">Pending Review</span>
              </div>
            </SelectItem>
            <SelectItem value="APPROVED">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-700 font-medium">Approved</span>
              </div>
            </SelectItem>
            <SelectItem value="REJECTED">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span className="text-rose-700 font-medium">Rejected</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- City Filter (PERMANENT EMERALD THEME) --- */}
      <div className="space-y-2">
        <Label 
          htmlFor="city" 
          className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2"
        >
          <MapPin className="h-3.5 w-3.5" />
          Location (City)
        </Label>
        <CityAutocomplete
          cities={citiesWithAll}
          value={cityFilter || "All cities"}
          onChange={handleCityChange}
          placeholder="Select a city..."
          className="h-10 border-emerald-200 bg-emerald-50/50 text-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm w-full placeholder:text-slate-400"
        />
      </div>

      {/* --- Delivery Filter (PERMANENT PURPLE THEME) --- */}
      <div className="space-y-2">
        <Label 
          htmlFor="delivery" 
          className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-2"
        >
          <Truck className="h-3.5 w-3.5" />
          Delivery Service
        </Label>
        <Select value={deliveryFilter} onValueChange={onDeliveryFilterChange}>
          <SelectTrigger 
            id="delivery"
            className="h-10 border-purple-200 bg-purple-50/50 text-slate-700 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
               <div className="flex items-center gap-2 text-slate-600">
                <LayoutGrid className="h-4 w-4" />
                <span>All Options</span>
              </div>
            </SelectItem>
            <SelectItem value="true">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100">
                    <Truck className="h-3 w-3 text-purple-600" />
                </span>
                <span className="text-purple-700 font-medium">With Delivery</span>
              </div>
            </SelectItem>
            <SelectItem value="false">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                    <XCircle className="h-3 w-3 text-slate-500" />
                </span>
                <span className="text-slate-600 font-medium">No Delivery</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}