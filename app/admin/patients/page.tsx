"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  User,
  Mail,
  FileText,
  Plus,
  MapPin,
  Contact,
  ShieldCheck,
  Pencil,
  Trash2,
  Lock,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function PatientsManagementContent() {
  // --- STATE ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // 👇 2. PASTE THIS BLOCK AFTER YOUR STATE

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setNameFilter(query); // 👈 CHANGE THIS from setSearch(query)
    }
  }, [searchParams]);
  // 👆 END OF BLOCK

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
    const matchesName = p.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesEmail = p.email
      .toLowerCase()
      .includes(emailFilter.toLowerCase());
    const matchesCity =
      cityFilter === "" ||
      (p.city || "").toLowerCase().includes(cityFilter.toLowerCase());
    return matchesName && matchesEmail && matchesCity;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <PageTitle>
            Patients Directory
          </PageTitle>
          <p className="text-slate-500 mt-1">
            View and manage registered patients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
            Total: {filteredPatients.length}
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-[#119abf] hover:bg-[#0e8cae] shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Patient
          </Button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center w-full rounded-md border border-slate-200 bg-slate-50 px-3 h-10 ring-offset-white focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            className="flex w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search by Name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>

        <div className="flex items-center w-full rounded-md border border-slate-200 bg-slate-50 px-3 h-10 ring-offset-white focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2">
          <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            className="flex w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search by Email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {LEBANON_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden z-0 relative">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Patient Name</TableHead>
              <TableHead className="font-semibold">Contact Info</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Health Profile</TableHead>
              <TableHead className="font-semibold text-right">
                Joined Date
              </TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {patient.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-700">{patient.email}</span>
                      {patient.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {/* DISPLAY FLAG IN TABLE */}
                          <img
                            src="https://flagcdn.com/w20/lb.png"
                            alt="LB"
                            className="w-4 h-auto object-cover rounded-[2px]"
                          />
                          <span className="text-slate-400 text-xs">
                            +961 {patient.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {patient.city || (
                        <span className="text-slate-400 italic">Unknown</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.healthProfile ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-normal">
                        <FileText className="w-3 h-3 mr-1" /> Profile Active
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-0 font-normal">
                        Pending Setup
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-sm">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => openEditDialog(patient)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(patient.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] sm:min-h-[600px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl flex flex-col">
          <DialogHeader className="bg-[#119abf] p-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              {editingPatient ? (
                <Pencil className="w-6 h-6" />
              ) : (
                <User className="w-6 h-6" />
              )}
              {editingPatient ? "Edit Patient Details" : "Create New Patient"}
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              {editingPatient
                ? "Update the information below."
                : "Enter the details to register a new account."}
            </p>
          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="p-8 grid gap-8 flex-1 overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#119abf]" />
                Account Credentials
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      className="pl-9"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Password{" "}
                    {editingPatient ? (
                      <span className="text-slate-400 font-normal text-xs">
                        (Optional)
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="pl-9"
                      required={!editingPatient}
                      placeholder={
                        editingPatient
                          ? "Leave blank to keep current"
                          : "******"
                      }
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
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
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
                <Contact className="w-4 h-4 text-[#119abf]" />
                Contact Details
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <div className="relative">
                    <select
                      name="city"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.city}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a city</option>
                      {LEBANON_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CUSTOM PHONE INPUT WITH IMAGE FLAG */}
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex h-10 w-full rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2 overflow-hidden">
                    {/* Flag Image + Code */}
                    <div className="flex items-center gap-2 px-3 bg-slate-50 border-r border-slate-200 shrink-0">
                      {/* Use Image to guarantee flag shows on Windows */}
                      <img
                        src="https://flagcdn.com/w40/lb.png"
                        alt="Lebanon Flag"
                        className="w-6 h-4 object-cover rounded-sm shadow-sm"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        +961
                      </span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      className="flex h-full w-full bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="70123456"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={8}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Full Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="address"
                    name="address"
                    className="pl-9"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#119abf] hover:bg-[#0e8cae] px-8"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : editingPatient ? (
                  <Pencil className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingPatient ? "Save Changes" : "Create Account"}
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PatientsManagementContent />
    </Suspense>
  );
}
