"use client";

import { useEffect, useState, ChangeEvent, ReactNode } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  Pencil,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  Settings,
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
export default function CharityAccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get<Account>("/api/charity/account");
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
      const response = await axios.patch<Account>("/api/charity/account", {
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

      // Update the account state with the response data
      setAccount(response.data);

      // Update the form state to match the updated data
      setForm({
        name: response.data.name,
        email: response.data.email,
        phoneDigits: response.data.phone?.replace("+961", "") ?? "",
        city: response.data.city ?? "",
        address: response.data.address ?? "",
      });

      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!account || !form) return null;

  return (
    <div className="min-h-screen bg-[#f6fbfc] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Charity Account Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your charity's information and preferences.
          </p>
        </div>

        {/* INFO BANNER */}
        <Card className="border border-primary/10 bg-primary/5 rounded-xl">
          <div className="flex gap-4 p-6">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-gray-800">
                Your DawaLocate Charity Account
              </h2>
              <p className="text-sm text-gray-600 mt-1 italic max-w-xl">
                Used to manage campaigns and connect with donors and patients.
              </p>
            </div>
          </div>
        </Card>

        {/* ACCOUNT CARD */}
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg italic text-slate-700">
                    {account.name}
                  </p>
                  <p className="text-sm italic text-slate-500">
                    {account.email}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 rounded-lg"
                onClick={() => setOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info icon={Mail} label="Email" value={account.email} />
              <Info icon={Phone} label="Phone" value={account.phone} />
              <Info icon={MapPin} label="City" value={account.city} />
              <Info icon={MapPin} label="Address" value={account.address} />
            </div>

          </div>
        </Card>
      </div>

      {/* =====================
         EDIT MODAL
      ===================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 shadow-xl">

          {/* REQUIRED FOR ACCESSIBILITY */}
          <VisuallyHidden>
            <DialogTitle>Edit Account</DialogTitle>
          </VisuallyHidden>

          {/* CUSTOM HEADER */}
          <div className="px-6 py-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-800">
                  Edit Charity Information
                </h2>
                <p className="text-sm italic text-gray-600">
                  Make changes carefully, they apply immediately
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-8">

            <Section title="Organization Information" icon={User} color="blue">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField label="Organization Name">
                  <SoftInput name="name" value={form.name} onChange={handleChange} />
                </FormField>

                <FormField label="Email">
                  <SoftInput name="email" value={form.email} onChange={handleChange} />
                </FormField>

                <FormField label="Phone Number">
                  <div className="flex rounded-xl bg-white border border-primary/20 focus-within:ring-2 focus-within:ring-primary/30">
                    <span className="px-4 py-2 text-sm text-primary bg-primary/10 rounded-l-xl">
                      +961
                    </span>
                    <input
                      value={form.phoneDigits}
                      onChange={handlePhoneChange}
                      className="w-full bg-transparent px-3 py-2 outline-none italic text-slate-600"
                      placeholder="8 digits"
                    />
                  </div>
                </FormField>

                <FormField label="City">
                  <SoftInput name="city" value={form.city} onChange={handleChange} />
                </FormField>

                <div className="lg:col-span-2">
                  <FormField label="Address">
                    <SoftInput name="address" value={form.address} onChange={handleChange} />
                  </FormField>
                </div>
              </div>
            </Section>


            <Section title="Security" icon={Lock} color="orange">
              <p className="text-sm italic text-gray-500 mb-4">
                Leave empty if you don't want to change your password
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SoftInput type="password" name="currentPassword" placeholder="Current password" onChange={handleChange} />
                <SoftInput type="password" name="newPassword" placeholder="New password" onChange={handleChange} />
                <div className="lg:col-span-2">
                  <SoftInput type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} />
                </div>
              </div>
            </Section>

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
   UI Helpers
===================== */

function Info({ icon: Icon, label, value }: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-primary text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-1 italic text-slate-600">
        {value || "—"}
      </p>
    </div>
  );
}

function FormField({ label, children }: {
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
        italic text-slate-600
        transition-all duration-300
        hover:border-primary/50
        focus:border-primary
        focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]
        focus:outline-none
      "
    />
  );
}

function Section({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: LucideIcon;
  color: "blue" | "orange";
  children: ReactNode;
}) {
  const styles =
    color === "blue"
      ? "bg-blue-50 border-blue-200 text-primary"
      : "bg-orange-50 border-orange-200 text-orange-600";

  return (
    <div className={`rounded-xl border p-5 ${styles}`}>
      <div className="flex items-center gap-2 mb-4 font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      {children}
    </div>
  );
}
