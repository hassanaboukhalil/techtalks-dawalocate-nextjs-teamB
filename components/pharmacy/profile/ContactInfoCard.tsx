import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactInfo, TimeSlot } from "./types";
import { formatOpeningHours } from "./utils";

interface ContactInfoCardProps {
  type: "email" | "phone" | "city" | "openingHours";
  value: string | TimeSlot[] | null | undefined;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  type,
  value
}) => {
  const getCardConfig = () => {
    switch (type) {
      case "email":
        return {
          icon: Mail,
          bgColor: "bg-blue-50/50",
          borderColor: "border-blue-100",
          iconBg: "bg-blue-600",
          labelColor: "text-blue-700",
          label: "Email Address",
        };
      case "phone":
        return {
          icon: Phone,
          bgColor: "bg-green-50/50",
          borderColor: "border-green-100",
          iconBg: "bg-green-600",
          labelColor: "text-green-700",
          label: "Phone Number",
        };
      case "city":
        return {
          icon: MapPin,
          bgColor: "bg-purple-50/50",
          borderColor: "border-purple-100",
          iconBg: "bg-purple-600",
          labelColor: "text-purple-700",
          label: "City",
        };
      case "openingHours":
        return {
          icon: Clock,
          bgColor: "bg-orange-50/50",
          borderColor: "border-orange-100",
          iconBg: "bg-orange-600",
          labelColor: "text-orange-700",
          label: "Opening Hours",
        };
      default:
        return null;
    }
  };

  const config = getCardConfig();
  if (!config) return null;

  const { icon: Icon, bgColor, borderColor, iconBg, labelColor, label } = config;
  const displayValue = type === "openingHours" ? formatOpeningHours(value) : (value as string) || "Not provided";

  return (
    <div className={`rounded-lg sm:rounded-xl ${bgColor} border ${borderColor} p-3 sm:p-4`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-semibold ${labelColor} uppercase tracking-wider`}>
            {label}
          </div>
          <div className="text-sm sm:text-base font-semibold text-gray-900 break-words mt-1">
            {displayValue}
          </div>
        </div>
      </div>
    </div>
  );
};
