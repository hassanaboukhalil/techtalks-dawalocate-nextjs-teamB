"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, Pencil, Shield, Mail, Phone, CheckCircle2, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabKey = "account" | "security";

export default function PharmacySettingsPage() {
  const [tab, setTab] = useState<TabKey>("account");

  // Account info - initially empty, will be loaded from API
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [initial, setInitial] = useState({ email: "", phone: "" }); // initial values that can be updated
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
        const response = await axios.get("/api/pharmacy/account");

        if (response.data.success) {
          const accountData = response.data.data;
          setEmail(accountData.email);
          setPhone(accountData.phone);
          setInitial({ email: accountData.email, phone: accountData.phone });
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

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordHint =
    "Password must be at least 8 characters, include numbers, letters, and special characters.";

  const onResetAccount = () => {
    setEmail(initial.email);
    setPhone(initial.phone);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
  };

  const onSaveAccount = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch("/api/pharmacy/account", {
        email,
        phone,
      });

      if (response.data.success) {
        // Update initial state with the new values
        setInitial({ email, phone });
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

  const onUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) return;
    if (newPassword !== confirmPassword) return;

    console.log("Frontend: Starting password update");
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.patch("/api/pharmacy/account", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      console.log("Frontend: Password update response:", response.data);

      if (response.data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

  const passwordValid = newPassword.length >= 8 && newPassword === confirmPassword;

  // Show loading state while fetching data
  if (loading) {
  return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <span>Dashboard</span>
        <span className="opacity-50">/</span>
        <span>Settings</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your pharmacy login details safely and securely.
          </p>
        </div>
      </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 animate-pulse">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 shadow-lg"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading account information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Breadcrumb + Top right icons (optional) */}
      <div className="text-xs text-slate-500 flex items-center gap-2 animate-fade-in">
        <span>Dashboard</span>
        <span className="opacity-50">/</span>
        <span>Settings</span>
      </div>

      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your pharmacy login details safely and securely.
          </p>
        </div>
      </div>

      {/* CREATIVE ANIMATED TABS */}
      <div className="w-full animate-fade-in-up animation-delay-200">
        <div className="relative w-full max-w-md mx-auto">
          {/* Background with animated gradient */}
          <div className="absolute inset-0 rounded-2xl opacity-30 animate-pulse-slow" style={{ backgroundColor: "#2699b2" }}></div>

          {/* Main container */}
          <div className="relative grid grid-cols-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
            {/* Sliding indicator */}
            <div
              className={`absolute top-1.5 h-[calc(100%-12px)] rounded-xl shadow-lg transition-all duration-500 ease-out transform pointer-events-none ${
                tab === "account"
                  ? "left-1.5 translate-x-0"
                  : "left-1.5 translate-x-full"
              }`}
              style={{
                width: "calc(50% - 6px)",
                backgroundColor: "#2699b2"
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>

              {/* Ripple effect on active tab */}
              <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse opacity-50"></div>
            </div>

            {/* Account Info Tab */}
          <button
            onClick={() => {
              console.log("Account tab clicked");
              setTab("account");
            }}
              className={`relative z-20 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 group ${
              tab === "account"
                  ? "text-white transform scale-105"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              style={tab !== "account" ? { transform: "scale(1.02)" } : undefined}
              onMouseEnter={(e) => {
                if (tab !== "account") {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== "account") {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  tab === "account"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-slate-700"
                }`} style={tab !== "account" ? { backgroundColor: "var(--color-primary-hover)" } : undefined}>
                  <User className="w-4 h-4" />
                </div>
                <span className="relative">
                  Account Info
                  {/* Hover underline effect */}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-white/60 transition-all duration-300 ${
                    tab === "account" ? "w-full" : "w-0 group-hover:w-full"
                  }`}></div>
                </span>
              </div>

              {/* Floating particles effect */}
              {tab === "account" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 right-2 w-1 h-1 bg-white/60 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce animation-delay-300"></div>
                </div>
              )}
          </button>

            {/* Security Tab */}
          <button
            onClick={() => {
              console.log("Security tab clicked");
              setTab("security");
            }}
              className={`relative z-20 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 group ${
              tab === "security"
                  ? "text-white transform scale-105"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              style={tab !== "security" ? { transform: "scale(1.02)" } : undefined}
              onMouseEnter={(e) => {
                if (tab !== "security") {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== "security") {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  tab === "security"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-slate-700"
                }`} style={tab !== "security" ? { backgroundColor: "var(--color-primary-hover)" } : undefined}>
                  <Shield className="w-4 h-4" />
                </div>
                <span className="relative">
                  Security
                  {/* Hover underline effect */}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-white/60 transition-all duration-300 ${
                    tab === "security" ? "w-full" : "w-0 group-hover:w-full"
                  }`}></div>
                </span>
              </div>

              {/* Floating particles effect */}
              {tab === "security" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="absolute bottom-1 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce animation-delay-500"></div>
                </div>
              )}
          </button>
          </div>

          {/* Ambient glow effect */}
          <div className="absolute -inset-2 rounded-3xl blur-xl opacity-20 transition-all duration-500 pointer-events-none" style={{ backgroundColor: "#2699b2" }}></div>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl backdrop-blur-sm animate-fade-in-up animation-delay-300">
        {tab === "account" ? (
          <div className="p-6 md:p-8 animate-fade-in animation-delay-400">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: "var(--color-primary)" }}>
                <Mail className="w-5 h-5" />
              </div>
              Account Information
            </h2>

            {/* Email */}
            <div className="space-y-3 animate-fade-in animation-delay-500">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Email address
              </label>

              <div className="flex items-center gap-3 group">
                <div className="flex-1 relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingEmail}
                  className={[
                      "w-full h-12 rounded-xl border px-4 text-sm outline-none transition-all duration-300",
                      "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50",
                      "hover:shadow-md transform hover:scale-[1.01]",
                      !isEditingEmail ? "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700" : "bg-white shadow-lg",
                  ].join(" ")}
                    placeholder="your.email@example.com"
                />
                  {!isEditingEmail && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingEmail((v) => !v)}
                  className="h-12 w-12 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-200 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                  style={{ backgroundColor: "#2699b2" }}
                  aria-label="Edit email"
                >
                  <Pencil className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" />
                </button>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 inline-block"></span>
                Used for login and notifications.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-3 mt-8 animate-fade-in animation-delay-600">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Phone number
              </label>

              <div className="flex items-center gap-3 group">
                <div className="flex-1 relative">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditingPhone}
                  className={[
                      "w-full h-12 rounded-xl border px-4 text-sm outline-none transition-all duration-300",
                      "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50",
                      "hover:shadow-md transform hover:scale-[1.01]",
                      !isEditingPhone ? "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700" : "bg-white shadow-lg",
                  ].join(" ")}
                    placeholder="+961 1 111 111"
                />
                  {!isEditingPhone && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingPhone((v) => !v)}
                  className="h-12 w-12 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-200 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                  style={{ backgroundColor: "#2699b2" }}
                  aria-label="Edit phone"
                >
                  <Pencil className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" />
                </button>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 inline-block"></span>
                You&apos;ll be logged out if you change your email or password.
              </p>
            </div>

            {/* Success message */}
            {success && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-lg animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">{success}</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

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
                style={{ backgroundColor: saving ? undefined : "var(--color-primary)" }}
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
          <div className="p-6 md:p-8 animate-fade-in animation-delay-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative p-4 rounded-2xl shadow-lg" style={{ backgroundColor: "var(--color-primary)" }}>
                <div className="absolute inset-0 rounded-2xl opacity-20" style={{ backgroundColor: "var(--color-primary)" }}></div>
                <Shield className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Change your password regularly to keep your account secure.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-lg animate-fade-in animation-delay-500">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                Change password
              </h3>

              {/* Current */}
              <div className="space-y-3 animate-fade-in animation-delay-600">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Current password
                </label>
                <div className="relative group">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* New */}
              <div className="space-y-3 mt-6 animate-fade-in animation-delay-700">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  New password
                </label>
                <div className="relative group">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Toggle new password visibility"
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-3 mt-6 animate-fade-in animation-delay-800">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Confirm new password
                </label>
                <div className="relative group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-fade-in animation-delay-900">
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-full bg-amber-100 mt-0.5">
                    <Shield className="w-3 h-3 text-amber-600" />
                  </div>
                  <p className="text-xs text-amber-700 font-medium">{passwordHint}</p>
                </div>
              </div>

              {/* Success message for password updates */}
              {success && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-lg animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-emerald-700">{success}</p>
                  </div>
                </div>
              )}

              {/* Error message for password updates */}
              {error && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3 animate-fade-in animation-delay-1000">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="h-12 px-8 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-95"
                >
                  Cancel
                </button>
                <Button
                  onClick={onUpdatePassword}
                  disabled={saving}
                  variant="default"
                  size="default"
                  style={{
                    backgroundColor: "#2699b2",
                    borderColor: "#2699b2",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                  className="font-semibold text-white shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Update password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
