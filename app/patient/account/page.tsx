"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, CheckCircle2, MapPin, User } from "lucide-react";
import SettingsLayout from "@/components/pages-components/settings/SettingsLayout";
import SettingsTabs from "@/components/pages-components/settings/SettingsTabs";
import EditableField from "@/components/pages-components/settings/EditableField";
import PasswordChangeForm from "@/components/pages-components/settings/PasswordChangeForm";
import MessageDisplay from "@/components/pages-components/settings/MessageDisplay";
import LoadingSpinner from "@/components/pages-components/settings/LoadingSpinner";

type TabKey = "account" | "security";

interface PatientAccount {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
}

export default function PatientAccountPage() {
  const [tab, setTab] = useState<TabKey>("account");

  // Account info - initially empty, will be loaded from API
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [initial, setInitial] = useState({ name: "", email: "", phone: "", city: "", address: "" }); // initial values that can be updated
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch account data on component mount
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<PatientAccount>("/api/patient/account");

        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setPhone(response.data.phone?.replace("+961", "") || "");
        setCity(response.data.city || "");
        setAddress(response.data.address || "");
        setInitial({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone?.replace("+961", "") || "",
          city: response.data.city || "",
          address: response.data.address || ""
        });
      } catch (error: any) {
        console.error("Error fetching account data:", error);
        setError(error.response?.data?.error || "An error occurred while loading your account data");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  const onResetAccount = () => {
    setName(initial.name);
    setEmail(initial.email);
    setPhone(initial.phone);
    setCity(initial.city);
    setAddress(initial.address);
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
    setIsEditingCity(false);
    setIsEditingAddress(false);
  };

  const onSaveAccount = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch("/api/patient/account", {
        name,
        email,
        phone: phone ? `+961${phone}` : null,
        city,
        address,
      });

      // Patient API returns user data directly (not wrapped in success object)
      if (response.status === 200 && response.data) {
        // Update initial state with the new values
        setInitial({ name, email, phone, city, address });
        setIsEditingName(false);
        setIsEditingEmail(false);
        setIsEditingPhone(false);
        setIsEditingCity(false);
        setIsEditingAddress(false);
        setSuccess("Account information updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update account");
      }
    } catch (error: any) {
      console.error("Error updating account:", error);
      setError(error.response?.data?.error || "An error occurred while updating your account");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    console.log("Frontend: Starting password update");
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch("/api/patient/account", passwordData);

      console.log("Frontend: Password update response:", response.data);

      // Patient API returns user data directly (not wrapped in success object)
      if (response.status === 200 && response.data) {
        setSuccess("Password updated successfully!");
        console.log("Frontend: Password updated successfully");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.log("Frontend: Password update failed");
        setError("Failed to update password");
      }
    } catch (error: any) {
      console.error("Frontend: Error updating password:", error);
      setError(error.response?.data?.error || "An error occurred while updating your password");
    } finally {
      setSaving(false);
    }
  };

  // Add callback for password-specific errors
  const handlePasswordError = (errorMessage: string) => {
    setError(errorMessage);
    setSaving(false); // Stop loading when password error occurs
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <SettingsLayout title="Account Settings" description="Manage your personal account information safely and securely.">
        <LoadingSpinner message="Loading account information..." />
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Account Settings" description="Manage your personal account information safely and securely.">
      <SettingsTabs activeTab={tab} onTabChange={setTab} />

      {/* CONTENT CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl backdrop-blur-sm animate-fade-in-up animation-delay-300">
        {tab === "account" ? (
          <div className="p-6 md:p-8 animate-fade-in animation-delay-400">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: "var(--color-primary)" }}>
                <User className="w-5 h-5" />
              </div>
              Account Information
            </h2>

            <EditableField
              label="Full name"
              icon={<User className="w-4 h-4 text-blue-500" />}
              value={name}
              onChange={setName}
              isEditing={isEditingName}
              onToggleEdit={() => setIsEditingName((v) => !v)}
              placeholder="Enter your full name"
              helperText="Your display name used throughout the platform."
            />

            <EditableField
              label="Email address"
              icon={<Mail className="w-4 h-4 text-blue-500" />}
              value={email}
              onChange={setEmail}
              isEditing={isEditingEmail}
              onToggleEdit={() => setIsEditingEmail((v) => !v)}
              placeholder="your.email@example.com"
              helperText="Used for login and important notifications."
            />

            <EditableField
              label="Phone number"
              icon={<Phone className="w-4 h-4 text-blue-500" />}
              value={phone}
              onChange={setPhone}
              isEditing={isEditingPhone}
              onToggleEdit={() => setIsEditingPhone((v) => !v)}
              placeholder="70123456"
              helperText="Phone number for contact and emergency communications."
              isPhoneField={true}
            />

            <EditableField
              label="City"
              icon={<MapPin className="w-4 h-4 text-blue-500" />}
              value={city}
              onChange={setCity}
              isEditing={isEditingCity}
              onToggleEdit={() => setIsEditingCity((v) => !v)}
              placeholder="Enter your city"
              helperText="City helps locate nearby pharmacies and services."
            />

            <EditableField
              label="Address"
              icon={<MapPin className="w-4 h-4 text-blue-500" />}
              value={address}
              onChange={setAddress}
              isEditing={isEditingAddress}
              onToggleEdit={() => setIsEditingAddress((v) => !v)}
              type="textarea"
              rows={3}
              placeholder="Enter your complete address"
              helperText="Complete address helps with accurate delivery and location services."
            />

            <MessageDisplay success={success} error={error} />

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 animate-fade-in animation-delay-700">
              <button
                type="button"
                onClick={onResetAccount}
                className="h-11 px-6 rounded-xl text-white text-sm font-semibold shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onSaveAccount}
                disabled={saving}
                className="h-11 px-6 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <span className="flex items-center gap-2">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save changes
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <PasswordChangeForm
            onSubmit={handlePasswordChange}
            onPasswordError={handlePasswordError}
            loading={saving}
            error={error}
            success={success}
          />
        )}
      </div>
    </SettingsLayout>
  );
}
