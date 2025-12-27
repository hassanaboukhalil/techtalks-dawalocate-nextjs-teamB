import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
}

interface Charity {
  id: number;
  name: string;
  city: string | null;
  phone: string | null;
  email: string;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  targetAreas: string;
  startDate: string;
  endDate: string | null;
  contactInfo: string;
  createdAt: string;
  charity: Charity;
  campaignMedicines?: {
    id: number;
    medicine: Medicine;
  }[];
}

export type StatusFilter = "all" | "active" | "upcoming";

export const getCampaignStatus = (campaign: Campaign): string => {
  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

  if (startDate > now) {
    return "upcoming";
  } else if (!endDate || endDate >= now) {
    return "active";
  } else {
    return "past";
  }
};

export const getStatusBadge = (status: string) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-200",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    past: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const icons = {
    active: <TrendingUp className="h-3 w-3" />,
    upcoming: <Clock className="h-3 w-3" />,
    past: <CheckCircle2 className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
        styles[status as keyof typeof styles]
      }`}
    >
      {icons[status as keyof typeof icons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getDaysRemaining = (endDate: string | null) => {
  if (!endDate) return null;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  return diffDays;
};

export const getFilterCount = (
  campaigns: Campaign[],
  filter: StatusFilter,
  totalCount: number
): number => {
  if (filter === "all") return totalCount;
  return campaigns.filter((c) => getCampaignStatus(c) === filter).length;
};
