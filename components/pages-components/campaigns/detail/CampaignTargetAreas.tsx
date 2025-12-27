import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CampaignTargetAreasProps {
  targetAreas: string;
}

export default function CampaignTargetAreas({
  targetAreas,
}: CampaignTargetAreasProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-indigo-100 rounded-lg p-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Target Areas</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {targetAreas.split(",").map((area, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium"
          >
            <MapPin className="h-3 w-3" />
            {area.trim()}
          </span>
        ))}
      </div>
    </Card>
  );
}
