"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, CheckCircle2, User } from "lucide-react";
import SettingsLayout from "@/components/pages-components/settings/SettingsLayout";
import SettingsTabs from "@/components/pages-components/settings/SettingsTabs";
import EditableField from "@/components/pages-components/settings/EditableField";
import PasswordChangeForm from "@/components/pages-components/settings/PasswordChangeForm";
import MessageDisplay from "@/components/pages-components/settings/MessageDisplay";
import LoadingSpinner from "@/components/pages-components/settings/LoadingSpinner";

type TabKey = "account" | "security";

interface AdminAccount {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export default function AdminAccountPage() {
  const [tab, setTab] = useState<TabKey>("account");

  // Account info - initially empty, will be loaded from API
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [initial, setInitial] = useState({ name: "", email: "", phone: "" }); // initial values that can be updated
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debug tab changes
  useEffect(() => {
    console.log("Current tab:", tab);
  }, [tab]);

  // Fetch account data on component mount
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ success: boolean; data: AdminAccount; error?: string }>("/api/admin/account");

        if (response.data.success) {
          const accountData = response.data.data;
          setName(accountData.name || "");
          setEmail(accountData.email || "");
          setPhone(accountData.phone?.replace("+961", "") || "");
          setInitial({
            name: accountData.name || "",
            email: accountData.email || "",
            phone: accountData.phone?.replace("+961", "") || ""
          });
        } else {
          setError(response.data.error || "Failed to load account data");
        }
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
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
  };

  const onSaveAccount = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch<{ success: boolean; data?: AdminAccount; error?: string }>("/api/admin/account", {
        name,
        email,
        phone: phone ? `+961${phone}` : null,
      });

      if (response.data.success) {
        // Update initial state with the new values
        setInitial({ name, email, phone });
        setIsEditingName(false);
        setIsEditingEmail(false);
        setIsEditingPhone(false);
        setSuccess("Account information updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.error || "Failed to update account");
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
      const response = await axios.patch<{ success: boolean; error?: string }>("/api/admin/account", passwordData);

      console.log("Frontend: Password update response:", response.data);

      if (response.data.success) {
        setSuccess("Password updated successfully!");
        console.log("Frontend: Password updated successfully");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.log("Frontend: Password update failed:", response.data.error);
        setError(response.data.error || "Failed to update password");
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
    // Only set error if there's actually an error message (not for locally handled errors)
    if (errorMessage) {
      setError(errorMessage);
    }
    setSaving(false); // Stop loading when password error occurs
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <SettingsLayout title="Account Settings" description="Manage your administrative profile and security credentials.">
        <LoadingSpinner message="Loading account information..." />
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Account Settings" description="Manage your administrative profile and security credentials.">
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
              placeholder="Admin Name"
              helperText="Your full name as it appears in the system."
            />

            <EditableField
              label="Email address"
              icon={<Mail className="w-4 h-4 text-blue-500" />}
              value={email}
              onChange={setEmail}
              isEditing={isEditingEmail}
              onToggleEdit={() => setIsEditingEmail((v) => !v)}
              placeholder="admin@dawalocate.com"
              helperText="Used for login and notifications."
            />

            <EditableField
              label="Phone number"
              icon={<Phone className="w-4 h-4 text-blue-500" />}
              value={phone}
              onChange={setPhone}
              isEditing={isEditingPhone}
              onToggleEdit={() => setIsEditingPhone((v) => !v)}
              placeholder="70123456"
              helperText="Phone number is very important for faster contact and emergency communications."
              isPhoneField={true}
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
