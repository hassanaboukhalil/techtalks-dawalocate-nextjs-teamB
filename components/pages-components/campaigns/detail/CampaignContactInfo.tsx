import { Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Campaign } from "@/lib/utils/campaignHelpers";

interface CampaignContactInfoProps {
  contactInfo: string;
  charity: Campaign["charity"];
  campaignTitle: string;
}

export default function CampaignContactInfo({
  contactInfo,
  charity,
  campaignTitle,
}: CampaignContactInfoProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-orange-100 rounded-lg p-2">
          <Phone className="h-5 w-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
        {contactInfo}
      </p>
      <div className="space-y-2">
        {charity.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <a
              href={`mailto:${charity.email}?subject=Regarding ${campaignTitle}`}
              className="hover:text-primary transition-colors"
            >
              {charity.email}
            </a>
          </div>
        )}
        {charity.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <a
              href={`tel:${charity.phone}`}
              className="hover:text-primary transition-colors"
            >
              {charity.phone}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
