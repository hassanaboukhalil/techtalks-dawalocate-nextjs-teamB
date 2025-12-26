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

interface CharityFiltersProps {
    statusFilter: string;
    cityFilter: string;
    onStatusFilterChange: (status: string) => void;
    onCityFilterChange: (city: string) => void;
}

export function CharityFilters({
    statusFilter,
    cityFilter,
    onStatusFilterChange,
    onCityFilterChange,
}: CharityFiltersProps) {
    // Add "All cities" option to the cities list
    const citiesWithAll = ["All cities", ...LEBANON_CITIES];

    const handleCityChange = (city: string) => {
        // If "All cities" is selected, pass empty string to clear the filter
        onCityFilterChange(city === "All cities" ? "" : city);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <CityAutocomplete
                    cities={citiesWithAll}
                    value={cityFilter || "All cities"}
                    onChange={handleCityChange}
                    placeholder="Filter by city..."
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                />
            </div>
        </div>
    );
}
