"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";


import { DatePicker } from "@/components/ui/date-picker";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Loader,
  HeartPulse,
  UserCircle2,
  Phone,
  Activity,
  Download,
} from "lucide-react";

/* ======================
   TYPES
====================== */
interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength?: string;
  form?: string;
}

export default function HealthProfilePage() {
  const [open, setOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "", // YYYY-MM-DD
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    conditions: "",
    medications: [] as string[],
    contactName: "",
    relationship: "",
    contactNumber: "", // digits only (8)
  });

  /* ======================
     Derived DOB (Date)
  ====================== */
  const dobDate = useMemo(() => {
    if (!formData.dob) return undefined;
    const d = new Date(formData.dob);
    return isNaN(d.getTime()) ? undefined : d;
  }, [formData.dob]);

  /* ======================
     MED FILTER
  ====================== */
  const filteredMedicines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
  
    return medicines.filter((m) => {
      const fields = [
        m.name,
        m.genericName,
        m.strength,
        m.form,
      ];
  
      return fields
        .filter(Boolean)
        .some((field) =>
          field!.toLowerCase().includes(q)
        );
    });
  }, [search, medicines]);
  
  
  
  
  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, medsRes] = await Promise.all([
          axios.get("/api/patient/health-profile", { withCredentials: true }),
          axios.get("/api/global"),
        ]);

        const profile = profileRes.data;

        if (profile && Object.keys(profile).length > 0) {
          setHasProfile(true);

          // Normalize phone (API might return "+96170123456" or "70123456")
          const rawPhone = String(profile.emergencyPhone ?? "");
          const digitsOnly = rawPhone.replace(/\D/g, "");
          const last8 =
            digitsOnly.length >= 8 ? digitsOnly.slice(-8) : digitsOnly;

          setFormData({
            fullName: profile.fullName ?? "",
            dob: profile.dob ?? "",
            gender: profile.gender ?? "",
            bloodType: profile.bloodType ?? "",
            height: profile.height ?? "",
            weight: profile.weight ?? "",
            conditions: profile.conditions ?? "",
            medications: profile.medications ? profile.medications.split("\n") : [],
            contactName: profile.emergencyName ?? "",
            relationship: profile.emergencyRelation ?? "",
            contactNumber: last8 ?? "",
          });
        } else {
          setHasProfile(false);
        }

        if (medsRes.data?.success) {
          setMedicines(medsRes.data.data);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ======================
     HANDLERS
  ====================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSelectMedicine = (med: Medicine) => {
    const item = `${med.name}${med.strength ? ` ${med.strength}` : ""}${
      med.form ? ` (${med.form})` : ""
    }`;

    setFormData((p) => ({
      ...p,
      medications: p.medications.includes(item) ? p.medications : [...p.medications, item],
    }));

    setSearch("");
    setShowDropdown(false);
  };

  const removeMedication = (name: string) => {
    setFormData((p) => ({
      ...p,
      medications: p.medications.filter((m) => m !== name),
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Send both your form fields + backend-friendly emergency fields (prevents “info lost”)
      const payload = {
        ...formData,
        medications: formData.medications.join("\n"),

        emergencyName: formData.contactName,
        emergencyRelation: formData.relationship,
        emergencyPhone: formData.contactNumber ? `+961${formData.contactNumber}` : "",
      };

      await axios.post("/api/patient/health-profile", payload, { withCredentials: true });

      setHasProfile(true);
      setOpen(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportQR = async () => {
    if (!qrCodeRef.current) return;

    try {
      const domtoimage = (await import("dom-to-image-more")).default;

      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 200));

      const node = qrCodeRef.current;
      const dataUrl = await domtoimage.toPng(node, {
        quality: 1,
        bgcolor: "#ffffff",
        width: node.offsetWidth * 2,
        height: node.offsetHeight * 2,
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
          width: `${node.offsetWidth}px`,
          height: `${node.offsetHeight}px`,
          border: "none",
          boxShadow: "none",
          outline: "none",
        },
      });

      const link = document.createElement("a");
      link.download = `health-card-${(formData.fullName || "user")
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting health card:", error);
      alert("Failed to export health card. Please try again.");
    }
  };

  /* ======================
     QR URL
  ====================== */
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrCodeUrl =
    `${baseUrl}/view-health-profile?` +
    `name=${encodeURIComponent(formData.fullName)}&` +
    `bloodType=${encodeURIComponent(formData.bloodType)}&` +
    `dob=${encodeURIComponent(formData.dob)}&` +
    `gender=${encodeURIComponent(formData.gender)}&` +
    `emergencyContact=${encodeURIComponent(formData.contactName)}&` +
    `emergencyPhone=${encodeURIComponent(
      formData.contactNumber ? `+961${formData.contactNumber}` : ""
    )}&` +
    `allergies=${encodeURIComponent(formData.conditions)}&` +
    `medications=${encodeURIComponent(formData.medications.join(", "))}&` +
    `height=${encodeURIComponent(formData.height)}&` +
    `weight=${encodeURIComponent(formData.weight)}`;

  /* ======================
     LOADING
  ====================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader className="w-8 h-8 text-[#119abf] animate-spin" />
      </div>
    );
  }

  /* ======================
     PAGE
  ====================== */
  return (
    <div className="min-h-screen bg-white flex justify-center py-16 px-4">
      <div className="w-full max-w-[1100px]">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Health Profile</h1>
          <p className="text-slate-600 text-lg">
            Your personal medical record always accessible and secure.
          </p>
        </div>

        {/* INTRO */}
        {!hasProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 shadow-sm mb-10">
            <div className="flex items-start gap-6">
              <HeartPulse className="w-12 h-12 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2">
                  Build Your Health Profile
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  A health profile helps doctors quickly understand your medical
                  background, medications, allergies, and emergency contacts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {hasProfile && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PERSONAL */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Full Name</p>
                    <p className="text-base font-semibold text-slate-900">
                      {formData.fullName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-medium">Date of Birth</p>
                    <p className="text-base font-semibold text-slate-900">
                      {dobDate ? dobDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-medium">Gender</p>
                    <p className="text-base font-semibold text-slate-900 capitalize">
                      {formData.gender || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-medium">Blood Type</p>
                    <p className="text-base font-semibold text-red-600">
                      {formData.bloodType || "-"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 font-medium">Emergency Contact</p>
                    <p className="text-base font-semibold text-slate-900">
                      {formData.contactName && formData.contactNumber
                        ? `${formData.contactName}${formData.relationship ? ` (${formData.relationship})` : ""} - +961${formData.contactNumber}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MEDICAL */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Medical Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Allergies</p>
                    <p className="text-base text-slate-900">
                      {formData.conditions || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Medications</p>
                    {formData.medications.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.medications.map((m, idx) => (
                          <li key={idx} className="text-base text-slate-900">
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-base text-slate-900">None reported</p>
                    )}
                  </div>

                  {(formData.height || formData.weight) && (
                    <div className="flex gap-6">
                      {formData.height && (
                        <div>
                          <p className="text-sm text-slate-500 font-medium">Height</p>
                          <p className="text-base text-slate-900">{formData.height} cm</p>
                        </div>
                      )}
                      {formData.weight && (
                        <div>
                          <p className="text-sm text-slate-500 font-medium">Weight</p>
                          <p className="text-base text-slate-900">{formData.weight} kg</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT/CREATE DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="lg" className="mb-6">
              {hasProfile ? "Edit Profile" : "Create Health Profile"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 rounded-xl shadow-xl border bg-white">
            <div className="px-8 py-6 border-b bg-gray-50 rounded-t-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {hasProfile ? "Edit Your Health Profile" : "Create Your Health Profile"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  Fill in your personal and medical details. These will help doctors better understand your needs.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSave} className="space-y-10 p-8">
              {/* PERSONAL */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border">
                  <div>
                    <Label className="font-medium text-slate-700">Full Name</Label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                    />
                  </div>

                  {/* ✅ REPLACED CALENDAR (reusable + dropdown month/year) */}
                  <div>
                    <Label className="font-medium text-slate-700">Date of Birth</Label>
                    <DatePicker
                      value={dobDate}
                      onChange={(d) => {
                        setFormData((p) => ({
                          ...p,
                          dob: d ? format(d, "yyyy-MM-dd") : "",
                        }));
                      }}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />


                  </div>

                  <div className="space-y-1">
                    <Label className="font-medium text-slate-700">Gender</Label>
                    <div className="overflow-visible relative z-[60]">
                      <Select
                        value={formData.gender}
                        onValueChange={(val) => setFormData((p) => ({ ...p, gender: val }))}
                      >
                        <SelectTrigger className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={5} className="z-[99999] bg-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-medium text-slate-700">Blood Type</Label>
                    <div className="overflow-visible relative z-[60]">
                      <Select
                        value={formData.bloodType}
                        onValueChange={(val) => setFormData((p) => ({ ...p, bloodType: val }))}
                      >
                        <SelectTrigger className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]">
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={5} className="z-[99999] bg-white">
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-slate-700">Height (cm)</Label>
                    <Input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                    />
                  </div>

                  <div>
                    <Label className="font-medium text-slate-700">Weight (kg)</Label>
                    <Input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                    />
                  </div>
                </div>
              </div>

              {/* CONDITIONS */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Medical Conditions
                </h2>

                <div className="bg-gray-50 p-5 rounded-xl border">
                  <Label className="font-medium text-slate-700">Conditions</Label>
                  <Textarea
                    name="conditions"
                    value={formData.conditions}
                    onChange={handleChange}
                    className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/30 focus-visible:border-[#119abf]"
                    rows={4}
                  />
                </div>
              </div>

              {/* MEDICATIONS */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                  Current Medications
                </h2>

                <div className="bg-gray-50 p-5 rounded-xl border space-y-4">
                  <Input
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                  />

                  {showDropdown && search && (
                    <ul className="border rounded-lg shadow bg-white max-h-40 overflow-auto">
                      {filteredMedicines.length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-500">
                          No medicines found
                        </li>
                      )}

                      {filteredMedicines.map((med) => (
                        <li
                          key={med.id}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm transition-colors"
                          onMouseDown={() => handleSelectMedicine(med)}
                        >
                          <span className="font-medium text-slate-900">{med.name}</span>
                          {(med.strength || med.form) && (
                            <span className="text-slate-500">
                              {" "}
                              — {med.strength || ""} {med.form ? `(${med.form})` : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {formData.medications.map((m, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {m}
                        <button
                          type="button"
                          onClick={() => removeMedication(m)}
                          className="text-red-500 font-bold hover:scale-110 transition-transform"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* EMERGENCY */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Emergency Contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-xl border">
                  <div>
                    <Label className="font-medium text-slate-700">Name</Label>
                    <Input
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                    />
                  </div>

                  <div>
                    <Label className="font-medium text-slate-700">Relationship</Label>
                    <Input
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="mt-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                    />
                  </div>

                  <div>
                    <Label className="font-medium text-slate-700">Phone Number</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-10 px-3 rounded-md border bg-white text-slate-600 flex items-center text-sm select-none">
                        +961
                      </div>

                      <Input
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 8);
                          setFormData((p) => ({ ...p, contactNumber: onlyDigits }));
                        }}
                        placeholder="e.g. 70123456"
                        inputMode="numeric"
                        className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#119abf]/40 focus-visible:border-[#119abf]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white text-lg py-3 rounded-lg bg-[#119abf] hover:bg-[#0e8cae] transition-all"
                disabled={saving}
              >
                {saving ? <Loader className="animate-spin h-5 w-5" /> : "Save Profile"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* HEALTH CARD */}
        {hasProfile && (
          <div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Health Card</h2>

            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-8 border-2 border-gray-300 shadow-md max-w-md w-full">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-700">
                    This card contains essential medical information for emergencies.
                  </p>
                </div>

                <div
                  ref={qrCodeRef}
                  className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
                  style={{ backgroundColor: "#ffffff", border: "none" }}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="mb-3">
                        <div className="text-xs text-slate-500">Name</div>
                        <div className="text-lg font-bold text-slate-900">
                          {formData.fullName || "-"}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs text-slate-500">Blood type</div>
                        <div className="text-lg font-bold text-red-600">
                          {formData.bloodType || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Gender</div>
                        <div className="text-lg font-bold text-slate-900 capitalize">
                          {formData.gender || "-"}
                        </div>
                      </div>
                    </div>

                    <QRCodeCanvas value={qrCodeUrl} size={170} level="H" includeMargin={false} />
                  </div>
                </div>

                <Button
                  onClick={handleExportQR}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-3 text-base"
                >
                  <Download size={18} />
                  Export QR Code
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
