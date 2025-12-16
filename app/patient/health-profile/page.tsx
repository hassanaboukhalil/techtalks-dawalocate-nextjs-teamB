"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

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

import { Loader, HeartPulse, UserCircle2, Phone, Droplet, Calendar, Activity, Download } from "lucide-react";

// ----------------------
// MEDICINE TYPE
// ----------------------
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
    dob: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    conditions: "",
    medications: [] as string[],
    contactName: "",
    relationship: "",
    contactNumber: "",
  });

  // Medication search filter
  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------------------
  // LOAD PROFILE + MEDICINES
  // ---------------------------
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

          setFormData({
            fullName: profile.fullName || "",
            dob: profile.dob || "",
            gender: profile.gender || "",
            bloodType: profile.bloodType || "",
            height: profile.height || "",
            weight: profile.weight || "",
            conditions: profile.conditions || "",
            medications: profile.medications
              ? profile.medications.split("\n")
              : [],
            contactName: profile.emergencyName || "",
            relationship: profile.emergencyRelation || "",
            contactNumber: profile.emergencyPhone || "",
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

  // ---------------------------
  // HANDLERS
  // ---------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectMedicine = (med: Medicine) => {
    const item = `${med.name} ${med.strength || ""} (${med.form || ""})`;

    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.includes(item)
        ? prev.medications
        : [...prev.medications, item],
    }));

    setSearch("");
    setShowDropdown(false);
  };

  const removeMedication = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m !== name),
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post("/api/patient/health-profile", {
        ...formData,
        medications: formData.medications.join("\n"),
      });

      setHasProfile(true);
      setOpen(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportQR = async () => {
    if (qrCodeRef.current) {
      try {
        // Dynamically import dom-to-image-more only on client side
        const domtoimage = (await import('dom-to-image-more')).default;
        
        // Wait for fonts and images to load
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const dataUrl = await domtoimage.toPng(qrCodeRef.current, {
          quality: 1,
          bgcolor: '#ffffff',
          width: qrCodeRef.current.offsetWidth * 2,
          height: qrCodeRef.current.offsetHeight * 2,
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
            width: `${qrCodeRef.current.offsetWidth}px`,
            height: `${qrCodeRef.current.offsetHeight}px`,
            border: 'none',
            boxShadow: 'none',
            outline: 'none'
          }
        });
        
        const link = document.createElement("a");
        link.download = `health-card-${formData.fullName.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error exporting health card:", error);
        alert("Failed to export health card. Please try again.");
      }
    }
  };

  // Generate QR code URL (instead of JSON)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrCodeUrl = `${baseUrl}/view-health-profile?` + 
    `name=${encodeURIComponent(formData.fullName)}&` +
    `bloodType=${encodeURIComponent(formData.bloodType)}&` +
    `dob=${encodeURIComponent(formData.dob)}&` +
    `gender=${encodeURIComponent(formData.gender)}&` +
    `emergencyContact=${encodeURIComponent(formData.contactName)}&` +
    `emergencyPhone=${encodeURIComponent(formData.contactNumber)}&` +
    `allergies=${encodeURIComponent(formData.conditions)}&` +
    `medications=${encodeURIComponent(formData.medications.join(", "))}&` +
    `height=${encodeURIComponent(formData.height)}&` +
    `weight=${encodeURIComponent(formData.weight)}`;

  // ---------------------------
  // LOADING SCREEN
  // ---------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader className="w-8 h-8 text-[#119abf] animate-spin" />
      </div>
    );
  }

  // ---------------------------
  // PAGE VIEW
  // ---------------------------
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

        {/* INTRO SECTION TO MAKE PAGE MORE ALIVE */}
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
                  It keeps your medical information up-to-date and ready whenever
                  you need it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MEDICAL INFORMATION SECTION */}
        {hasProfile && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN - Personal Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Full Name</p>
                    <p className="text-base font-semibold text-slate-900">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Date of Birth</p>
                    <p className="text-base font-semibold text-slate-900">
                      {formData.dob ? new Date(formData.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Gender</p>
                    <p className="text-base font-semibold text-slate-900 capitalize">{formData.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Blood Type</p>
                    <p className="text-base font-semibold text-red-600">{formData.bloodType || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 font-medium">Emergency Contact</p>
                    <p className="text-base font-semibold text-slate-900">
                      {formData.contactName && formData.contactNumber 
                        ? `${formData.contactName}${formData.relationship ? ` (${formData.relationship})` : ""} - ${formData.contactNumber}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Medical Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Medical Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Allergies</p>
                    <p className="text-base text-slate-900">{formData.conditions || "None reported"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Medications</p>
                    {formData.medications.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.medications.map((med, idx) => (
                          <li key={idx} className="text-base text-slate-900">{med}</li>
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

        {/* DIALOG BUTTON */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="lg" className="mb-6">
              {hasProfile ? "Edit Profile" : "Create Health Profile"}
            </Button>
          </DialogTrigger>

          {/* DIALOG CONTENT */}
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 rounded-xl shadow-xl border bg-white">
          {/* HEADER */}
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


          {/* FORM */}
          <form onSubmit={handleSave} className="space-y-10 p-8">

            {/* PERSONAL INFO */}
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-medium text-slate-700">Date of Birth</Label>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                 
                 {/*gender */}
                 <div className="space-y-1">
                  <Label className="font-medium text-slate-700">Gender</Label>

                  {/* FIX: Wrapper to bypass dialog overflow clipping */}
                  <div className="overflow-visible relative z-[60]">
                    <Select
                      value={formData.gender}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, gender: val }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        sideOffset={5}
                        className="z-[99999] bg-white"
                      >
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                 </div>


                <div>
                  <Label className="font-medium text-slate-700">Blood Type</Label>
                  <Input
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-medium text-slate-700">Height (cm)</Label>
                  <Input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-medium text-slate-700">Weight (kg)</Label>
                  <Input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="mt-1"
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
                  className="mt-1"
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
                />

                {showDropdown && search && (
                  <ul className="border rounded-lg shadow bg-white max-h-40 overflow-auto">
                    {filteredMedicines.length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-500">No medicines found</li>
                    )}

                    {filteredMedicines.map((med) => (
                      <li
                        key={med.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onMouseDown={() => handleSelectMedicine(med)}
                      >
                        {med.name}
                      </li>
                    ))}
                  </ul>
                )}

                {/* SELECTED MEDICATION TAGS */}
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
                        className="text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

              </div>
            </div>


            {/* EMERGENCY CONTACT */}
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-medium text-slate-700">Relationship</Label>
                  <Input
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-medium text-slate-700">Phone Number</Label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>


            {/* SAVE BUTTON */}
            <Button
              type="submit"
              className="w-full text-white text-lg py-3 rounded-lg bg-[#119abf] hover:bg-[#0e8cae]"
              disabled={saving}
            >
              {saving ? <Loader className="animate-spin h-5 w-5" /> : "Save Profile"}
            </Button>

          </form>
          </DialogContent>

        </Dialog>

        {/* HEALTH CARD - QR CODE SECTION */}
        {hasProfile && (
          <div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Health Card</h2>

            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-8 border-2 border-gray-300 shadow-md max-w-md w-full">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#dc2626" strokeWidth="2" fill="white"/>
                        <path d="M12 7v10M7 12h10" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-teal-800">Emergency Medical Card</h3>
                      <p className="text-xs text-slate-600">Valid until {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">This card contains your essential medical information for emergency situations. Keep it updated and accessible.</p>
                </div>

                <div 
                  ref={qrCodeRef} 
                  className="bg-white p-6 rounded-lg border border-gray-200 mb-6"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '40px 32px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    border: 'none'
                  }}
                >
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    borderSpacing: 0,
                    border: 'none',
                    background: 'transparent'
                  }}>
                    <tbody>
                      <tr style={{ border: 'none', background: 'transparent' }}>
                        <td style={{ 
                          verticalAlign: 'middle',
                          paddingRight: '40px',
                          width: '50%',
                          border: 'none',
                          background: 'transparent'
                        }}>
                          <div style={{ 
                            marginBottom: '16px',
                            border: 'none',
                            background: 'transparent'
                          }}>
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#6b7280', 
                              fontWeight: 'normal', 
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent',
                              marginRight: '8px'
                            }}>
                              Name:
                            </span>
                            <span style={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              color: '#000000',
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent'
                            }}>
                              {formData.fullName}
                            </span>
                          </div>

                          <div style={{ 
                            marginBottom: '16px',
                            border: 'none',
                            background: 'transparent'
                          }}>
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#6b7280', 
                              fontWeight: 'normal', 
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent',
                              marginRight: '8px'
                            }}>
                              Blood type:
                            </span>
                            <span style={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              color: '#dc2626',
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent'
                            }}>
                              {formData.bloodType || "-"}
                            </span>
                          </div>

                          <div style={{ 
                            border: 'none',
                            background: 'transparent'
                          }}>
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#6b7280', 
                              fontWeight: 'normal', 
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent',
                              marginRight: '8px'
                            }}>
                              Gender:
                            </span>
                            <span style={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              color: '#000000',
                              textTransform: 'capitalize',
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              border: 'none',
                              background: 'transparent'
                            }}>
                              {formData.gender || "-"}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          width: '50%',
                          border: 'none',
                          background: 'transparent'
                        }}>
                          <QRCodeCanvas
                            value={qrCodeUrl}
                            size={180}
                            level="H"
                            includeMargin={false}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
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