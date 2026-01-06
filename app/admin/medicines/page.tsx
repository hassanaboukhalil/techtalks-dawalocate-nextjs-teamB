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
  // Examples: "500mg", "0.1%", "250mg/5ml"
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

  // 👇👇👇 PASTE THIS BLOCK HERE 👇👇👇
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search"); // Reads ?search=Panadol
    if (query) {
      setSearch(query); // Types it into the search box for you
    }
  }, [searchParams]);
  // 👆👆👆 END OF NEW BLOCK 👆👆👆

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
      if (!m.form) return; // 🚫 skip empty forms
  
      const normalized = normalizeForm(m.form);
      if (!normalized) return; // 🚫 skip ""
  
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

    const cleanForm = formatFormLabel(formData.form); // normalize casing
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <PageTitle>Medicines Inventory</PageTitle>
          <p className="text-slate-500 mt-1">Structured, searchable medicine catalog.</p>
          <div className="mt-2 text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{filteredMedicines.length}</span>
          </div>
        </div>

        <Button onClick={openAdd} className="bg-[#119abf] hover:bg-[#0e8cae] shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add New Medicine
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-center relative z-10 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#119abf] w-4 h-4" />
          <Input
            placeholder="Search name, generic, strength or form…"
            className="pl-9 bg-white border-slate-200 focus-visible:ring-[#119abf]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Generic filter */}
        <Select value={genericFilter} onValueChange={setGenericFilter}>
          <SelectTrigger className="w-56 bg-white border border-slate-200 shadow-sm">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <SelectValue placeholder="All Generics" />
            </span>
          </SelectTrigger>

          {/* IMPORTANT: solid background + high z-index */}
          <SelectContent className="bg-white border border-slate-200 shadow-xl z-[9999]">
            <SelectItem value="ALL">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 opacity-0" />
                All Generics
              </span>
            </SelectItem>
            {genericOptions.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Form filter */}
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger
            className={`w-48 border shadow-sm ${
              formFilter === "ALL"
                ? "bg-white border-slate-200"
                : `${activeFormStyle.bg} ${activeFormStyle.text} border-transparent`
            }`}
          >
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>

          {/* IMPORTANT: solid background + high z-index */}
          <SelectContent className="bg-white border border-slate-200 shadow-xl z-[9999]">
            <SelectItem value="ALL">All Forms</SelectItem>
            {formOptions.map(({ value, label }) => {
              const style = FORM_STYLES[label] || FORM_STYLES.Default;
              return (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <span className={`p-1 rounded ${style.bg} ${style.text}`}>
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

      {/* TABLE */}
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Medicine Name</TableHead>
              <TableHead className="font-semibold">Generic Name</TableHead>
              <TableHead className="font-semibold">Strength</TableHead>
              <TableHead className="font-semibold">Form</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <Loader2 className="animate-spin inline mr-2" /> Loading…
                </TableCell>
              </TableRow>
            ) : filteredMedicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMedicines.map((med) => {
                const label = formatFormLabel(med.form);
                const style = FORM_STYLES[label] || FORM_STYLES.Default;

                return (
                  <TableRow key={med.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{med.name}</TableCell>
                    <TableCell className="text-slate-600">{med.genericName || "-"}</TableCell>
                    <TableCell className="text-slate-600">{med.strength || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        {style.icon}
                        {label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(med)} className="hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(med.id)}
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

      {/* DIALOG (ADD/EDIT) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing ? "Edit Medicine" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>

          {/* Form Card */}
          <form onSubmit={handleSave} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                required
                placeholder="Enter medicine name"
                value={formData.name}
                className="bg-white border-slate-200 focus-visible:ring-[#119abf]"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Generic Name</Label>
              <Input
                required
                placeholder="Enter generic ingredient"
                value={formData.genericName}
                className="bg-white border-slate-200 focus-visible:ring-[#119abf]"
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />
            </div>

            {/* Strength + Unit */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8">
                <Label>Strength</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Strength value"
                  value={formData.strengthValue}
                  className="bg-white border-slate-200 focus-visible:ring-[#119abf]"
                  onChange={(e) => setFormData({ ...formData, strengthValue: e.target.value })}
                />
              </div>

              <div className="col-span-4">
                <Label>Unit</Label>
                <Select
                  value={formData.strengthUnit}
                  onValueChange={(v) => setFormData({ ...formData, strengthUnit: v })}
                >
                  <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl z-[9999]">
                    {STRENGTH_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form dropdown */}
            <div className="grid gap-2">
              <Label>Form</Label>
              <Select
                value={formData.form}
                onValueChange={(v) => setFormData({ ...formData, form: v })}
              >
                <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>

                {/* Not transparent + scroll */}
                <SelectContent className="bg-white border border-slate-200 shadow-xl z-[9999] max-h-64 overflow-auto">
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
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Short medical description…"
                value={formData.description}
                className="bg-white border-slate-200 focus-visible:ring-[#119abf]"
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#119abf] hover:bg-[#0e8cae]" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MedicinesManagementContent />
    </Suspense>
  );
}
