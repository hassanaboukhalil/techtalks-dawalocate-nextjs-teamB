"use client";

import { ArrowLeft, Building2, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Campaign,
  getStatusBadge,
  formatDateLong,
} from "@/lib/utils/campaignHelpers";
import CampaignWhatsAppCTA from "./CampaignWhatsAppCTA";

interface CampaignDetailHeaderProps {
  campaign: Campaign;
  status: string;
  onBack: () => void;
  onShare: () => void;
}

export default function CampaignDetailHeader({
  campaign,
  status,
  onBack,
  onShare,
}: CampaignDetailHeaderProps) {
  return (
    <div className="mb-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-6 border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaigns
      </Button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {campaign.title}
            </h1>
            {getStatusBadge(status)}
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-medium">{campaign.charity.name}</span>
            {campaign.charity.city && (
              <>
                <span className="text-gray-400">•</span>
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{campaign.charity.city}</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Created {formatDateLong(campaign.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onShare}
            variant="outline"
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {/* WhatsApp CTA button beside Share */}
          {campaign.charity.phone && (
            <CampaignWhatsAppCTA
              phone={campaign.charity.phone}
              campaignTitle={campaign.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
