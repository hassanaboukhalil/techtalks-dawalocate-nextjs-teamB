"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  X,
  Search,
  ChevronDown,
  PackageOpen,
  Pencil,
  Trash2,
} from "lucide-react";
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

export default function PharmacyInventoryPage() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingInventory, setFetchingInventory] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
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

  // Fetch all medicines for dropdown
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

  // Fetch inventory items
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

  // Close dropdown when clicking outside
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

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter((medicine) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      medicine.name.toLowerCase().includes(searchLower) ||
      medicine.genericName?.toLowerCase().includes(searchLower) ||
      medicine.strength?.toLowerCase().includes(searchLower) ||
      medicine.form?.toLowerCase().includes(searchLower)
    );
  });

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({ ...formData, medicineId: medicine.id.toString() });
    setSearchTerm(medicine.name);
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
        setSearchTerm("");
        setSelectedMedicine(null);
        // Refresh inventory
        fetchInventory();
      }
    } catch (error: any) {
      alert(
        error.response?.data?.error || "Failed to add medicine to inventory"
      );
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
        // Refresh inventory
        fetchInventory();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    // Confirm deletion
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
        // Refresh inventory
        fetchInventory();
      }
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Failed to delete medicine from inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      IN_STOCK: "bg-green-100 text-green-800 border-green-200",
      LOW: "bg-yellow-100 text-yellow-800 border-yellow-200",
      OUT: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = {
      IN_STOCK: "In Stock",
      LOW: "Low Stock",
      OUT: "Out of Stock",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2 text-primary">Inventory</h1>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="default" size="lg">
              <Plus size={20} />
              Add Medicine
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-h3 text-primary">
                  Add New Medicine
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Search for a medicine..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={handleSearchFocus}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-gray-400" />
                    </div>
                  </div>

                  {showDropdown && filteredMedicines.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredMedicines.map((medicine) => (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => handleMedicineSelect(medicine)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                            selectedMedicine?.id === medicine.id
                              ? "bg-primary/10"
                              : ""
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {medicine.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {medicine.genericName && (
                              <span>{medicine.genericName}</span>
                            )}
                            {medicine.strength && (
                              <span className="ml-2">
                                • {medicine.strength}
                              </span>
                            )}
                            {medicine.form && (
                              <span className="ml-2">• {medicine.form}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showDropdown &&
                    searchTerm &&
                    filteredMedicines.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                        No medicines found
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Medicine"}
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {fetchingInventory ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading inventory...</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="border-b-2 border-gray-300">
                  <TableHead className="w-[250px] bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Medicine Name
                  </TableHead>
                  <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Generic Name
                  </TableHead>
                  <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Form & Strength
                  </TableHead>
                  <TableHead className="text-center bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Quantity
                  </TableHead>
                  <TableHead className="text-center bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Status
                  </TableHead>
                  <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Expires At
                  </TableHead>
                  <TableHead className="text-center w-[120px] bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.length === 0 ? (
                  <TableEmpty
                    message="No medicines in inventory yet. Click 'Add Medicine' to get started."
                    icon={<PackageOpen className="h-10 w-10 text-gray-400" />}
                  />
                ) : (
                  inventoryItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium text-gray-900">
                        {item.medicine.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item.medicine.genericName || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex flex-col">
                          {item.medicine.form && (
                            <span className="text-sm">
                              {item.medicine.form}
                            </span>
                          )}
                          {item.medicine.strength && (
                            <span className="text-xs text-gray-500">
                              {item.medicine.strength}
                            </span>
                          )}
                          {!item.medicine.form &&
                            !item.medicine.strength &&
                            "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-gray-900">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {item.expiresAt
                          ? new Date(item.expiresAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
                            aria-label={`Edit ${item.medicine.name}`}
                            title={`Edit ${item.medicine.name}`}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={loading}
                            className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${item.medicine.name}`}
                            title={`Delete ${item.medicine.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Edit Medicine Dialog */}
      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-h3 text-primary">
                Edit Medicine
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X size={24} />
                </button>
              </Dialog.Close>
            </div>

            {editingItem && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-900">
                  {editingItem.medicine.name}
                </p>
                {editingItem.medicine.genericName && (
                  <p className="text-sm text-gray-600">
                    {editingItem.medicine.genericName}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editFormData.quantity}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as "IN_STOCK" | "LOW" | "OUT",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW">Low Stock</option>
                  <option value="OUT">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.expiresAt}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      expiresAt: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Updating..." : "Update Medicine"}
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
