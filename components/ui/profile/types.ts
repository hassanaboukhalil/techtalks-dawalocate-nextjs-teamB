import React from "react";

export interface ServiceChipProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  available: boolean;
}

export interface TimeSlot {
  id: string;
  days: string[];
  openTime: string;
  closeTime: string;
}

export interface ContactInfo {
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  openingHours?: TimeSlot[] | string | null;
}

export interface QuickInfo {
  memberSince: string;
  lastUpdated: string;
}

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  city?: string | null;
  phone?: string | null;
  address?: string | null;
  openingHours?: TimeSlot[] | string | null;
  hasDelivery?: boolean | null;
  status: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}
