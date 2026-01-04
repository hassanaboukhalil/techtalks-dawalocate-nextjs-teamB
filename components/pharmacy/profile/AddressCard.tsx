import React from "react";
import { MapPin } from "lucide-react";

interface AddressCardProps {
  address?: string | null;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address }) => {
  return (
    <div className="mt-4 sm:mt-6 bg-indigo-50 border border-indigo-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md mx-auto sm:mx-0 flex-shrink-0">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1.5 sm:mb-2">
            Full Address
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900 break-words">
            {address || "Not provided"}
          </div>
        </div>
      </div>
    </div>
  );
};
