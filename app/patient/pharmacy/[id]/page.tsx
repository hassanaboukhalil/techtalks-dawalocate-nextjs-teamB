"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Truck,
  XCircle,
  Loader2,
  User,
  ArrowLeft,
} from "lucide-react";
import {
  ServiceChip,
  StatusBadge,
  ContactInfoCard,
  AddressCard,
  QuickInfoCard,
  TimeSlot,
  ProfileData,
} from "@/components/pharmacy/profile";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon, getWhatsAppUrl } from "@/lib/utils/campaignHelpers";

interface PharmacyProfile extends ProfileData {
  openingHours?: TimeSlot[] | string | null;
}

export default function PatientPharmacyProfilePage() {
  const params = useParams();
  const pharmacyId = params.id as string;

  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPharmacyProfile();
  }, [pharmacyId]);

  const fetchPharmacyProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/patient/pharmacy/${pharmacyId}`);
      if (response.data?.success && response.data?.data) {
        setProfile(response.data.data);
      } else {
        setError(response.data?.error || "Failed to fetch pharmacy profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch pharmacy profile");
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp contact functionality (using campaigns approach)
  const handleWhatsAppContact = () => {
    if (!profile?.phone) {
      console.error("No phone number available");
      alert("Phone number not available for this pharmacy");
      return;
    }

    // Use the same utility function as campaigns page
    const whatsappUrl = getWhatsAppUrl(
      profile.phone,
      `Pharmacy: ${profile.name || 'Pharmacy Services'}`,
      `Hello! I'm contacting you regarding your pharmacy services on Dawalocate. I'd like to inquire about available medicines and services.`
    );

    console.log("WhatsApp URL:", whatsappUrl);

    // Simple and reliable approach from campaigns page
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-base sm:text-lg">Loading pharmacy profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md w-full">
          <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-red-900 mb-2 text-center">
            Error Loading Pharmacy Profile
          </h2>
          <p className="text-sm sm:text-base text-red-700 text-center mb-4 break-words">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={fetchPharmacyProfile}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4 sm:py-8 lg:py-12 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Breadcrumb + Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:text-primary/80 hover:underline mr-2 inline-flex items-center"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </button>
            / <span className="text-gray-900 font-medium">Pharmacy Profile</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Pharmacy Profile</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1.5 sm:mt-2">
                View pharmacy information and services available to patients.
              </p>
            </div>
            {profile?.phone && (
              <div className="flex-shrink-0">
                <Button
                  onClick={handleWhatsAppContact}
                  className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 flex items-center gap-2 shadow-md whitespace-nowrap"
                  style={{ minWidth: 0 }}
                  aria-label="Contact pharmacy via WhatsApp"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  <span>Contact Pharmacy</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top Pharmacy Summary Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{profile.name}</div>
                <div className="mt-1.5 sm:mt-2"><StatusBadge status={profile.status} /></div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <ServiceChip icon={Truck} label="Delivery" available={profile.hasDelivery || false} />
            </div>
          </div>
        </div>

        {/* Main Grid: Contact Info (left) + Quick Info (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 sm:mb-4">
              Contact Information
            </h3>

            {/* 2x2 tiles like screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ContactInfoCard type="email" value={profile.email} />
              <ContactInfoCard type="phone" value={profile.phone || ""} />
              <ContactInfoCard type="city" value={profile.city || ""} />
              <ContactInfoCard type="openingHours" value={profile.openingHours} />
            </div>

            <AddressCard address={profile.address} />
          </div>

          <QuickInfoCard
            memberSince={profile.createdAt}
            lastUpdated={profile.updatedAt}
          />
        </div>
      </div>

    </div>
  );
}
