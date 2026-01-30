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
} from "@/components/pharmacy/profile";
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
import { PageTitle } from "@/components/layout/PageTitle";

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
              <PageTitle>Your Profile</PageTitle>
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

        {/* Edit Dialog*/}
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="
            p-0 overflow-hidden
            sm:max-w-[680px] w-[calc(100vw-24px)]
            max-h-[90vh]
            rounded-3xl border border-slate-200 bg-white shadow-2xl
            outline-none focus:outline-none focus-visible:outline-none
            ring-0 focus:ring-0 focus-visible:ring-0
            [&>button]:hidden
          "
        >

            {/* Top teal header */}
            <div className="relative bg-[#2a9ab0] text-white px-6 sm:px-7 py-6">
              <button
                onClick={closeEditDialog}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition"
                aria-label="Close"
                type="button"
              >
                ✕
              </button>

              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 border border-white/20">
                  <span className="text-lg">🏥</span>
                </div>

                <div>
                  <DialogTitle className="text-xl text-white sm:text-2xl font-semibold leading-tight">
                    Edit Pharmacy Profile
                  </DialogTitle>
                  <p className="text-white/85 text-sm mt-1">
                    Update your pharmacy details and availability settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-7 py-6 max-h-[70vh] overflow-y-auto">
              {editError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{editError}</p>
                </div>
              )}

              {/* Soft input style */}
              {/*
                If you prefer, move this string outside the JSX.
                Keeping it inline here so you can copy-paste fast.
              */}
              <div className="grid gap-5">
                {/* Pharmacy Name */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase"
                  >
                    Pharmacy Name *
                  </Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className={[
                      "h-12 rounded-2xl bg-slate-50 border-slate-200 px-4",
                      "focus-visible:ring-2 focus-visible:ring-[#2a9ab0]/35 focus-visible:border-[#2a9ab0]",
                      "placeholder:text-slate-400",
                      formErrors.name ? "border-red-400 focus-visible:ring-red-200" : "",
                    ].join(" ")}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className={[
                      "h-12 rounded-2xl bg-slate-50 border-slate-200 px-4",
                      "focus-visible:ring-2 focus-visible:ring-[#2a9ab0]/35 focus-visible:border-[#2a9ab0]",
                      "placeholder:text-slate-400",
                      formErrors.email ? "border-red-400 focus-visible:ring-red-200" : "",
                    ].join(" ")}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="phone"
                    className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className={[
                      "h-12 rounded-2xl bg-slate-50 border-slate-200 px-4",
                      "focus-visible:ring-2 focus-visible:ring-[#2a9ab0]/35 focus-visible:border-[#2a9ab0]",
                      "placeholder:text-slate-400",
                      formErrors.phone ? "border-red-400 focus-visible:ring-red-200" : "",
                    ].join(" ")}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                {/* City */}
                <div className="grid gap-2">
                  <Label className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                    City
                  </Label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <CityAutocomplete
                      cities={LEBANON_CITIES}
                      value={editForm.city}
                      onChange={(value) => handleFormChange("city", value)}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid gap-2">
                  <Label
                    htmlFor="address"
                    className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase"
                  >
                    Full Address
                  </Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-slate-200 px-4 focus-visible:ring-2 focus-visible:ring-[#2a9ab0]/35 focus-visible:border-[#2a9ab0]"
                  />
                </div>

                {/* Opening Hours */}
                <div className="grid gap-2">
                  <Label className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                    Opening Hours
                  </Label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <OpeningHoursInput
                      value={editForm.openingHours}
                      onChange={(value) => handleFormChange("openingHours", value)}
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    id="hasDelivery"
                    checked={editForm.hasDelivery}
                    onChange={(e) => handleFormChange("hasDelivery", e.target.checked)}
                    className="h-4 w-4 accent-[#2a9ab0]"
                  />
                  <Label
                    htmlFor="hasDelivery"
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    Offers delivery service
                  </Label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-7 pb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={editLoading}
                  className="
                    w-full sm:w-auto
                    rounded-2xl
                    border-slate-200 bg-white
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="
                    w-full sm:flex-1
                    rounded-2xl
                    bg-[#2a9ab0] hover:bg-[#23899c]
                    text-white
                    shadow-lg shadow-[#2a9ab0]/25
                  "
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
