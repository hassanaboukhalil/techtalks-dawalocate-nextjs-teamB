"use client";

import { useState, useEffect } from "react";
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
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
            Approved
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-600" />
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
          {status || "Inactive"}
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


  const formatOpeningHours = (openingHours: any): string => {
    // If it's a string, return it directly (could be status or simple hours)
    if (typeof openingHours === "string") {
      return openingHours || "Not provided";
    }

    // If it's null, undefined, or empty array
    if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
      return "Not provided";
    }

    return openingHours
      .map((slot: any) => {
        if (!slot.days || slot.days.length === 0) return "";
        const daysStr =
          slot.days.length === 7
            ? "Every day"
            : slot.days.length === 5 &&
              ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d: string) =>
                slot.days.includes(d)
              )
            ? "Mon-Fri"
            : slot.days.join(", ");
        return `${daysStr}: ${slot.openTime} - ${slot.closeTime}`;
      })
      .filter(Boolean)
      .join(" | ");
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
    <div className="min-h-screen bg-background py-8">
      <div className="my-container">
        {/* Header Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-h2 text-primary mb-2">Pharmacy Profile</h1>
              <p className="text-gray-600">
                Manage your pharmacy information and settings
              </p>
            </div>
            <button
              onClick={openEditDialog}
              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <Edit size={20} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-lg p-8 animate-scale-in border border-gray-200">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-200">
              <div className="bg-gray-100 rounded-full p-6 shadow-lg border-2 border-gray-200">
                <Building2 className="h-12 w-12 text-gray-800" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-3">
                  {getStatusBadge(profile.status)}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-gray-900 font-medium truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </p>
                    <p className="text-gray-900 font-medium">
                      {profile.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* City */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      City
                    </p>
                    <p className="text-gray-900 font-medium">
                      {profile.city || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Opening Hours
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatOpeningHours(profile.openingHours)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Full Address
                  </p>
                  <p className="text-gray-900 font-medium">
                    {profile.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Delivery Status Card */}
            <div className="bg-card rounded-xl shadow-lg p-6 animate-scale-in border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`${
                    profile.hasDelivery
                      ? "bg-green-100"
                      : "bg-gray-100"
                  } p-3 rounded-lg`}
                >
                  <Truck
                    className={`h-6 w-6 ${
                      profile.hasDelivery
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Service
                </h3>
              </div>
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    profile.hasDelivery
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <span className="font-medium text-gray-700">Status</span>
                  <span
                    className={`font-bold ${
                      profile.hasDelivery
                        ? "text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    {profile.hasDelivery ? "Available" : "Not Available"}
                  </span>
                </div>
                {profile.hasDelivery && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">✓</span> Your pharmacy
                      offers delivery services to patients
                    </p>
                  </div>
                )}
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