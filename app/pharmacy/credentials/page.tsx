"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Phone, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

/**
 * SCRUM-207
 * Pharmacy – Edit Account (Credentials)
 * Updates: email, phone, password
 */

type FormState = {
  email: string;
  phone: string;
  password: string;
};

export default function PharmacyProfilePage() {
  const { data: session, status } = useSession();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: "",
    phone: "",
    password: "",
  });

  const [initial, setInitial] = useState({
    email: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isDirty = useMemo(() => {
    return (
      form.email.trim() !== initial.email.trim() ||
      form.phone.trim() !== initial.phone.trim() ||
      form.password.trim().length > 0
    );
  }, [form, initial]);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get("/api/pharmacy/profile");
        if (res.data?.success) {
          setForm({
            email: res.data.data.email ?? "",
            phone: res.data.data.phone ?? "",
            password: "",
          });
          setInitial({
            email: res.data.data.email ?? "",
            phone: res.data.data.phone ?? "",
          });
        }
      } catch {
        setErrorMsg("Unable to load account information.");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (status === "authenticated") loadProfile();
    if (status !== "loading") setLoadingProfile(false);
  }, [status]);

  // Auth guards
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#119abf]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Please sign in to manage your pharmacy account.
            </p>
            <Button onClick={() => signIn()} className="w-full">
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handlers
  const onChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMsg("");
      setSuccessMsg("");
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!isDirty) {
      setErrorMsg("No changes detected.");
      return;
    }

    setSaving(true);

    try {
      const payload: { email?: string; phone?: string; password?: string } = {};

      if (form.email.trim() !== initial.email) payload.email = form.email.trim();
      if (form.phone.trim() !== initial.phone) payload.phone = form.phone.trim();
      if (form.password.trim()) payload.password = form.password.trim();

      const res = await axios.patch(
        "/api/pharmacy/profile/credentials",
        payload
      );

      if (res.data?.success) {
        setSuccessMsg("Your account details have been updated successfully.");

        if (payload.password) setPasswordUpdated(true);

        setInitial({
          email: form.email,
          phone: form.phone,
        });

        setForm((prev) => ({ ...prev, password: "" }));
      } else {
        setErrorMsg(res.data?.error || "Update failed.");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      email: initial.email,
      phone: initial.phone,
      password: "",
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Edit Account</h1>
          <p className="mt-2 text-slate-600 text-lg">
            Manage your pharmacy login details safely and securely.
          </p>
        </div>

        {/* Security tip */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex gap-3">
          <ShieldCheck className="text-[#119abf]" />
          <p className="text-slate-600">
            For your security, passwords are never displayed or stored in plain text.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-emerald-600">{successMsg}</p>}

        {/* Main card */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Account Credentials</CardTitle>
          </CardHeader>

          <CardContent className="grid lg:grid-cols-2 gap-10">
            {/* Left: Form */}
            <div className="space-y-6">
              <div>
                <Label>Email address</Label>
                <Input
                  value={form.email}
                  onChange={onChange("email")}
                  className="h-11"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used for login and notifications.
                </p>
              </div>

              <div>
                <Label>Phone number</Label>
                <Input
                  value={form.phone}
                  onChange={onChange("phone")}
                  className="h-11"
                />
              </div>

              <div>
                <Label>New password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange("password")}
                    className="h-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to keep your current password.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="h-11 bg-[#119abf] hover:bg-[#0e8cae]"
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!isDirty}
                  className="h-11"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs text-slate-500">Account email</p>
                <p className="font-semibold">{form.email}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-semibold">{form.phone}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs text-slate-500">Password</p>
                <p className="font-semibold">
                  {passwordUpdated ? "Recently updated" : "Hidden for security"}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-medium text-blue-900">Note</p>
                <p className="text-sm text-blue-800 mt-1">
                  If you change your email or password, you may need to sign in again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
