"use client";

import { useEffect, useState, ChangeEvent, ReactNode } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Pencil,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

/* =====================
   Types
===================== */
interface Account {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
}

interface FormState {
  name: string;
  email: string;
  phoneDigits: string;
  city: string;
  address: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/* =====================
   Page
===================== */
export default function PatientAccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get<Account>("/api/patient/account");
      setAccount(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        phoneDigits: res.data.phone?.replace("+961", "") ?? "",
        city: res.data.city ?? "",
        address: res.data.address ?? "",
      });
    };
    load();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 8) {
      setForm({ ...form, phoneDigits: digits });
    }
  };

  const handleSave = async () => {
    if (!form) return;

    if (form.phoneDigits.length !== 8) {
      alert("Phone number must be exactly 8 digits");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await axios.patch("/api/patient/account", {
        name: form.name,
        email: form.email,
        phone: `+961${form.phoneDigits}`,
        city: form.city,
        address: form.address,
        ...(form.newPassword && {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!account || !form) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6fbfc] to-[#eef6f8] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your DawaLocate account securely
          </p>
        </div>

        {/* INFO */}
        <Card className="bg-primary/5 border-primary/10 p-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Your DawaLocate Account</h2>
              <p className="text-sm text-gray-600">
                Your account helps personalize medicine availability, manage
                requests, and protect your health-related data.
              </p>
            </div>
          </div>
        </Card>

        {/* STATUS */}
        {/*<div className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            Your information is up to date
          </div>
        </div>*/}

        {/* ACCOUNT CARD */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-gray-500">{account.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Account
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info icon={Mail} label="Email" value={account.email} />
            <Info icon={Phone} label="Phone" value={account.phone} />
            <Info icon={MapPin} label="City" value={account.city} />
            <Info icon={MapPin} label="Address" value={account.address} />
          </div>
        </Card>
      </div>

      {/* =====================
         EDIT MODAL
      ===================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">

          {/* HEADER */}
          <div className="px-6 py-5 border-b bg-primary/5">
            <DialogTitle className="text-xl font-semibold">
              Edit Account
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Update your information safely — changes apply immediately
            </DialogDescription>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-8">

            {/* PERSONAL INFO */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
              <div className="flex items-center gap-2 mb-4 font-medium">
                <User className="h-4 w-4 text-primary" />
                Personal Information
              </div>

              {/* RESPONSIVE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                <FormField label="Full Name">
                  <SoftInput name="name" value={form.name} onChange={handleChange} />
                </FormField>

                <FormField label="Email">
                  <SoftInput name="email" value={form.email} onChange={handleChange} />
                </FormField>

                <FormField label="Phone Number">
                  <div className="flex rounded-xl bg-white border border-primary/20 focus-within:ring-2 focus-within:ring-primary/30">
                    <span className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-l-xl">
                      +961
                    </span>
                    <input
                      value={form.phoneDigits}
                      onChange={handlePhoneChange}
                      placeholder="8 digits"
                      inputMode="numeric"
                      className="w-full bg-transparent px-3 py-2 outline-none"
                    />
                  </div>
                </FormField>

                <FormField label="City">
                  <SoftInput name="city" value={form.city} onChange={handleChange} />
                </FormField>

                {/* FULL WIDTH */}
                <div className="lg:col-span-2">
                  <FormField label="Address">
                    <SoftInput name="address" value={form.address} onChange={handleChange} />
                  </FormField>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-5">
              <div className="flex items-center gap-2 mb-2 font-medium">
                <Lock className="h-4 w-4 text-orange-600" />
                Security
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Leave empty if you don’t want to change your password
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SoftInput
                  type="password"
                  name="currentPassword"
                  placeholder="Current password"
                  onChange={handleChange}
                />
                <SoftInput
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  onChange={handleChange}
                />
                <div className="lg:col-span-2">
                  <SoftInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================
   Helpers
===================== */

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-1 font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm text-gray-600">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SoftInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="
        rounded-xl
        bg-white
        border border-gray-300
        text-gray-900

        transition-all duration-300 ease-out

        ring-0 ring-offset-0
        focus:ring-0 focus:ring-offset-0
        focus-visible:ring-0 focus-visible:ring-offset-0

        hover:border-primary/50

        focus:border-primary
        focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]
        focus:outline-none

        focus-visible:border-primary
        focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]
        focus-visible:outline-none
      "
    />
  );
}

