"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppIcon, getWhatsAppUrl } from "@/lib/utils/campaignHelpers";

interface CampaignWhatsAppCTAProps {
  phone: string;
  campaignTitle: string;
}

export default function CampaignWhatsAppCTA({
  phone,
  campaignTitle,
}: CampaignWhatsAppCTAProps) {
  const whatsappUrl = getWhatsAppUrl(phone, campaignTitle);

  return (
    <Card className="rounded-xl border-2 border-green-200 shadow-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center mb-4">
        <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-3">
          <WhatsAppIcon className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Get Involved</h3>
        <p className="text-sm text-gray-600 mb-4">
          Contact the charity directly via WhatsApp to learn more about how you
          can help
        </p>
      </div>
      <Button
        onClick={() => window.open(whatsappUrl, "_blank")}
        className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <WhatsAppIcon className="h-5 w-5 mr-2" />
        Contact via WhatsApp
      </Button>
    </Card>
  );
}
