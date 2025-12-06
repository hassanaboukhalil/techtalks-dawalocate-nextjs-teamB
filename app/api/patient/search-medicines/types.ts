import { InventoryStatus } from "@/lib/generated/prisma/client";

/**
 * Request query parameters for the search medicines endpoint
 */
export interface SearchMedicinesParams {
  /** Medicine name to search for (searches both name and genericName) */
  medicine: string;
  
  /** Optional: Filter pharmacies by city */
  city?: string;
  
  /** Optional: Filter pharmacies by name */
  name?: string;
  
  /** Optional: Filter by inventory status (comma-separated: IN_STOCK, LOW, OUT) */
  status?: string;
  
  /** Optional: Include out of stock items (default: false) */
  includeOutOfStock?: boolean;
}

/**
 * Medicine information
 */
export interface MedicineInfo {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  description: string | null;
  imageUrl: string | null;
}

/**
 * Availability information for a medicine in a pharmacy
 */
export interface MedicineAvailability {
  status: InventoryStatus;
  quantity: number;
  expiresAt: Date | null;
  lastUpdated: Date;
}

/**
 * Medicine with availability information
 */
export interface PharmacyMedicineInfo {
  inventoryId: number;
  medicine: MedicineInfo;
  availability: MedicineAvailability;
}

/**
 * Pharmacy basic information
 */
export interface PharmacyInfo {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
}

/**
 * Search result for a single pharmacy
 */
export interface PharmacySearchResult {
  pharmacy: PharmacyInfo;
  medicines: PharmacyMedicineInfo[];
}

/**
 * Applied filters information
 */
export interface SearchFilters {
  city: string | null;
  pharmacyName: string | null;
  status: InventoryStatus[];
}

/**
 * Complete search response data
 */
export interface SearchMedicinesData {
  searchTerm: string;
  matchingMedicines: MedicineInfo[];
  results: PharmacySearchResult[];
  resultsByCity: Record<string, PharmacySearchResult[]>;
  total: number;
  filters: SearchFilters;
  message: string;
}

/**
 * Success response from the search medicines endpoint
 */
export interface SearchMedicinesSuccessResponse {
  success: true;
  data: SearchMedicinesData;
}

/**
 * Error response from the search medicines endpoint
 */
export interface SearchMedicinesErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: string;
}

/**
 * Union type for all possible responses
 */
export type SearchMedicinesResponse = 
  | SearchMedicinesSuccessResponse 
  | SearchMedicinesErrorResponse;

