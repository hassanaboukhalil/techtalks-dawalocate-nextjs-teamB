"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Truck,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { OpeningHoursInput } from "@/components/ui/OpeningHoursInput";
import { Button } from "@/components/ui/button";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";

interface ServiceChipProps {
  icon: any;
  label: string;
  available: boolean;
  className?: string;
}

const ServiceChip = ({ icon: Icon, label, available, className = "" }: ServiceChipProps) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";
  const availableClasses = available ? "bg-white border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-600";
  const iconClasses = `h-4 w-4 ${available ? "text-green-600" : "text-gray-500"}`;
  const badgeClasses = `text-xs px-1.5 py-0.5 rounded-full font-semibold ${available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`;

  return (
    <div className={`${baseClasses} ${className} ${availableClasses}`}>
      <Icon className={iconClasses} />
      <span className="text-sm font-medium">{label}</span>
      <span className={badgeClasses}>
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
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/pharmacy/profile");
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to fetch pharmacy profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();

    if (statusLower === "approved") {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 animate-pulse" />
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm animate-pulse">
            Approved
          </span>
        </div>
      );
    }

    if (statusLower === "pending") {
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
            Pending
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
        <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
          {status || "Rejected"}
            </span>
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
    // If it's a string, return it directly (could be status or simple hours)
    if (typeof openingHours === "string") {
      return openingHours || "Not provided";
    }

    // If it's null, undefined, or empty array
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
      return "Not provided";
    }

    // Format as JSX for better typography with multi-line layout
    return (
      <div className="space-y-3">
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
                ? "Mon–Fri"
                : slot.days.join(", ");

            return (
              <div key={`${daysStr}-${slot.openTime}`} className="text-base">
                <div className="text-gray-600 font-medium leading-tight">{daysStr}</div>
                <div className="text-gray-900 font-semibold text-base">{slot.openTime} – {slot.closeTime}</div>
              </div>
            );
          })
          .filter(Boolean)}
      </div>
    );
  };

  // Edit dialog functions
  const openEditDialog = () => {
    if (!profile) return;

    // Pre-fill form with current profile data
    let openingHoursValue = "";
    if (Array.isArray(profile.openingHours)) {
      openingHoursValue = JSON.stringify(profile.openingHours);
    } else if (typeof profile.openingHours === "string") {
      openingHoursValue = profile.openingHours;
    }

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
    setEditSuccess(null);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleProfilePictureClick = () => {
    // Placeholder for future profile picture upload functionality
    alert("Profile picture upload feature coming soon! Use the Edit Profile button to update your pharmacy information.");
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditError(null);
    setEditSuccess(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!editForm.name.trim()) {
      errors.name = "Pharmacy name is required";
    }

    if (!editForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (editForm.phone && editForm.phone.length < 8) {
      errors.phone = "Phone number must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await axios.put("/api/pharmacy/profile", editForm);

      if (response.data.success) {
        setProfile(response.data.data);
        setEditSuccess("Profile updated successfully!");
        // Close dialog immediately after successful update
        closeEditDialog();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to update profile";
      console.error("Error updating profile:", errorMessage);
      setEditError(errorMessage);
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex text-sm text-gray-500">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Profile</span>
            </nav>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Your Profile
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl">
                Manage your pharmacy information and settings to provide better service to your patients.
              </p>
            </div>
            <button
              onClick={openEditDialog}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-lg font-semibold shadow-md hover:scale-[1.02]"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          </div>

        {/* Service Chip Component */}
        <div className="space-y-6 animate-fade-in">
          {/* Top Row: Profile Summary + Services Chips */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Profile Summary */}
              <div className="flex items-center gap-4 flex-1">
                <div className="relative group">
                  {/* Profile Picture Container */}
                  <div
                    className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-4 shadow-lg border-4 border-white relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
                    onClick={handleProfilePictureClick}
                    title="Click to change profile picture"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20"></div>

                    {/* Person Icon */}
                    <User className="h-8 w-8 text-white relative z-10 drop-shadow-lg" />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Edit className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>

                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                    {profile.name}
                  </h2>
                  <div className="flex items-center">
                    {getStatusBadge(profile.status)}
                  </div>
                </div>
              </div>

              {/* Services Chips and Quick Info */}
              <div className="flex flex-wrap gap-3 lg:justify-end lg:items-center">
                <ServiceChip
                  icon={Truck}
                  label="Delivery"
                  available={profile.hasDelivery || false}
                />

                {/* Quick Info - Moved here */}
                <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 hover:shadow-lg transition-all duration-300 ml-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                      <Building2 className="h-3 w-3 text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Quick Info</h4>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member since</span>
                      <span className="font-medium text-gray-900">{formatDate(profile.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last updated</span>
                      <span className="font-medium text-gray-900">{formatDate(profile.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information - Full Width */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 hover:bg-blue-50/80 transition-all duration-200">
                <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                    Email Address
                  </p>
                  <p className="text-gray-900 font-semibold text-base leading-tight break-words">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 hover:bg-green-50/80 transition-all duration-200">
                <div className="bg-green-500 p-2 rounded-lg shadow-sm">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </p>
                  <p className="text-gray-900 font-semibold text-base leading-tight">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* City */}
              <div className="flex items-start gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100 hover:border-purple-200 hover:bg-purple-50/80 transition-all duration-200">
                <div className="bg-purple-500 p-2 rounded-lg shadow-sm">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
                    City
                  </p>
                  <p className="text-gray-900 font-semibold text-base leading-tight">
                    {profile.city || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 hover:bg-orange-50/80 transition-all duration-200">
                <div className="bg-orange-500 p-2 rounded-lg shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                    Opening Hours
                  </p>
                  <div className="text-gray-900">
                    {formatOpeningHours(profile.openingHours)}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Address and Pharmacy ID - Side by Side */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Address */}
              <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100/80 transition-all duration-300">
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-indigo-500 p-3 rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                      Full Address
                    </p>
                    <p className="text-gray-900 font-semibold text-lg leading-relaxed break-words">
                      {profile.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pharmacy ID */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-100/80 transition-all duration-300">
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2">
                      Pharmacy ID
                    </p>
                    <p className="text-gray-900 font-semibold text-lg leading-relaxed break-words">
                      {profile.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

              </div>
            </div>

        {/* Edit Profile Dialog */}
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
              {/* Name */}
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

              {/* Phone */}
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

              {/* City */}
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={editForm.city}
                  onChange={(value) => handleFormChange("city", value)}
                />
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                />
              </div>

              {/* Opening Hours */}
              <div className="grid gap-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <OpeningHoursInput
                  value={editForm.openingHours}
                  onChange={(value) => handleFormChange("openingHours", value)}
                />
              </div>

              {/* Has Delivery */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasDelivery"
                  checked={editForm.hasDelivery}
                  onChange={(e) => handleFormChange("hasDelivery", e.target.checked)}
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