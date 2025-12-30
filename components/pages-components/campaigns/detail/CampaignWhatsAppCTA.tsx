"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppIcon, getWhatsAppUrl } from "@/lib/utils/campaignHelpers";

interface CampaignWhatsAppCTAProps {
  phone: string;
  campaignTitle: string;
}

interface CampaignWhatsAppCTAProps {
  phone: string;
  campaignTitle: string;
  className?: string;
}

export default function CampaignWhatsAppCTA({
  phone,
  campaignTitle,
  className = "",
}: CampaignWhatsAppCTAProps) {
  const whatsappUrl = getWhatsAppUrl(phone, campaignTitle);

  return (
    <Button
      onClick={() => window.open(whatsappUrl, "_blank")}
      className={`rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 flex items-center gap-2 shadow-md w-full md:w-auto ${className}`}
      style={{ minWidth: 0 }}
      aria-label="Contact via WhatsApp"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span>Want to help? Contact via WhatsApp</span>
    </Button>
  );
}
