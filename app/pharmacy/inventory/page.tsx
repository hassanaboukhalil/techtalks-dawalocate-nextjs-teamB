"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Search, ChevronDown } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
}

export default function PharmacyInventoryPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    medicineId: "",
    quantity: "",
    status: "IN_STOCK",
    expiresAt: "",
  });

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      }
    } catch (error: any) {
      alert(
        error.response?.data?.error || "Failed to add medicine to inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2 text-primary">Pharmacy Inventory</h1>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Add Medicine
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-600">
                            {medicine.genericName && (
                              <span>{medicine.genericName}</span>
                            )}
                            {medicine.strength && (
                              <span className="ml-2">• {medicine.strength}</span>
                            )}
                            {medicine.form && (
                              <span className="ml-2">• {medicine.form}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showDropdown && searchTerm && filteredMedicines.length === 0 && (
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

      <div className="bg-card rounded-lg p-6 text-gray-700">
        <p>Click the "Add Medicine" button to add new inventory items.</p>
      </div>
    </div>
  );
}
