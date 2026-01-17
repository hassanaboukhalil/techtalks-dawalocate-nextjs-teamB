"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toPng } from 'html-to-image';

import DigitalIdCard from "@/components/patient/DigitalIdCard";

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
import { PageTitle } from "@/components/layout/PageTitle";

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
  Sparkles,
  ShieldPlus,
  Pencil,
  X,
  ChevronRight,
  Pill
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

  // 🆔 NEW STATE FOR ID
  const [profileId, setProfileId] = useState<string | number>("");

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

  const dobDate = useMemo(() => {
    if (!formData.dob) return undefined;
    const d = new Date(formData.dob);
    return isNaN(d.getTime()) ? undefined : d;
  }, [formData.dob]);

  const filteredMedicines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return medicines.filter((m) => {
      const fields = [m.name, m.genericName, m.strength, m.form];
      return fields.filter(Boolean).some((field) => field!.toLowerCase().includes(q));
    });
  }, [search, medicines]);
  
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
          
          // ✅ Capture ID
          if (profile.id) setProfileId(profile.id);

          const rawPhone = String(profile.emergencyPhone ?? "");
          const digitsOnly = rawPhone.replace(/\D/g, "");
          const last8 = digitsOnly.length >= 8 ? digitsOnly.slice(-8) : digitsOnly;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSelectMedicine = (med: Medicine) => {
    const item = `${med.name} ${med.strength ? med.strength : ""} ${med.form ? `(${med.form})` : ""}`.trim();
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
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 200));

      const node = qrCodeRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3, 
        backgroundColor: 'transparent',
        style: { margin: '0', padding: '0' }
      });

      const link = document.createElement("a");
      link.download = `dawalocate-id-${(formData.fullName || "patient").replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting health card:", error);
      alert("Failed to export health card. Please try again.");
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrCodeUrl =
    `${baseUrl}/view-health-profile?` +
    `name=${encodeURIComponent(formData.fullName)}&` +
    `bloodType=${encodeURIComponent(formData.bloodType)}&` +
    `dob=${encodeURIComponent(formData.dob)}&` +
    `gender=${encodeURIComponent(formData.gender)}&` +
    `emergencyContact=${encodeURIComponent(formData.contactName)}&` +
    `emergencyPhone=${encodeURIComponent(formData.contactNumber ? `+961${formData.contactNumber}` : "")}&` +
    `allergies=${encodeURIComponent(formData.conditions)}&` +
    `medications=${encodeURIComponent(formData.medications.join(", "))}&` +
    `height=${encodeURIComponent(formData.height)}&` +
    `weight=${encodeURIComponent(formData.weight)}`;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><Loader className="w-8 h-8 text-[#119abf] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-[1300px]">
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <PageTitle>Health Profile</PageTitle>
            <p className="text-slate-500 mt-1">Manage your personal medical record and emergency ID.</p>
          </div>
          
          {hasProfile && (
            <Button 
              onClick={() => setOpen(true)} 
              className="bg-[#119abf] hover:bg-[#0e8cae] text-white px-8 h-12 rounded-xl shadow-lg shadow-cyan-500/20 font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
               <Pencil className="w-5 h-5" /> Edit Profile
            </Button>
          )}
        </div>

        {/* INTRO */}
        {!hasProfile && (
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-100/20 text-center max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-[#119abf] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 rotate-3 transition-transform hover:rotate-6"><Sparkles className="w-10 h-10 text-white" /></div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Initialize Your Secure Health ID</h2>
                <p className="text-slate-600 text-lg max-w-lg mx-auto mb-8 leading-relaxed">Create a scannable professional profile.</p>
                <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-[#119abf] to-[#0e8cae] hover:from-[#0e8cae] hover:to-[#0b7a96] text-white px-10 py-7 text-lg rounded-full shadow-xl shadow-cyan-500/30 font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"><ShieldPlus className="w-5 h-5" /> Create Professional Profile</Button>
            </div>
          </div>
        )}

        {/* CONTENT GRID */}
        {hasProfile && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: DETAILS */}
            <div className="xl:col-span-7 space-y-6 w-full order-2 xl:order-1">
              {/* Personal Info Card */}
              <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                     <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><UserCircle2 className="w-6 h-6" /></div> 
                     Personal Details
                   </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8 mb-8">
                   <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Full Name</p><p className="text-xl text-slate-900 font-bold">{formData.fullName || "-"}</p></div>
                   <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Date of Birth</p><p className="text-xl text-slate-900 font-bold">{dobDate ? dobDate.toLocaleDateString() : "-"}</p></div>
                   <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Gender</p><p className="text-xl text-slate-900 font-bold capitalize">{formData.gender || "-"}</p></div>
                   <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Blood Type</p><p className="text-3xl font-black text-red-600">{formData.bloodType || "-"}</p></div>
                   <div className="sm:col-span-2 pt-6 mt-2 border-t border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Emergency Contact</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="flex-1"><span className="text-slate-900 font-bold text-lg block">{formData.contactName || "Not Set"}</span><span className="text-sm text-slate-500 font-medium">{formData.relationship || ""}</span></div>
                         {formData.contactNumber && <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 font-mono text-slate-700 font-bold shadow-sm text-lg">+961 {formData.contactNumber}</div>}
                      </div>
                   </div>
                </div>
              </div>

              {/* Medical Data Card */}
              <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><Activity className="w-6 h-6" /></div> 
                  Medical Data
                </h3>
                <div className="space-y-8">
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Known Allergies / Conditions</p>
                      <div className="bg-amber-50 text-amber-900 p-5 rounded-2xl border border-amber-100 text-base leading-relaxed font-medium shadow-sm">
                        {formData.conditions || "No known allergies or conditions reported."}
                      </div>
                   </div>
                   <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Current Medications</p>
                      {formData.medications.length > 0 ? (
                        <div className="flex flex-wrap gap-2.5">
                          {formData.medications.map((m, i) => (
                            <span key={i} className="bg-slate-100 text-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 flex items-center gap-2">
                              <HeartPulse className="w-4 h-4 text-red-500" /> {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic font-medium pl-2 border-l-2 border-slate-200">No active medications listed.</p>
                      )}
                   </div>
                   {(formData.height || formData.weight) && (
                     <div className="flex gap-12 pt-6 border-t border-dashed border-slate-200">
                        {formData.height && (
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Height</p>
                            <p className="text-2xl font-black text-slate-900">{formData.height} <span className="text-sm font-bold text-slate-500">cm</span></p>
                          </div>
                        )}
                        {formData.weight && (
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Weight</p>
                            <p className="text-2xl font-black text-slate-900">{formData.weight} <span className="text-sm font-bold text-slate-500">kg</span></p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* RIGHT: CARD */}
            <div className="xl:col-span-5 flex flex-col items-center xl:items-start pt-2 order-1 xl:order-2 mb-8 xl:mb-0">
               <div className="sticky top-8 w-full flex flex-col items-center">
               <div className="w-full flex justify-center">
                  <div className="w-full max-w-[340px] sm:max-w-[380px]">
                    <DigitalIdCard
                      ref={qrCodeRef}
                      fullName={formData.fullName}
                      bloodType={formData.bloodType}
                      gender={formData.gender}
                      dob={dobDate ? dobDate.toLocaleDateString() : undefined}
                      qrCodeUrl={qrCodeUrl}
                      profileId={profileId}
                    />
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 text-center w-full max-w-[300px] sm:max-w-[340px]">

                    <Button 
                      onClick={handleExportQR} 
                      className="w-full bg-[#0F172A] hover:bg-slate-800 text-white h-14 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 text-lg group"
                    >
                       <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> Save to Photos
                    </Button>
                    <p className="text-xs text-slate-500 mt-4 px-4 leading-relaxed font-medium">
                      Keep this image on your phone. First responders can scan it to see your medical details.
                    </p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* DIALOG FORM */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-0">
             
             {/* PROFESSIONAL DIALOG HEADER */}
             <div className="px-8 py-6 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
              <DialogHeader>
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-[#119abf]/10 flex items-center justify-center border border-[#119abf]/20 shadow-sm shrink-0">
                    <Pencil className="w-6 h-6 text-[#119abf]" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Edit Health Profile</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm font-medium">Update your medical details & emergency contacts.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-10">
              {/* Form content remains the same... */}
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Full Name</Label><Input name="fullName" value={formData.fullName} onChange={handleChange} className="bg-white focus:ring-2 focus:ring-[#119abf] border-slate-200 h-11" /></div>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Date of Birth</Label><DatePicker value={dobDate} onChange={(d) => setFormData((p) => ({ ...p, dob: d ? format(d, "yyyy-MM-dd") : "" }))} fromYear={1900} toYear={new Date().getFullYear()} /></div>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Gender</Label><Select value={formData.gender} onValueChange={(val) => setFormData((p) => ({ ...p, gender: val }))}><SelectTrigger className="h-11 bg-white border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Blood Type</Label><Select value={formData.bloodType} onValueChange={(val) => setFormData((p) => ({ ...p, bloodType: val }))}><SelectTrigger className="h-11 bg-white border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Height (cm)</Label><Input type="number" name="height" value={formData.height} onChange={handleChange} className="bg-white h-11 border-slate-200" /></div>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Weight (kg)</Label><Input type="number" name="weight" value={formData.weight} onChange={handleChange} className="bg-white h-11 border-slate-200" /></div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100"><Activity className="w-5 h-5 text-green-600" /> Medical History</h2>
                  <div className="space-y-1"><Label className="font-semibold text-slate-700">Conditions & Allergies</Label><Textarea name="conditions" value={formData.conditions} onChange={handleChange} rows={3} className="resize-none bg-white border-slate-200 focus:ring-2 focus:ring-green-500" placeholder="e.g., Peanut Allergy, Asthma..." /></div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100"><HeartPulse className="w-5 h-5 text-red-600" /> Medications</h2>
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <Label className="font-semibold text-slate-700">Add Medication</Label>
                    <Input 
                      placeholder="Search medicines (e.g. Panadol)..." 
                      value={search} 
                      onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }} 
                      className="bg-white h-12 border-slate-200 focus:ring-2 focus:ring-red-500 shadow-sm" 
                    />
                    
                    {showDropdown && search && (
                      <ul className="border rounded-xl shadow-xl bg-white max-h-56 overflow-auto z-50 relative divide-y divide-slate-100">
                        {filteredMedicines.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-gray-500 italic">No matching medicines found.</li>
                        ) : (
                          filteredMedicines.map((med) => (
                            <li 
                              key={med.id} 
                              className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors group" 
                              onMouseDown={() => handleSelectMedicine(med)}
                            >
                              <div className="font-bold text-slate-800 group-hover:text-red-700">{med.name}</div>
                              <div className="text-xs text-slate-500 flex gap-2">
                                <span>{med.strength}</span>
                                <span className="text-slate-300">•</span>
                                <span className="italic">{med.form}</span>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.medications.map((m, idx) => (
                        <span key={idx} className="bg-white text-slate-700 pl-3 pr-1 py-1.5 rounded-full text-sm font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                          <Pill className="w-4 h-4 text-red-500" /> {m} 
                          <button type="button" onClick={() => removeMedication(m)} className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X className="w-4 h-4"/></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100"><Phone className="w-5 h-5 text-purple-600" /> Emergency Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <div className="space-y-1"><Label className="font-semibold text-slate-700">Name</Label><Input name="contactName" value={formData.contactName} onChange={handleChange} className="bg-white border-purple-200 focus:ring-2 focus:ring-purple-500 h-11" /></div>
                    <div className="space-y-1"><Label className="font-semibold text-slate-700">Relationship</Label><Input name="relationship" value={formData.relationship} onChange={handleChange} className="bg-white border-purple-200 focus:ring-2 focus:ring-purple-500 h-11" placeholder="e.g., Spouse" /></div>
                    <div className="space-y-1"><Label className="font-semibold text-slate-700">Phone</Label><div className="flex items-center gap-2"><div className="h-11 px-3 border border-purple-200 bg-white text-slate-600 font-bold rounded-md flex items-center text-sm select-none">+961</div><Input name="contactNumber" value={formData.contactNumber} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 8); setFormData((p) => ({ ...p, contactNumber: d })); }} placeholder="70123456" className="bg-white border-purple-200 focus:ring-2 focus:ring-purple-500 h-11 font-mono font-bold" /></div></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <Button type="submit" className="w-full bg-[#119abf] hover:bg-[#0e8cae] text-white h-14 text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]" disabled={saving}>
                      {saving ? <Loader className="animate-spin h-6 w-6" /> : "Save Changes"}
                    </Button>
                </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}