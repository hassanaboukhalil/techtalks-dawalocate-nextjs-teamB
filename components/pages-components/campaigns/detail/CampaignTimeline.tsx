import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateLong, getDaysRemaining } from "@/lib/utils/campaignHelpers";

interface CampaignTimelineProps {
  startDate: string;
  endDate: string | null;
}

export default function CampaignTimeline({
  startDate,
  endDate,
}: CampaignTimelineProps) {
  const daysRemaining = getDaysRemaining(endDate);

  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="bg-green-100 rounded-lg p-2">
          <Calendar className="h-5 w-5 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Start Date
          </p>
          <p className="text-gray-900 font-medium">
            {formatDateLong(startDate)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            End Date
          </p>
          <p className="text-gray-900 font-medium">
            {endDate ? formatDateLong(endDate) : "Ongoing"}
          </p>
        </div>

        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm font-medium text-orange-900">
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
