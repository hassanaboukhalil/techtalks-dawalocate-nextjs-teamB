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
  } as const;

  const icons = {
    active: <TrendingUp className="h-3 w-3" />,
    upcoming: <Clock className="h-3 w-3" />,
    past: <CheckCircle2 className="h-3 w-3" />,
  } as const;

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

export const formatDateLong = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export const formatWhatsAppNumber = (phone: string | null): string | null => {
  if (!phone) return null;
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  // If it starts with 0, replace with country code 234 (Nigeria)
  if (cleaned.startsWith("0")) {
    return `234${cleaned.substring(1)}`;
  }
  // If it already starts with 234, return as is
  if (cleaned.startsWith("234")) {
    return cleaned;
  }
  // Otherwise, assume it's a local number and add 234
  return `234${cleaned}`;
};

export const getWhatsAppUrl = (
  phone: string | null,
  campaignTitle?: string,
  customMessage?: string
): string => {
  const formattedNumber = formatWhatsAppNumber(phone);
  if (!formattedNumber) return "#";

  const defaultMessage = campaignTitle
    ? `Hello! I'm interested in supporting your campaign: ${campaignTitle}`
    : "Hello! I'm interested in supporting your campaign.";
  const encodedMessage = encodeURIComponent(customMessage || defaultMessage);

  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

export const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
