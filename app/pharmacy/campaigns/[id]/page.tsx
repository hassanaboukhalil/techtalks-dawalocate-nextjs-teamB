"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CampaignDetailHeader from "@/components/pages-components/campaigns/detail/CampaignDetailHeader";
import CampaignDescription from "@/components/pages-components/campaigns/detail/CampaignDescription";
import CampaignMedicines from "@/components/pages-components/campaigns/detail/CampaignMedicines";
import CampaignContactInfo from "@/components/pages-components/campaigns/detail/CampaignContactInfo";
import CampaignWhatsAppCTA from "@/components/pages-components/campaigns/detail/CampaignWhatsAppCTA";
import CampaignTimeline from "@/components/pages-components/campaigns/detail/CampaignTimeline";
import CampaignTargetAreas from "@/components/pages-components/campaigns/detail/CampaignTargetAreas";
import CampaignCharityInfo from "@/components/pages-components/campaigns/detail/CampaignCharityInfo";
import { Campaign, getCampaignStatus } from "@/lib/utils/campaignHelpers";

export default function PharmacyCampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/global/campaigns/${campaignId}`);

      if (response.data.success) {
        setCampaign(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || "Failed to fetch campaign details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && campaign) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border border-red-200 bg-red-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                Error Loading Campaign
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-2">
                <Button
                  onClick={fetchCampaign}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/pharmacy/campaigns")}
                  variant="outline"
                >
                  Back to Campaigns
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const status = getCampaignStatus(campaign);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <CampaignDetailHeader
          campaign={campaign}
          status={status}
          onBack={() => router.push("/pharmacy/campaigns")}
          onShare={handleShare}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CampaignDescription description={campaign.description} />
            <CampaignMedicines campaignMedicines={campaign.campaignMedicines} />
            <CampaignContactInfo
              contactInfo={campaign.contactInfo}
              charity={campaign.charity}
              campaignTitle={campaign.title}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {campaign.charity.phone && (
              <CampaignWhatsAppCTA
                phone={campaign.charity.phone}
                campaignTitle={campaign.title}
              />
            )}
            <CampaignTimeline
              startDate={campaign.startDate}
              endDate={campaign.endDate}
            />
            <CampaignTargetAreas targetAreas={campaign.targetAreas} />
            <CampaignCharityInfo charity={campaign.charity} />
          </div>
        </div>
      </div>
    </div>
  );
}
