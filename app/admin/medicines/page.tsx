"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Filter,
  Eye,
  Pill,
  Droplet,
  SprayCan,
  Layers,
  Check,
  Package,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { PageTitle } from "@/components/layout/PageTitle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ================= TYPES ================= */
interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  description?: string;
}

/* ================= CONSTANTS ================= */
const FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Cream",
  "Eye Drops",
  "Inhaler",
  "Gel",
  "Ointment",
  "Suspension",
];

const STRENGTH_UNITS = ["mg", "mcg", "%", "ml", "mg/ml"] as const;

/* ================= HELPERS ================= */
const normalizeForm = (v?: string) => (v ? v.trim().toLowerCase() : "");
const formatFormLabel = (v?: string) =>
  v ? v.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const splitStrength = (strength: string) => {
  const s = (strength || "").trim();
  if (!s) return { value: "", unit: "mg" };
  const m = s.match(/^([\d.]+)\s*([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)$/);
  if (!m) return { value: s.replace(/[^\d.]/g, ""), unit: s.replace(/[\d.\s]/g, "") || "mg" };
  return { value: m[1], unit: m[2] };
};

const FORM_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Tablet: { bg: "bg-blue-100", text: "text-blue-700", icon: <Pill className="w-4 h-4" /> },
  Capsule: { bg: "bg-indigo-100", text: "text-indigo-700", icon: <Pill className="w-4 h-4 rotate-90" /> },
  Syrup: { bg: "bg-purple-100", text: "text-purple-700", icon: <Droplet className="w-4 h-4" /> },
  Cream: { bg: "bg-pink-100", text: "text-pink-700", icon: <Layers className="w-4 h-4" /> },
  "Eye Drops": { bg: "bg-emerald-100", text: "text-emerald-700", icon: <Eye className="w-4 h-4" /> },
  Inhaler: { bg: "bg-orange-100", text: "text-orange-700", icon: <SprayCan className="w-4 h-4" /> },
  Gel: { bg: "bg-cyan-100", text: "text-cyan-700", icon: <Layers className="w-4 h-4" /> },
  Ointment: { bg: "bg-rose-100", text: "text-rose-700", icon: <Layers className="w-4 h-4" /> },
  Suspension: { bg: "bg-slate-100", text: "text-slate-700", icon: <Droplet className="w-4 h-4" /> },
  Default: { bg: "bg-slate-100", text: "text-slate-700", icon: <Pill className="w-4 h-4" /> },
};

