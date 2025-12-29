import {
  Heart,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Pill,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Campaign,
  getCampaignStatus,
  getStatusBadge,
  formatDate,
  getDaysRemaining,
} from "@/lib/utils/campaignHelpers";

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
  index?: number;
}

export default function CampaignCard({
  campaign,
  onClick,
  index = 0,
}: CampaignCardProps) {
  const status = getCampaignStatus(campaign);
  const daysRemaining = getDaysRemaining(campaign.endDate);

  return (
    <Card
      className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden cursor-pointer animate-scale-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      {/* Status Badge - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        {getStatusBadge(status)}
      </div>

      {/* Card Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 p-4 pb-5 border-b border-gray-100">
        <div className="absolute top-3 left-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
            <Heart className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="font-medium">{campaign.charity.name}</span>
            {campaign.charity.city && (
              <>
                <span className="text-gray-400">•</span>
                <span>{campaign.charity.city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
          {campaign.description}
        </p>

        {/* Target Areas */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Target Areas:</p>
            <p className="text-gray-600">{campaign.targetAreas}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Campaign Duration:</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-600">
                {formatDate(campaign.startDate)}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">
                {campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"}
              </span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
                  <Clock className="h-3 w-3" />
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Medicines Needed */}
        {campaign.campaignMedicines &&
          campaign.campaignMedicines.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Pill className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">
                  Medicines Needed:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.campaignMedicines.slice(0, 2).map((cm) => (
                    <span
                      key={cm.id}
                      className="inline-flex items-center px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs font-medium border border-primary/20"
                    >
                      {cm.medicine.name}
                    </span>
                  ))}
                  {campaign.campaignMedicines.length > 2 && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      +{campaign.campaignMedicines.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Contact Information */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-900 mb-2">Contact:</p>
          <div className="space-y-1.5">
            {campaign.charity.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                <span>{campaign.charity.phone}</span>
              </div>
            )}
            {campaign.charity.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="truncate">{campaign.charity.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <Button
          className="w-full mt-2 bg-primary hover:bg-secondary transition-all duration-300 group-hover:shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Full Details
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
    </Card>
  );
}
