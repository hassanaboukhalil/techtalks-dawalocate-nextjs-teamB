import React from "react";
import { TimeSlot } from "./types";

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

export const formatOpeningHours = (openingHours: any): React.ReactNode => {
  if (typeof openingHours === "string") return openingHours || "Not provided";
  if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0)
    return "Not provided";
  return (
    <div className="space-y-1.5 sm:space-y-1">
      {openingHours
        .map((slot: TimeSlot) => {
          if (!slot.days || slot.days.length === 0) return null;
          const daysStr =
            slot.days.length === 7
              ? "Every day"
              : slot.days.length === 5 &&
                ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d: string) =>
                  slot.days.includes(d)
                )
              ? "Mon, Tue, Wed, Thu, Fri"
              : slot.days.join(", ");
          return (
            <div key={`${daysStr}-${slot.openTime}`} className="leading-tight">
              <div className="text-xs text-gray-600 break-words">{daysStr}</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                {slot.openTime} – {slot.closeTime}
              </div>
            </div>
          );
        })
        .filter(Boolean)}
    </div>
  );
};
