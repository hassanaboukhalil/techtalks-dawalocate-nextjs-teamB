"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit,
  User,
} from "lucide-react";
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

interface ServiceChipProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  available: boolean;
}
const ServiceChip = ({ icon: Icon, label, available }: ServiceChipProps) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white shadow-lg border border-gray-100 px-4 py-3 hover:shadow-xl transition-all duration-300">
      <Icon className="h-5 w-5 text-gray-700" />
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <span
        className={`text-xs font-bold px-3 py-1 rounded-full ${
          available
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {available ? "Available" : "Unavailable"}
      </span>
    </div>
  );
};

interface TimeSlot {
  id: string;
  days: string[];
  openTime: string;
  closeTime: string;
}

interface PharmacyProfile {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: TimeSlot[] | string | null;
  hasDelivery: boolean | null;
  status: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  id: string;
  days: string[];
  openTime: string;
  closeTime: string;
}

interface PharmacyProfile {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: TimeSlot[] | string | null;
  hasDelivery: boolean | null;
  status: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
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
      if (response.data.success) setProfile(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch pharmacy profile");
    } finally {
      setLoading(false);
    }
  };

  const getStatusPill = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "approved" || s === "active") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Approved
        </div>
      );
    }
    if (s === "pending") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Pending
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 px-3 py-1 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        {status || "Rejected"}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatOpeningHours = (openingHours: any) => {
    if (typeof openingHours === "string") return openingHours || "Not provided";
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0)
      return "Not provided";
    return (
      <div className="space-y-1">
        {openingHours
          .map((slot: any) => {
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
                <div className="text-xs text-gray-600">{daysStr}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {slot.openTime} – {slot.closeTime}
                </div>
              </div>
            );
          })
          .filter(Boolean)}
      </div>
    );
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
      if (response.data.success) {
        setProfile(response.data.data);
        closeEditDialog();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2 text-center">
            Error Loading Profile
          </h2>
          <p className="text-red-700 text-center mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-4">Dashboard / <span className="text-gray-900 font-medium">Profile</span></div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-gray-600 mt-2">
                Manage your pharmacy information and settings to provide better service to your patients.
              </p>
            </div>

            <Button onClick={openEditDialog} className="bg-primary text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Top Pharmacy Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 mb-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              <div>
                <div className="text-xl font-bold text-gray-900">{profile.name}</div>
                <div className="mt-2">{getStatusPill(profile.status)}</div>
              </div>
            </div>

            <ServiceChip icon={Truck} label="Delivery" available={profile.hasDelivery || false} />
          </div>
        </div>

        {/* Main Grid: Contact Info (left) + Quick Info (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Contact Information
            </h3>

            {/* 2x2 tiles like screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Email Address
                    </div>
                    <div className="text-base font-semibold text-gray-900 break-words mt-1">
                      {profile.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-xl bg-green-50/50 border border-green-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-600 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                      Phone Number
                    </div>
                    <div className="text-base font-semibold text-gray-900 mt-1">
                      {profile.phone || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-600 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      City
                    </div>
                    <div className="text-base font-semibold text-gray-900 mt-1">
                      {profile.city || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="rounded-xl bg-orange-50/50 border border-orange-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
                      Opening Hours
                    </div>
                    <div className="text-gray-900 mt-2">
                      {formatOpeningHours(profile.openingHours)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Address full width */}
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                    Full Address
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {profile.address || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 h-fit">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Quick Info
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="font-medium text-gray-900">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last updated</span>
                <span className="font-medium text-gray-900">
                  {formatDate(profile.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Dialog (same as yours) */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pharmacy Profile</DialogTitle>
            </DialogHeader>

            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{editError}</p>
              </div>
            )}

            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Pharmacy Name *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={editForm.city}
                  onChange={(value) => handleFormChange("city", value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
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
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <Label htmlFor="hasDelivery">Offers delivery service</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog} disabled={editLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
