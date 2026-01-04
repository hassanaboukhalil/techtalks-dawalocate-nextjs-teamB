import React from "react";
import { ServiceChipProps } from "./types";

export const ServiceChip: React.FC<ServiceChipProps> = ({
  icon: Icon,
  label,
  available
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white shadow-lg border border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 hover:shadow-xl transition-all duration-300">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
        {label}
      </span>
      <span
        className={`text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
          available
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {available ? "Available" : "Unavailable"}
      </span>
    </div>
  );
};
