"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Pencil, Shield } from "lucide-react";

type TabKey = "account" | "security";

export default function PharmacySettingsPage() {
  const [tab, setTab] = useState<TabKey>("account");

  // Account info
  const [email, setEmail] = useState("pharmacy1@gmail.com");
  const [phone, setPhone] = useState("+961 1 111 111");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const initial = useMemo(() => ({ email, phone }), []); // demo snapshot
  const [saving, setSaving] = useState(false);

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
    try {
      // TODO: replace with your real endpoint
      // await axios.patch("/api/pharmacy/account", { email, phone });
      await new Promise((r) => setTimeout(r, 500));
      setIsEditingEmail(false);
      setIsEditingPhone(false);
    } finally {
      setSaving(false);
    }
  };

  const onUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) return;
    if (newPassword !== confirmPassword) return;

    setSaving(true);
    try {
      // TODO: replace with your real endpoint
      // await axios.patch("/api/pharmacy/account/password", { currentPassword, newPassword });
      await new Promise((r) => setTimeout(r, 600));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  };

  const passwordValid = newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 min-h-screen">
      {/* Breadcrumb + Top right icons (optional) */}
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

      {/* FULL WIDTH TABS */}
      <div className="w-full">
        <div className="grid grid-cols-2 w-full max-w-md bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTab("account")}
            className={[
              "py-2.5 rounded-lg text-sm font-semibold transition-all",
              tab === "account"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Account Info
          </button>
          <button
            onClick={() => setTab("security")}
            className={[
              "py-2.5 rounded-lg text-sm font-semibold transition-all",
              tab === "security"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Security
          </button>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {tab === "account" ? (
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Email address</h2>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email address</label>

              <div className="flex items-center gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingEmail}
                  className={[
                    "w-full h-11 rounded-lg border px-4 text-sm outline-none transition",
                    "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                    !isEditingEmail ? "bg-slate-50 text-slate-700" : "bg-white",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => setIsEditingEmail((v) => !v)}
                  className="h-11 w-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition"
                  aria-label="Edit email"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">Used for login and notifications.</p>
            </div>

            {/* Phone */}
            <div className="space-y-2 mt-6">
              <label className="text-sm font-semibold text-slate-700">Phone number</label>

              <div className="flex items-center gap-3">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditingPhone}
                  className={[
                    "w-full h-11 rounded-lg border px-4 text-sm outline-none transition",
                    "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                    !isEditingPhone ? "bg-slate-50 text-slate-700" : "bg-white",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => setIsEditingPhone((v) => !v)}
                  className="h-11 w-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition"
                  aria-label="Edit phone"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                You&apos;ll be logged out if you change your email or password.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onSaveAccount}
                disabled={saving}
                className="h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={onResetAccount}
                className="h-10 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Security</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Change your password regularly to keep your account secure.
            </p>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Change password</h3>

              {/* Current */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md hover:bg-blue-100 flex items-center justify-center"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* New */}
              <div className="space-y-2 mt-5">
                <label className="text-sm font-semibold text-slate-700">New password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md hover:bg-blue-100 flex items-center justify-center"
                    aria-label="Toggle new password visibility"
                  >
                    {showNew ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-2 mt-5">
                <label className="text-sm font-semibold text-slate-700">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 pr-11 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md hover:bg-blue-100 flex items-center justify-center"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3">{passwordHint}</p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onUpdatePassword}
                  disabled={saving || !passwordValid}
                  className="h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="h-10 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
