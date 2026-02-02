"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
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
  Filter,
  Sparkles,
  X,
  Phone
} from "lucide-react";
import { PageTitle } from "@/components/layout/PageTitle";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

          {/*<h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-[#119abf] fill-blue-50" />
            Patients Directory
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Manage your patient cohort, update records, and monitor health profiles.
          </p>
         */}
          <PageTitle>
            Patients Directory
          </PageTitle>
         
          <p className="text-slate-500 mt-1">
            View and manage registered patients.

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
          <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Dialog.Trigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-[#2699B2] hover:bg-[#1f7f94] text-white shadow-lg shadow-[#2699B2]/30 hover:shadow-[#2699B2]/40 transition-all hover:-translate-y-0.5 font-bold px-6"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" /> Add New Patient
              </Button>
            </Dialog.Trigger>

            {/* --- DIALOG MATCHING PHARMACY STYLE --- */}
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-0 overflow-hidden bg-white rounded-3xl shadow-2xl outline-none animate-in zoom-in-95 duration-200">
                
                {/* Header - Teal Gradient */}
                <div className="bg-gradient-to-br from-[#2699B2] to-[#1f8a9e] p-6 text-white relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                        {editingPatient ? <Pencil className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          {editingPatient ? "Edit Patient" : "Add Patient"}
                        </Dialog.Title>
                        <Dialog.Description className="text-white/80 text-sm mt-0.5">
                          {editingPatient ? "Update the patient details below." : "Register a new patient account."}
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all border border-white/20">
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  
                  {/* Section: Account Credentials */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-[#2699B2]" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Credentials</span>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Full Name
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2699B2]/20 focus:border-[#2699B2] transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2699B2]/20 focus:border-[#2699B2] transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Password
                        {editingPatient && (
                          <span className="text-slate-400 text-[10px] font-normal normal-case">(Leave blank to keep current)</span>
                        )}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          required={!editingPatient}
                          placeholder={editingPatient ? "••••••••" : "Create a strong password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2699B2]/20 focus:border-[#2699B2] transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Contact className="w-4 h-4 text-[#2699B2]" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Information</span>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phone Number
                      </Label>
                      <div className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#2699B2]/20 focus-within:border-[#2699B2] focus-within:bg-white overflow-hidden transition-all">
                        <div className="flex items-center gap-2 px-3.5 bg-slate-100 border-r border-slate-200 shrink-0">
                          <img
                            src="https://flagcdn.com/w40/lb.png"
                            alt="Lebanon Flag"
                            className="w-5 h-3.5 object-cover rounded-sm"
                          />
                          <span className="text-sm font-bold text-slate-600">+961</span>
                        </div>
                        <input
                          name="phone"
                          className="flex h-full w-full bg-transparent px-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none"
                          placeholder="70 123 456"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength={8}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right">8 digits exactly</p>
                    </div>

                    {/* City & Address - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          City
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2699B2]/20 focus:border-[#2699B2] transition-all font-medium appearance-none cursor-pointer"
                          >
                            <option value="">Select city</option>
                            {LEBANON_CITIES.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Address
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            name="address"
                            placeholder="Street, Building..."
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2699B2]/20 focus:border-[#2699B2] transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Action Buttons - Fixed at Bottom */}
                <div className="p-6 pt-0 flex gap-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isSaving}
                    onClick={handleSave}
                    className="flex-[2] h-12 rounded-xl bg-[#2699B2] text-white font-bold hover:bg-[#1f7f94] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#2699B2]/30 hover:shadow-[#2699B2]/40"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : editingPatient ? (
                      "Save Changes"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
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