/* ================= PAGE ================= */
function MedicinesManagementContent() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  /* Filters */
  const [search, setSearch] = useState("");
  const [genericFilter, setGenericFilter] = useState("ALL");
  const [formFilter, setFormFilter] = useState("ALL");

  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearch(query);
    }
  }, [searchParams]);

  /* Dialog */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);

  /* Form State */
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    strengthValue: "",
    strengthUnit: "mg",
    form: "",
    description: "",
  });

  /* ================= DATA ================= */
  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/admin/medicines");
      setMedicines(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  /* ================= FILTER OPTIONS ================= */
  const genericOptions = useMemo(() => {
    return Array.from(
      new Set(
        medicines
          .map((m) => m.genericName?.trim())
          .filter((g): g is string => !!g)
      )
    ).sort();
  }, [medicines]);
  

  const formOptions = useMemo(() => {
    const map = new Map<string, string>();
  
    medicines.forEach((m) => {
      if (!m.form) return; 
  
      const normalized = normalizeForm(m.form);
      if (!normalized) return; 
  
      if (!map.has(normalized)) {
        map.set(normalized, formatFormLabel(m.form));
      }
    });
  
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [medicines]);
  

  /* ================= FILTERING ================= */
  const filteredMedicines = useMemo(() => {
    const q = search.toLowerCase().trim();

    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        (m.genericName || "").toLowerCase().includes(q) ||
        (m.strength || "").toLowerCase().includes(q) ||
        (m.form || "").toLowerCase().includes(q);

      const matchesGeneric = genericFilter === "ALL" || m.genericName === genericFilter;
      const matchesForm = formFilter === "ALL" || normalizeForm(m.form) === formFilter;

      return matchesSearch && matchesGeneric && matchesForm;
    });
  }, [medicines, search, genericFilter, formFilter]);

  const activeFormStyle =
    FORM_STYLES[formatFormLabel(formFilter)] || FORM_STYLES.Default;

  /* ================= HANDLERS ================= */
  const openAdd = () => {
    setEditing(null);
    setFormData({
      name: "",
      genericName: "",
      strengthValue: "",
      strengthUnit: "mg",
      form: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (med: Medicine) => {
    const s = splitStrength(med.strength || "");
    setEditing(med);
    setFormData({
      name: med.name || "",
      genericName: med.genericName || "",
      strengthValue: s.value,
      strengthUnit: (STRENGTH_UNITS as readonly string[]).includes(s.unit) ? s.unit : "mg",
      form: formatFormLabel(med.form || ""),
      description: med.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cleanForm = formatFormLabel(formData.form);
    const strength = formData.strengthValue
      ? `${formData.strengthValue}${formData.strengthUnit}`
      : "";

    const payload = {
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      strength,
      form: cleanForm,
      description: formData.description.trim(),
    };

    try {
      if (editing) {
        await axios.patch(`/api/admin/medicines/${editing.id}`, payload);
      } else {
        await axios.post("/api/admin/medicines", payload);
      }
      await fetchMedicines();
      setDialogOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        alert("⚠️ This medicine already exists.");
      } else {
        alert("Failed to save medicine.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this medicine permanently?")) return;
    await axios.delete(`/api/admin/medicines/${id}`);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>

         {/* <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-[#119abf] fill-blue-50" />
            Medicines Inventory
          </h1> 
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Manage your pharmaceutical database and product details.
          </p>
          */}

          
          <PageTitle>Medicines Inventory</PageTitle>
        
          <p className="text-slate-500 mt-1">Structured, searchable medicine catalog.</p>
          <div className="mt-2 text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{filteredMedicines.length}</span>
          </div>

        </div>

        <div className="flex items-center gap-4">
          <Card className="border-none shadow-none bg-white/60 backdrop-blur-sm">
            <CardContent className="p-2 px-4 flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Items</span>
              <Badge variant="secondary" className="text-[#119abf] bg-blue-50 text-lg px-3 py-1 font-bold border border-blue-100">
                {filteredMedicines.length}
              </Badge>
            </CardContent>
          </Card>
          <Button 
            onClick={openAdd} 
            className="bg-[#119abf] hover:bg-[#0e8cae] text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-semibold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Medicine
          </Button>
        </div>
      </div>

      {/* FILTERS CARD (COLORFUL) */}
      <Card className="border-t-4 border-t-[#119abf] shadow-md bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#119abf]" />
            <CardTitle className="text-base font-bold text-slate-700 uppercase tracking-wide">Filter Inventory</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Search Input - BLUE THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-3.5 h-3.5" /> Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  placeholder="Name, generic, strength..."
                  className="pl-9 border-blue-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-blue-50/30 transition-all font-medium text-blue-900 placeholder:text-blue-400/70"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Generic Filter - PURPLE THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-3.5 h-3.5" /> Generic Name
              </Label>
              <Select value={genericFilter} onValueChange={setGenericFilter}>
                <SelectTrigger className="w-full border-purple-200 bg-purple-50/30 text-purple-900 font-medium focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm">
                  <SelectValue placeholder="All Generics" />
                </SelectTrigger>
                <SelectContent className="bg-white border-purple-100 shadow-xl z-[9999]">
                  <SelectItem value="ALL">
                    <span className="flex items-center gap-2 font-medium text-purple-700">
                      <Sparkles className="w-3.5 h-3.5" /> All Generics
                    </span>
                  </SelectItem>
                  {genericOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Filter - EMERALD THEME */}
            <div className="space-y-2 group">
              <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Dosage Form
              </Label>
              <Select value={formFilter} onValueChange={setFormFilter}>
                <SelectTrigger className="w-full border-emerald-200 bg-emerald-50/30 text-emerald-900 font-medium focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">
                  <SelectValue placeholder="All Forms" />
                </SelectTrigger>
                <SelectContent className="bg-white border-emerald-100 shadow-xl z-[9999]">
                  <SelectItem value="ALL">
                    <span className="flex items-center gap-2 font-medium text-emerald-700">
                      <Sparkles className="w-3.5 h-3.5" /> All Forms
                    </span>
                  </SelectItem>
                  {formOptions.map(({ value, label }) => {
                    const style = FORM_STYLES[label] || FORM_STYLES.Default;
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <span className={`p-1 rounded-sm ${style.bg} ${style.text}`}>
                            {style.icon}
                          </span>
                          {label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="h-12 pl-6 font-bold text-xs uppercase tracking-wider text-slate-500">Medicine Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Generic Name</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Strength</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Form</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-500 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin w-8 h-8 text-[#119abf]" />
                      <p className="text-sm font-medium">Loading inventory...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                         <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium">No medicines found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((med) => {
                  const label = formatFormLabel(med.form);
                  const style = FORM_STYLES[label] || FORM_STYLES.Default;

                  return (
                    <TableRow key={med.id} className="group hover:bg-slate-50/60 transition-all duration-200 border-b border-slate-100 last:border-0">
                      <TableCell className="pl-6 py-4">
                        <span className="font-bold text-slate-900 group-hover:text-[#119abf] transition-colors">
                          {med.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{med.genericName || "-"}</TableCell>
                      <TableCell>
                        {med.strength ? (
                            <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700 border-slate-200">
                                {med.strength}
                            </Badge>
                        ) : (
                            <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg.replace("100", "50")} ${style.text} border-transparent shadow-sm`}
                        >
                          {style.icon}
                          {label}
                        </span>
                      </TableCell>
                      
                      {/* ACTIONS - FIXED & ANIMATED */}
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEdit(med)} 
                            className="h-8 w-8 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 shadow-sm transition-all active:scale-95"
                            title="Edit Medicine"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-sm transition-all active:scale-95"
                            onClick={() => handleDelete(med.id)}
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* DIALOG (ADD/EDIT) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col gap-0">
          
          <div className="bg-[#119abf] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                {editing ? "Edit Medicine Details" : "Add New Medicine"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
            <div className="p-8 grid gap-6">
                <div className="grid gap-2">
                  <Label className="text-slate-700 font-semibold">Medicine Name <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    placeholder="e.g. Panadol"
                    value={formData.name}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-[#119abf]"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-slate-700 font-semibold">Generic Name</Label>
                  <Input
                    required
                    placeholder="e.g. Paracetamol"
                    value={formData.genericName}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-[#119abf]"
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8">
                    <Label className="text-slate-700 font-semibold">Strength</Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="500"
                      value={formData.strengthValue}
                      className="mt-1.5 bg-slate-50 border-slate-200 focus-visible:ring-[#119abf]"
                      onChange={(e) => setFormData({ ...formData, strengthValue: e.target.value })}
                    />
                  </div>

                  <div className="col-span-4">
                    <Label className="text-slate-700 font-semibold">Unit</Label>
                    <Select
                      value={formData.strengthUnit}
                      onValueChange={(v) => setFormData({ ...formData, strengthUnit: v })}
                    >
                      <SelectTrigger className="mt-1.5 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[9999]">
                        {STRENGTH_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-slate-700 font-semibold">Form</Label>
                  <Select
                    value={formData.form}
                    onValueChange={(v) => setFormData({ ...formData, form: v })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select form..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60 overflow-auto z-[9999]">
                      {FORMS.map((f) => {
                        const style = FORM_STYLES[f] || FORM_STYLES.Default;
                        return (
                          <SelectItem key={f} value={f}>
                            <span className="flex items-center gap-2">
                              <span className={`p-1 rounded ${style.bg} ${style.text}`}>
                                {style.icon}
                              </span>
                              {f}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-slate-700 font-semibold">Description</Label>
                  <Textarea
                    rows={3}
                    placeholder="Additional notes..."
                    value={formData.description}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-[#119abf]"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#119abf] hover:bg-[#0e8cae] text-white px-6 shadow-md transition-all active:scale-95" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MedicinesManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#119abf]" />
          <p className="text-slate-500 font-medium animate-pulse">Loading Inventory...</p>
        </div>
      </div>
    }>
      <MedicinesManagementContent />
    </Suspense>
  );
}