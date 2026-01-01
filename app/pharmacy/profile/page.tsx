"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Truck,
  XCircle,
  Loader2,
  Edit,
  User,
} from "lucide-react";
import {
  ServiceChip,
  StatusBadge,
  ContactInfoCard,
  AddressCard,
  QuickInfoCard,
  TimeSlot,
  ProfileData,
} from "@/components/ui/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { OpeningHoursInput } from "@/components/ui/OpeningHoursInput";
import { Button } from "@/components/ui/button";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";

interface PharmacyProfile extends ProfileData {
  openingHours?: TimeSlot[] | string | null;
  // Add any pharmacy-specific fields if needed
}

export default function PharmacyProfilePage() {
  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    openingHours: "",
    hasDelivery: false,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/pharmacy/profile");
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


  const openEditDialog = () => {
    if (!profile) return;

    let openingHoursValue = "";
    if (Array.isArray(profile.openingHours)) openingHoursValue = JSON.stringify(profile.openingHours);
    else if (typeof profile.openingHours === "string") openingHoursValue = profile.openingHours;

    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      city: profile.city || "",
      address: profile.address || "",
      openingHours: openingHoursValue,
      hasDelivery: profile.hasDelivery || false,
    });

    setEditError(null);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditError(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!editForm.name.trim()) errors.name = "Pharmacy name is required";
    if (!editForm.email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
      errors.email = "Please enter a valid email address";
    if (editForm.phone && editForm.phone.length < 8)
      errors.phone = "Phone number must be at least 8 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await axios.put("/api/pharmacy/profile", editForm);
      if (response.data?.success && response.data?.data) {
        setProfile(response.data.data);
        closeEditDialog();
      } else {
        setEditError(response.data?.error || "Failed to update profile");
      }
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-base sm:text-lg">Loading your profile...</p>
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
            Error Loading Profile
          </h2>
          <p className="text-sm sm:text-base text-red-700 text-center mb-4 break-words">{error}</p>
          <button
            onClick={fetchProfile}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Breadcrumb + Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Dashboard / <span className="text-gray-900 font-medium">Profile</span></div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1.5 sm:mt-2">
                Manage your pharmacy information and settings to provide better service to your patients.
              </p>
            </div>

            <Button 
              onClick={openEditDialog} 
              className="bg-primary text-white rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Edit Profile</span>
            </Button>
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

        {/* Edit Dialog (same as yours) */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-3 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Pharmacy Profile</DialogTitle>
            </DialogHeader>

            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{editError}</p>
              </div>
            )}

            <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Pharmacy Name *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className={`text-sm sm:text-base ${formErrors.name ? "border-red-500" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-xs sm:text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className={`text-sm sm:text-base ${formErrors.email ? "border-red-500" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-xs sm:text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  className={`text-sm sm:text-base ${formErrors.phone ? "border-red-500" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-xs sm:text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city" className="text-sm sm:text-base">City</Label>
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={editForm.city}
                  onChange={(value) => handleFormChange("city", value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-sm sm:text-base">Full Address</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="openingHours" className="text-sm sm:text-base">Opening Hours</Label>
                <OpeningHoursInput
                  value={editForm.openingHours}
                  onChange={(value) => handleFormChange("openingHours", value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasDelivery"
                  checked={editForm.hasDelivery}
                  onChange={(e) =>
                    handleFormChange("hasDelivery", e.target.checked)
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
                />
                <Label htmlFor="hasDelivery" className="text-sm sm:text-base cursor-pointer">Offers delivery service</Label>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={closeEditDialog} 
                disabled={editLoading}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                disabled={editLoading}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
