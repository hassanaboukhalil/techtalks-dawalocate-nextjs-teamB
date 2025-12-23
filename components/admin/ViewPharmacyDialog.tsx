"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Truck,
  Package,
  Calendar,
} from "lucide-react";

interface Pharmacy {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  medicineCount: number;
}

interface ViewPharmacyDialogProps {
  pharmacy: Pharmacy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPharmacyDialog({
  pharmacy,
  open,
  onOpenChange,
}: ViewPharmacyDialogProps) {
  const getStatusBadge = (status: Pharmacy["status"]) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      APPROVED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <Badge variant="outline" className={`${variants[status]} font-medium`}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {pharmacy.name}
            </DialogTitle>
            <div className="mr-2">
              {getStatusBadge(pharmacy.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-all hover:border-gray-200">
            <h3 className="text-base font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                <Mail className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-gray-900 mt-0.5">{pharmacy.email}</p>
                </div>
              </div>

              {pharmacy.phone && (
                <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                  <Phone className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm text-gray-900 mt-0.5">{pharmacy.phone}</p>
                  </div>
                </div>
              )}

              {pharmacy.city && (
                <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</p>
                    <p className="text-sm text-gray-900 mt-0.5">{pharmacy.city}</p>
                  </div>
                </div>
              )}

              {pharmacy.address && (
                <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-sm text-gray-900 mt-0.5">{pharmacy.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-all hover:border-gray-200">
            <h3 className="text-base font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Business Details
            </h3>
            <div className="space-y-3">
              {pharmacy.openingHours && (
                <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                  <Clock className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Opening Hours
                    </p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {pharmacy.openingHours}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                <Truck className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Delivery Service
                  </p>
                  <div className="mt-1">
                    {pharmacy.hasDelivery ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        Not Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                <Package className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Inventory Size
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5 font-medium">
                    {pharmacy.medicineCount} medicine
                    {pharmacy.medicineCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-all hover:border-gray-200">
            <h3 className="text-base font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Registration Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Registered On
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {new Date(pharmacy.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded hover:bg-white transition-colors">
                <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {new Date(pharmacy.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

