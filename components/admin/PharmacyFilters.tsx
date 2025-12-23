"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PharmacyFiltersProps {
  statusFilter: string;
  searchQuery: string;
  cityFilter: string;
  deliveryFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onCityFilterChange: (city: string) => void;
  onDeliveryFilterChange: (delivery: string) => void;
}

export function PharmacyFilters({
  statusFilter,
  searchQuery,
  cityFilter,
  deliveryFilter,
  onStatusFilterChange,
  onSearchChange,
  onCityFilterChange,
  onDeliveryFilterChange,
}: PharmacyFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Name, email, city, phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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

      {/* City Filter */}
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="Filter by city..."
          value={cityFilter}
          onChange={(e) => onCityFilterChange(e.target.value)}
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

