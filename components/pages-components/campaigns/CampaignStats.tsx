import { Campaign, getCampaignStatus } from "@/lib/utils/campaignHelpers";

interface CampaignStatsProps {
  campaigns: Campaign[];
  totalCount: number;
  loading?: boolean;
  variant?: "public" | "pharmacy";
}

export default function CampaignStats({
  campaigns,
  totalCount,
  loading = false,
  variant = "public",
}: CampaignStatsProps) {
  if (loading) return null;

  const activeCampaigns = campaigns.filter(
    (c) => getCampaignStatus(c) === "active"
  ).length;

  const upcomingCampaigns = campaigns.filter(
    (c) => getCampaignStatus(c) === "upcoming"
  ).length;

  const totalMedicines = campaigns.reduce(
    (acc, c) => acc + (c.campaignMedicines?.length || 0),
    0
  );

  const containerClasses =
    variant === "public"
      ? "mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 animate-scale-in"
      : "mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20";

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{totalCount}</p>
          <p className="text-sm text-gray-600 mt-1">Total Campaigns</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{activeCampaigns}</p>
          <p className="text-sm text-gray-600 mt-1">Active Campaigns</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{upcomingCampaigns}</p>
          <p className="text-sm text-gray-600 mt-1">Upcoming Campaigns</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{totalMedicines}</p>
          <p className="text-sm text-gray-600 mt-1">Medicines Needed</p>
        </div>
      </div>
    </div>
  );
}
