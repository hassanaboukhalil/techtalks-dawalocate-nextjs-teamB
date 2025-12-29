import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Campaign } from "@/lib/utils/campaignHelpers";

interface CampaignMedicinesProps {
  campaignMedicines: Campaign["campaignMedicines"];
}

export default function CampaignMedicines({
  campaignMedicines,
}: CampaignMedicinesProps) {
  if (!campaignMedicines || campaignMedicines.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-blue-100 rounded-lg p-2">
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Needed Medicines ({campaignMedicines.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {campaignMedicines.map((cm) => (
          <div
            key={cm.id}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="bg-blue-200 rounded-lg p-2">
              <Package className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {cm.medicine.name}
              </p>
              {cm.medicine.genericName && (
                <p className="text-sm text-gray-600 truncate">
                  {cm.medicine.genericName}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {[cm.medicine.strength, cm.medicine.form]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
