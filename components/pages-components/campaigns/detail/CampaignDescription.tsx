import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CampaignDescriptionProps {
  description: string;
}

export default function CampaignDescription({
  description,
}: CampaignDescriptionProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-purple-100 rounded-lg p-2">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">About This Campaign</h2>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
