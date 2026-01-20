"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  X,
  Search,
  PackageOpen,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  XCircle,
  Package,
  Calendar,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search as SearchIcon
} from "lucide-react";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";


// --- INTERFACES ---
interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
}

interface InventoryItem {
  id: number;
  pharmacyId: number;
  medicineId: number;
  quantity: number;
  status: "IN_STOCK" | "LOW" | "OUT";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
}

function PharmacyInventoryContent() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingInventory, setFetchingInventory] = useState(true);

  // Data State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Search States
  const [tableSearch, setTableSearch] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  // Dropdown & Form State
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    medicineId: "",
    quantity: "",
    status: "IN_STOCK",
    expiresAt: "",
  });

  const [editFormData, setEditFormData] = useState({
    quantity: "",
    status: "IN_STOCK" as "IN_STOCK" | "LOW" | "OUT",
    expiresAt: "",
  });

  // --- FILTERING LOGIC (Moved Top Level to Fix ReferenceError) ---
  const filteredInventoryItems = inventoryItems.filter(
    (item) =>
      item.medicine.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.medicine.genericName?.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const filteredMedicines = medicines.filter((medicine) => {
    const searchLower = modalSearchTerm.toLowerCase();
    return (
      medicine.name.toLowerCase().includes(searchLower) ||
      medicine.genericName?.toLowerCase().includes(searchLower) ||
      medicine.strength?.toLowerCase().includes(searchLower) ||
      medicine.form?.toLowerCase().includes(searchLower)
    );
  });

  // --- HOOKS ---
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setTableSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get("/api/global");
        if (response.data.success) {
          setMedicines(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };
    fetchMedicines();
  }, []);

  const fetchInventory = async () => {
    setFetchingInventory(true);
    try {
      const response = await axios.get("/api/pharmacy/inventory");
      if (response.data.success) {
        setInventoryItems(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setFetchingInventory(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({ ...formData, medicineId: medicine.id.toString() });
    setModalSearchTerm(medicine.name);
    setShowDropdown(false);
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        medicineId: parseInt(formData.medicineId),
        quantity: parseInt(formData.quantity),
        status: formData.status,
        expiresAt: formData.expiresAt || undefined,
      };

      const response = await axios.post("/api/pharmacy/inventory", payload);

      if (response.data.success) {
        alert("Medicine added successfully!");
        setOpen(false);
        setFormData({
          medicineId: "",
          quantity: "",
          status: "IN_STOCK",
          expiresAt: "",
        });
        setModalSearchTerm("");
        setSelectedMedicine(null);
        fetchInventory();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to add medicine to inventory");
      } else {
        alert("Failed to add medicine to inventory");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData({
      quantity: item.quantity.toString(),
      status: item.status,
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    try {
      const payload = {
        inventoryId: editingItem.id,
        quantity: parseInt(editFormData.quantity),
        status: editFormData.status,
        expiresAt: editFormData.expiresAt || null,
      };
      const response = await axios.put("/api/pharmacy/inventory", payload);
      if (response.data.success) {
        alert("Medicine updated successfully!");
        setEditOpen(false);
        setEditingItem(null);
        fetchInventory();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to update medicine");
      } else {
        alert("Failed to update medicine");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.medicine.name}" from your inventory?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/pharmacy/inventory?inventoryId=${item.id}`
      );
      if (response.data.success) {
        alert(response.data.message || "Medicine deleted successfully!");
        fetchInventory();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Failed to delete medicine from inventory");
      } else {
        alert("Failed to delete medicine from inventory");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const getStatusBadge = (status: string) => {
    if (status === "IN_STOCK") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm pl-1.5 pr-2.5 gap-1.5 hover:scale-105 transition-transform cursor-default">
          <CheckCircle2 className="w-3.5 h-3.5" />
          In Stock
        </Badge>
      );
    }
    if (status === "LOW") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm pl-1.5 pr-2.5 gap-1.5 hover:scale-105 transition-transform cursor-default">
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 shadow-sm pl-1.5 pr-2.5 gap-1.5 hover:scale-105 transition-transform cursor-default">
        <XCircle className="w-3.5 h-3.5" />
        Out of Stock
      </Badge>
    );
  };

  // --- RENDER ---
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // (Skipping User Status checks to save space, assuming they are maintained)

  return (
    <div className="p-8 max-w-[1800px] mx-auto min-h-screen bg-slate-50/50 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-8 mb-10">
        
        {/* ROW 1: Title & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 animate-in slide-in-from-left-4 duration-700">
           <PageTitle> Inventory Management</PageTitle>
             
            
            <p className="text-slate-500 text-lg font-medium">
              Track stock levels, expiration, and medicine details.
            </p>
          </div>
          
          <div className="animate-in slide-in-from-right-4 duration-700">
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
              <Button
                size="lg"
                className="
                  bg-[#2699B2]
                  hover:bg-[#1f7f94]
                  text-white
                  shadow-lg shadow-[#2699B2]/30
                  hover:shadow-[#2699B2]/40
                  transition-all
                  hover:-translate-y-0.5
                  font-bold
                  px-6
                "
              >
                <Plus size={20} className="mr-2" />
                Add Medicine
              </Button>

              </Dialog.Trigger>

              {/* --- ENHANCED ADD MEDICINE MODAL --- */}
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-0 overflow-hidden bg-white rounded-3xl shadow-2xl outline-none">
                  
                  {/* Header with Perfect Corners */}
                  <div className="bg-[#2699B2] p-8 text-white relative">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <Dialog.Title className="text-2xl font-extrabold flex items-center gap-3 text-white">
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          Add Medicine
                        </Dialog.Title>
                        <Dialog.Description className="text-indigo-100 mt-2 font-medium text-sm">
                          Search the global database to stock your shelves.
                        </Dialog.Description>
                      </div>
                      <Dialog.Close asChild>
                        <button className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all">
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* 1. Medicine Search */}
                    <div className="space-y-3 relative" ref={dropdownRef}>
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Medicine Name</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10">
                          <Search size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Type to search medicine..."
                          value={modalSearchTerm}
                          onChange={(e) => {
                            setModalSearchTerm(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={handleSearchFocus}
                          className="w-full pl-10 pr-10 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm"
                        />
                        
                        {/* Custom Dropdown List */}
                        {showDropdown && filteredMedicines.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {filteredMedicines.map((medicine) => (
                              <button
                                key={medicine.id}
                                type="button"
                                onClick={() => handleMedicineSelect(medicine)}
                                className={cn(
                                  "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                  selectedMedicine?.id === medicine.id ? "bg-indigo-50" : ""
                                )}
                              >
                                <div className="font-bold text-slate-800 text-sm">{medicine.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5 flex gap-2">
                                  {medicine.genericName && <span>{medicine.genericName}</span>}
                                  {medicine.strength && <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 rounded">{medicine.strength}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* 2. Quantity */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Quantity</Label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                            <Hash className="h-4 w-4" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full pl-10 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* 3. Status (Professional Tiles) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</Label>
                      
                      {/* Hidden Select for logic compatibility */}
                      <select
                        className="hidden"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW">Low</option>
                        <option value="OUT">Out</option>
                      </select>

                      <div className="grid grid-cols-3 gap-3">
                      {[
                        { 
                          val: "IN_STOCK", 
                          label: "In Stock", 
                          icon: CheckCircle2, 
                          // Always show green icon
                          iconColor: "text-emerald-500", 
                          // Light green on hover
                          hoverClass: "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700", 
                          // Strong green when selected
                          activeClass: "bg-emerald-100 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500" 
                        },
                        { 
                          val: "LOW", 
                          label: "Low", 
                          icon: AlertTriangle, 
                          iconColor: "text-amber-500",
                          hoverClass: "hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700", 
                          activeClass: "bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500" 
                        },
                        { 
                          val: "OUT", 
                          label: "Out", 
                          icon: XCircle, 
                          iconColor: "text-rose-500",
                          hoverClass: "hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700", 
                          activeClass: "bg-rose-100 border-rose-500 text-rose-900 ring-1 ring-rose-500" 
                        }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: opt.val })}
                          className={cn(
                            "group flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 gap-1.5",
                            formData.status === opt.val 
                              ? opt.activeClass 
                              : cn("bg-white border-slate-200 text-slate-600 shadow-sm", opt.hoverClass)
                          )}
                        >
                          <opt.icon 
                            className={cn(
                              "h-6 w-6 transition-transform group-hover:scale-110 duration-200", 
                              // Use the specific icon color, but make it darker if active/hovered for contrast
                              formData.status === opt.val ? "text-current" : opt.iconColor
                            )} 
                          />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    </div>
                  </div>
                    

                    {/* 4. Expiry Date */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expiry Date</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <input
                          type="datetime-local"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                          className="w-full pl-10 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
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
                      disabled={loading || !formData.medicineId}
                      className="flex-[2] h-5 rounded-xl bg-[#2699B2] p-6 text-white font-bold  hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-90"
                   
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add to Inventory"}
                    </button>
                  </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

        {/* ROW 2: GIANT SEARCH BAR */}
        <div className="w-full relative group animate-in slide-in-from-bottom-4 duration-700 delay-100">
  
          {/* Soft blue glow */}
          <div
            className="absolute -inset-[2px] rounded-2xl
            bg-[#2699B2]/30
            opacity-40 group-focus-within:opacity-100
            blur-md transition-opacity duration-500"
          />

          {/* Input container */}
          <div className="relative bg-white rounded-2xl flex items-center
                          border border-[#2699B2]/40
                          shadow-[0_8px_20px_rgba(38,153,178,0.18)]
                          focus-within:border-[#2699B2]
                          transition-all duration-300">

            <div className="pl-6 text-[#2699B2]">
              <SearchIcon className="h-6 w-6" />
            </div>

            <input
              placeholder="Search inventory by medicine name"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full h-16 pl-4 pr-6 rounded-2xl bg-transparent
                        border-none text-lg text-slate-700
                        placeholder:text-slate-400
                        focus:outline-none focus:ring-0"
            />
          </div>
        </div>

      </div>

      {/* --- TABLE CONTAINER --- */}
      <div
        className="
          rounded-3xl
          border-2 border-[#2699B2]
          bg-white
          shadow-lg
          h-[75vh]
          overflow-hidden
        "
      >
        <div className="relative h-full w-full bg-white rounded-2xl overflow-hidden flex flex-col">
          {fetchingInventory ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
              <p className="font-medium text-lg">Loading Inventory...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <Table>
                  <TableHeader className="sticky top-0 z-10 shadow-[0_2px_0_0_rgba(38,153,178,0.15)]">
                    <TableRow
                      className="
                        bg-[#f4fbff]
                        border-b-[4px] border-[#2699B2]
                      "
                    >
                      <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Medicine Details
                      </TableHead>

                      <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Qty
                      </TableHead>

                      <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Status
                      </TableHead>

                      <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Expiry
                      </TableHead>

                      <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredInventoryItems.length === 0 ? (
                      <TableEmpty 
                        message={tableSearch ? "No matching medicines found" : "Your inventory is empty"}
                        icon={<PackageOpen className="h-16 w-16 text-slate-200 mb-4" />}
                      />
                    ) : (
                      filteredInventoryItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="group hover:bg-indigo-50/30 transition-colors border-b border-slate-100 last:border-0 h-20"
                        >
                          {/* MEDICINE DETAILS */}
                          <TableCell className="align-middle">
                    <div className="flex justify-center">
                      <div className="w-full max-w-[360px] pl-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {item.medicine.name}
                          </span>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            {item.medicine.genericName && (
                              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                {item.medicine.genericName}
                              </span>
                            )}

                            {(item.medicine.strength || item.medicine.form) && (
                              <span className="text-slate-300">•</span>
                            )}

                            {item.medicine.strength && <span>{item.medicine.strength}</span>}
                            {item.medicine.form && <span>{item.medicine.form}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>


                          {/* QTY */}
                          <TableCell className="text-center align-middle">
                            <div className="flex justify-center">
                              <span className="px-4 py-1 rounded-xl bg-slate-50 shadow-sm font-bold text-slate-800">
                                {item.quantity}
                              </span>
                            </div>
                          </TableCell>

                          {/* STATUS */}
                          <TableCell className="text-center align-middle">
                            <div className="flex justify-center">
                              {getStatusBadge(item.status)}
                            </div>
                          </TableCell>

                          {/* EXPIRY */}
                          <TableCell className="text-center align-middle">
                            <div className="flex justify-center items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg text-sm font-semibold text-slate-700">
                              <Calendar className="w-4 h-4 text-[#2699B2]" />
                              {item.expiresAt
                                ? new Date(item.expiresAt).toLocaleDateString()
                                : <span className="text-slate-400 italic">No date</span>}
                            </div>
                          </TableCell>

                          {/* ACTIONS */}
                          <TableCell className="text-center align-middle">
                            <div className="flex justify-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="h-10 w-10 text-[#2699B2] bg-white border border-[#2699B2]/20 hover:bg-[#2699B2]/10 hover:border-[#2699B2]/40 transition-all shadow-sm rounded-xl hover:scale-110"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item)}
                                className="h-10 w-10 text-rose-500 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm rounded-xl hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>

              </Table>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT MEDICINE DIALOG --- */}
      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-0 z-50 overflow-hidden outline-none">
             
             {/* Edit Header */}
             <div className="bg-indigo-600 p-8 text-white relative">
                <div className="flex justify-between items-center relative z-10">
                  <Dialog.Title className="text-2xl font-extrabold flex items-center gap-3 text-white">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                      <Pencil className="h-6 w-6 text-white" />
                    </div>
                    Edit Medicine
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all">
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>
             </div>

             {/* Edit Info Card */}
             {editingItem && (
               <div className="px-8 pt-6 pb-0">
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                   <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Package className="h-6 w-6 text-indigo-600" />
                   </div>
                   <div>
                      <p className="font-extrabold text-indigo-900 text-xl leading-none">{editingItem.medicine.name}</p>
                      {editingItem.medicine.genericName && (
                        <p className="text-xs text-indigo-600 mt-1.5 font-bold uppercase tracking-wide">{editingItem.medicine.genericName}</p>
                      )}
                   </div>
                 </div>
               </div>
             )}

             {/* Edit Form */}
             <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Quantity</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Hash className="h-4 w-4" />
                        </div>
                        <input 
                          type="number" 
                          value={editFormData.quantity} 
                          onChange={e => setEditFormData({...editFormData, quantity: e.target.value})} 
                          className="w-full pl-10 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm" 
                        />
                      </div>
                   </div>
                   
                   {/* 3. Status (Professional Tiles) */}
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</Label>
                      
                      {/* Hidden Select for logic compatibility */}
                      <select 
                        className="hidden"
                        value={editFormData.status} 
                        onChange={e => setEditFormData({...editFormData, status: e.target.value as "IN_STOCK" | "LOW" | "OUT"})} 
                      >
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW">Low</option>
                        <option value="OUT">Out</option>
                      </select>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: "IN_STOCK", label: "In Stock", icon: CheckCircle2, color: "text-emerald-600", activeClass: "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/20 shadow-sm" },
                          { val: "LOW", label: "Low", icon: AlertTriangle, color: "text-amber-600", activeClass: "bg-amber-50 border-amber-200 ring-1 ring-amber-500/20 shadow-sm" },
                          { val: "OUT", label: "Out", icon: XCircle, color: "text-rose-600", activeClass: "bg-rose-50 border-rose-200 ring-1 ring-rose-500/20 shadow-sm" }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setEditFormData({...editFormData, status: opt.val as any})}
                            className={cn(
                              "flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 gap-1.5",
                              editFormData.status === opt.val 
                                ? opt.activeClass 
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <opt.icon className={cn("h-5 w-5", editFormData.status === opt.val ? opt.color : "text-slate-400")} />
                            <span className={cn("text-xs font-bold", editFormData.status === opt.val ? "text-slate-900" : "text-slate-500")}>
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

               {/* Expiry Date (EDIT FORM - FIXED) */}
               <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expiry Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "w-full h-12 px-4 rounded-xl border bg-slate-50 border-slate-200 flex items-center justify-between text-left transition-all font-medium text-sm hover:bg-white hover:border-[#119abf]/50 outline-none focus:ring-2 focus:ring-[#119abf]/20",
                              !editFormData.expiresAt && "text-slate-400"
                            )}
                          >
                            <span>
                              {editFormData.expiresAt ? format(new Date(editFormData.expiresAt), "PPP") : "Select date"}
                            </span>
                            <Calendar className="h-4 w-4 text-slate-400" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 bg-white rounded-2xl shadow-xl border border-slate-100" align="start">
                          <div className="block">
                            <CalendarComponent
                              mode="single"
                              selected={editFormData.expiresAt ? new Date(editFormData.expiresAt) : undefined}
                              onSelect={(date) => {
                                if (!date) return;
                                
                                // 🟢 FIX: Set time to 12:00 PM to prevent timezone rollback
                                const adjustedDate = new Date(date);
                                adjustedDate.setHours(12, 0, 0, 0);

                                setEditFormData({
                                  ...editFormData,
                                  expiresAt: adjustedDate.toISOString(),
                                });
                              }}
                              initialFocus
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                </div>

                <div className="pt-4 flex gap-4 border-t border-slate-100 mt-2">
                   <Button type="button" onClick={() => setEditOpen(false)} className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition-all">Cancel</Button>
                   <Button type="submit" disabled={loading} className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg hover:scale-[1.02] transition-all">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                   </Button>
                </div>
             </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}

export default function PharmacyInventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    }>
      <PharmacyInventoryContent />
    </Suspense>
  );
}