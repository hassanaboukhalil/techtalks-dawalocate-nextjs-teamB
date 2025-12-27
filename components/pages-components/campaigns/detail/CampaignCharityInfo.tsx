import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Campaign } from "@/lib/utils/campaignHelpers";

interface CampaignCharityInfoProps {
  charity: Campaign["charity"];
}

export default function CampaignCharityInfo({
  charity,
}: CampaignCharityInfoProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-teal-100 rounded-lg p-2">
          <Building2 className="h-5 w-5 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Charity</h2>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Organization
          </p>
          <p className="text-gray-900 font-medium">{charity.name}</p>
        </div>

        {charity.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <a
              href={`mailto:${charity.email}`}
              className="text-sm text-gray-700 hover:text-primary transition-colors truncate"
            >
              {charity.email}
            </a>
          </div>
        )}

        {charity.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <a
              href={`tel:${charity.phone}`}
              className="text-sm text-gray-700 hover:text-primary transition-colors"
            >
              {charity.phone}
            </a>
          </div>
        )}

        {charity.city && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-700">{charity.city}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
