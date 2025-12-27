/**
 * Campaign Type Definitions
 * Types for charity campaign management
 */

export interface CreateCampaignRequest {
  title: string;
  description: string;
  targetAreas: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  contactInfo: string;
  medicineIds?: number[];
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  targetAreas?: string;
  startDate?: string | Date;
  endDate?: string | Date | null;
  contactInfo?: string;
  medicineIds?: number[];
}

export type CampaignStatus = "active" | "upcoming" | "past" | "all";

export interface CampaignQueryParams {
  status?: CampaignStatus;
  limit?: number;
  offset?: number;
}

export interface CampaignMedicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
}

export interface CampaignCharity {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
}

export interface Campaign {
  id: number;
  charityUserId: number;
  title: string;
  description: string;
  targetAreas: string;
  startDate: Date;
  endDate: Date | null;
  contactInfo: string;
  createdAt: Date;
  updatedAt: Date;
  charity?: CampaignCharity;
  campaignMedicines?: {
    id: number;
    medicine: CampaignMedicine;
  }[];
}

export interface CampaignApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  data?: Campaign | Campaign[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

