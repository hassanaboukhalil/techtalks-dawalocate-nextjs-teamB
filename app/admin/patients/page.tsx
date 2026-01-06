"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  User,
  Mail,
  Plus,
  MapPin,
  Contact,
  ShieldCheck,
  Pencil,
  Trash2,
  Lock,
  LayoutGrid,
  Filter,
  Sparkles
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LEBANON_CITIES } from "@/constants/lebanon-cities";

// --- TYPES ---
interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  createdAt: string;
  healthProfile: { id: number } | null;
}

// UI Helper for Avatar Initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function PatientsManagementContent() {
  // --- STATE ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setNameFilter(query);
    }
  }, [searchParams]);

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const initialFormState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    address: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA ---
  const fetchPatients = async () => {
    try {
      const res = await axios.get("/api/admin/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- HANDLERS ---
  const openAddDialog = () => {
    setEditingPatient(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      password: "",
      phone: patient.phone || "",
      city: patient.city || "",
      address: patient.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Strict Phone Logic
    if (name === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 8) {
        setFormData({ ...formData, phone: numericValue });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length !== 8) {
      alert("Phone number must be exactly 8 digits.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingPatient) {
        await axios.patch(`/api/admin/patients/${editingPatient.id}`, formData);
        alert("Patient updated successfully!");
      } else {
        await axios.post("/api/admin/patients", formData);
        alert("Patient created successfully!");
      }

      await fetchPatients();
      setIsDialogOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this patient? This cannot be undone."
      )
    )
      return;

    try {
      await axios.delete(`/api/admin/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete patient.");
    }
  };

  // --- FILTERING ---
  const filteredPatients = patients.filter((p) => {
    const matchesName = p.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesEmail = p.email
      .toLowerCase()
      .includes(emailFilter.toLowerCase());
    const matchesCity =
      cityFilter === "" ||
      (p.city || "").toLowerCase().includes(cityFilter.toLowerCase());
    return matchesName && matchesEmail && matchesCity;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-[#119abf] fill-blue-50" />
            Patients Directory
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Manage your patient cohort, update records, and monitor health profiles.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Card className="border-none shadow-none bg-white/60 backdrop-blur-sm">
            <CardContent className="p-2 px-4 flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Patients</span>
              <Badge variant="secondary" className="text-[#119abf] bg-blue-50 text-lg px-3 py-1 font-bold border border-blue-100">
                {filteredPatients.length}
              </Badge>
            </CardContent>
          </Card>
          <Button
            onClick={openAddDialog}
            className="bg-[#119abf] hover:bg-[#0e8cae] text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-semibold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Patient
          </Button>
        </div>
      </div>

      {/* --- FILTERS & SEARCH (COLORFUL) --- */}
      <Card className="border-t-4 border-t-[#119abf] shadow-md bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#119abf]" />
            <CardTitle className="text-base font-bold text-slate-700 uppercase tracking-wide">Filter Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Name Search - BLUE THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Patient Name
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  placeholder="Search by name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-9 border-blue-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-blue-50/30 transition-all font-medium text-blue-900 placeholder:text-blue-400/70"
                />
              </div>
            </div>

            {/* Email Search - PURPLE THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
                <Input
                  placeholder="Search by email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="pl-9 border-purple-200 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 bg-purple-50/30 transition-all font-medium text-purple-900 placeholder:text-purple-400/70"
                />
              </div>
            </div>

            {/* City Filter - EMERALD THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/30 px-3 py-2 pl-9 text-sm font-medium text-emerald-900 ring-offset-white placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer hover:bg-emerald-50/50"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="" className="bg-white">All Cities</option>
                  {LEBANON_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-white">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- DATA TABLE --- */}
      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="h-12 pl-6 w-[280px] font-bold text-xs uppercase tracking-wider text-slate-500">Patient Profile</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Contact</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Location</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-500 pr-6">Registered</TableHead>
                <TableHead className="w-[120px] text-right font-bold text-xs uppercase tracking-wider text-slate-500 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin w-8 h-8 text-[#119abf]" />
                      <p className="text-sm font-medium">Loading records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                         <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium">No patients found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="group hover:bg-slate-50/60 transition-all duration-200 border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="pl-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#119abf] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200">
                          {getInitials(patient.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-[#119abf] transition-colors">
                            {patient.name}
                          </span>
                          <span className="text-xs font-medium text-slate-500">ID: #{patient.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center gap-2">
                            <img
                              src="https://flagcdn.com/w20/lb.png"
                              alt="LB"
                              className="w-4 h-auto object-cover rounded-[2px] shadow-sm"
                            />
                            <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              +961 {patient.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {patient.city || <span className="text-slate-400 italic">Unspecified</span>}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="mt-1">
                        {patient.healthProfile ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold flex w-fit items-center gap-1.5 pl-1.5 pr-2.5 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active Profile
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold flex w-fit items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            Pending Setup
                            </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4 align-top pr-6">
                      <span className="text-sm font-semibold text-slate-500 tabular-nums mt-1 block">
                        {new Date(patient.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </TableCell>

                    {/* ACTIONS - FIXED & ANIMATED */}
                    <TableCell className="text-right py-4 align-top pr-6">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 shadow-sm transition-all active:scale-95"
                          onClick={() => openEditDialog(patient)}
                          title="Edit Patient"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-sm transition-all active:scale-95"
                          onClick={() => handleDelete(patient.id)}
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* --- DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col gap-0">
          
          {/* Dialog Header */}
          <div className="bg-[#119abf] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {editingPatient ? <Pencil className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                {editingPatient ? "Edit Patient Record" : "Register New Patient"}
              </DialogTitle>
              <p className="text-blue-100 mt-2 text-sm opacity-90">
                {editingPatient
                  ? "Update the patient's personal details and contact information below."
                  : "Fill in the required fields to create a new patient account in the system."}
              </p>
            </DialogHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
            <div className="p-8 grid gap-8">
              
              {/* Section 1: Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-[#119abf]" />
                  <h3 className="font-semibold text-slate-900">Account Credentials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-600">Full Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        className="pl-9"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-600">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="pl-9"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password" className="text-slate-600">
                      Password 
                      {editingPatient ? <span className="text-slate-400 text-xs font-normal ml-2">(Optional - Leave blank to keep current)</span> : <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        className="pl-9"
                        required={!editingPatient}
                        placeholder={editingPatient ? "••••••••" : "Create a strong password"}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Contact className="w-5 h-5 text-[#119abf]" />
                  <h3 className="font-semibold text-slate-900">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-600">Phone Number</Label>
                    <div className="flex h-10 w-full rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#119abf]/20 focus-within:border-[#119abf] overflow-hidden transition-all">
                      <div className="flex items-center gap-2 px-3 bg-slate-50 border-r border-slate-200 shrink-0">
                        <img
                          src="https://flagcdn.com/w40/lb.png"
                          alt="Lebanon Flag"
                          className="w-5 h-3.5 object-cover rounded-sm"
                        />
                        <span className="text-sm font-medium text-slate-600">+961</span>
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        className="flex h-full w-full bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none"
                        placeholder="70 123 456"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={8}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">8 digits exactly</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-600">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                      <select
                        name="city"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a city</option>
                        {LEBANON_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-slate-600">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="address"
                        name="address"
                        className="pl-9"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Building, Floor, Street..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#119abf] hover:bg-[#0e8cae] text-white px-8 shadow-md transition-all active:scale-95"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : editingPatient ? (
                  "Save Changes"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PatientsManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#119abf]" />
          <p className="text-slate-500 font-medium animate-pulse">Loading System...</p>
        </div>
      </div>
    }>
      <PatientsManagementContent />
    </Suspense>
  );
}