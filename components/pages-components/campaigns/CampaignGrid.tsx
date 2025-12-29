import { Loader2, AlertCircle, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CampaignCard from "./CampaignCard";
import { Campaign } from "@/lib/utils/campaignHelpers";

interface CampaignGridProps {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReturnToAll: () => void;
  hasFilters: boolean;
  onCardClick: (campaignId: number) => void;
}

export default function CampaignGrid({
  campaigns,
  loading,
  error,
  onRetry,
  onReturnToAll,
  hasFilters,
  onCardClick,
}: CampaignGridProps) {
  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600 text-lg">Loading campaigns...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Error Loading Campaigns
            </h3>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Empty State
  if (campaigns.length === 0) {
    return (
      <Card className="rounded-xl p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-primary/10 rounded-full p-6 w-fit mx-auto mb-4">
            <Heart className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600 mb-6">
            {hasFilters
              ? "Try adjusting your search terms or filters"
              : "Check back soon for new campaigns from charities"}
          </p>
          {hasFilters && (
            <Button onClick={onReturnToAll} className="rounded-xl px-6">
              Return to All Campaigns
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Success State - Campaign Grid
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {campaigns.map((campaign, index) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onClick={() => onCardClick(campaign.id)}
          index={index}
        />
      ))}
    </div>
  );
}
