import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status?.toLowerCase();

  if (s === "approved" || s === "active") {
    return (
      <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-100 text-green-700 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 flex-shrink-0" />
        Approved
      </div>
    );
  }

  if (s === "pending") {
    return (
      <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-orange-100 text-orange-700 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-orange-500 flex-shrink-0" />
        Pending
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-red-100 text-red-700 px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 flex-shrink-0" />
      {status || "Rejected"}
    </div>
  );
};
