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
  MessageCircle,
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

interface PharmacyProfile {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: any | null; // Can be object, array, or null after API parsing
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
    const isActive = status?.toLowerCase() === "active";
    return (
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
              Active
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
              {status || "Inactive"}
            </span>
          </>
        )}
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

  const getWhatsAppLink = (phoneNumber: string | null) => {
    if (!phoneNumber) return null;
    // Remove all non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    // WhatsApp link format
    return `https://wa.me/${cleanNumber}`;
  };

  const formatOpeningHours = (openingHours: any): string => {
    if (!openingHours) return "Not provided";

    try {
      // If it's already a string, try to parse it
      const timeSlots = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;

      if (!Array.isArray(timeSlots) || timeSlots.length === 0) return "Not provided";

      return timeSlots
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
    } catch {
      return "Not provided";
    }
  };

  // Edit dialog functions
  const openEditDialog = () => {
    if (!profile) return;

    // Pre-fill form with current profile data
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      city: profile.city || "",
      address: profile.address || "",
      openingHours: profile.openingHours ? JSON.stringify(profile.openingHours) : "",
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
      console.log("Sending update data:", editForm);
      const response = await axios.put("/api/pharmacy/profile", editForm);

      if (response.data.success) {
        setProfile(response.data.data);
        setEditSuccess("Profile updated successfully!");
        // Close dialog immediately after successful update
        closeEditDialog();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to update profile";
      const errorDetails = err.response?.data?.details;
      console.error("Error updating profile:", errorMessage);
      if (errorDetails) {
        console.error("Validation details:", errorDetails);
      }
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

            {/* WhatsApp Contact Card */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-8 animate-scale-in text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white rounded-full p-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <svg 
                      className="h-12 w-12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" 
                        fill="#25D366"
                      />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Contact Us on WhatsApp
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      Chat with us directly for quick support
                    </p>
                  </div>

                  {profile.phone ? (
                    <>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                        <p className="font-semibold text-lg">{profile.phone}</p>
                      </div>
                      
                      <a
                        href={getWhatsAppLink(profile.phone) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 group"
                      >
                        <MessageCircle className="h-5 w-5 group-hover:animate-bounce" />
                        Open WhatsApp
                      </a>
                    </>
                  ) : (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 w-full">
                      <p className="text-sm text-white/90">
                        Phone number not available
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-white/70 mt-2">
                    Available during opening hours
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg p-6 text-white animate-scale-in">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Profile Completion</span>
                  <span className="font-bold text-xl">
                    {[
                      profile.name,
                      profile.email,
                      profile.phone,
                      profile.city,
                      profile.address,
                      profile.openingHours,
                    ].filter(Boolean).length * 16.67}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${
                        [
                          profile.name,
                          profile.email,
                          profile.phone,
                          profile.city,
                          profile.address,
                          profile.openingHours,
                        ].filter(Boolean).length * 16.67
                      }%`,
                    }}
                  />
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