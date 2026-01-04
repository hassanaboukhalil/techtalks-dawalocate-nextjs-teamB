import React from "react";
import { QuickInfo } from "./types";
import { formatDate } from "./utils";

interface QuickInfoCardProps {
  memberSince: string;
  lastUpdated: string;
}

export const QuickInfoCard: React.FC<QuickInfoCardProps> = ({
  memberSince,
  lastUpdated
}) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-4 sm:p-6 h-fit">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 sm:mb-4">
        Quick Info
      </h3>

      <div className="space-y-3 sm:space-y-3 text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-gray-600 text-xs sm:text-sm">Member since</span>
          <span className="font-medium text-gray-900 text-xs sm:text-sm break-words">
            {formatDate(memberSince)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span className="text-gray-600 text-xs sm:text-sm">Last updated</span>
          <span className="font-medium text-gray-900 text-xs sm:text-sm break-words">
            {formatDate(lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
};
