import { Package, Building2, Search, RotateCcw, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusFilter } from "@/lib/utils/campaignHelpers";

interface CampaignFiltersProps {
  searchMedicine: string;
  searchCharity: string;
  statusFilter: StatusFilter;
  filterCounts: Record<StatusFilter, number>;
  onSearchMedicineChange: (value: string) => void;
  onSearchCharityChange: (value: string) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onSearch: () => void;
  onReturnToAll: () => void;
  showReturnButton: boolean;
  variant?: "public" | "pharmacy";
}

export default function CampaignFilters({
  searchMedicine,
  searchCharity,
  statusFilter,
  filterCounts,
  onSearchMedicineChange,
  onSearchCharityChange,
  onStatusFilterChange,
  onSearch,
  onReturnToAll,
  showReturnButton,
  variant = "public",
}: CampaignFiltersProps) {
  const containerClasses =
    variant === "public" ? "mb-8 space-y-4 animate-scale-in" : "mb-6 space-y-4";

  return (
    <div className={containerClasses}>
      {/* Search Fields and Button Row */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Medicine Search */}
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchMedicine}
              onChange={(e) => onSearchMedicineChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search by medicine..."
              className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
            />
            {searchMedicine && (
              <button
                onClick={() => onSearchMedicineChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear medicine search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Charity Name Search */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchCharity}
              onChange={(e) => onSearchCharityChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search by charity name..."
              className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
            />
            {searchCharity && (
              <button
                onClick={() => onSearchCharityChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear charity search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={onSearch}
          className="h-10 px-6 rounded-lg bg-primary hover:bg-secondary transition-all duration-200 whitespace-nowrap"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Return to All Campaigns Button */}
      {showReturnButton && (
        <div className="flex justify-end">
          <Button
            onClick={onReturnToAll}
            variant="outline"
            className="h-9 px-4 rounded-lg border-gray-300 hover:bg-gray-50 text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Return to All Campaigns
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        {(["all", "active", "upcoming"] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`px-6 py-3 font-medium capitalize transition-all duration-200 border-b-2 whitespace-nowrap ${
              statusFilter === status
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {status}
            <span className="ml-2 text-xs text-gray-400">
              ({filterCounts[status]})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
