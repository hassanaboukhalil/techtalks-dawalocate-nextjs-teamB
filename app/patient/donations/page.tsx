"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Calendar, 
  MapPin, 
  Pill, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Filter, 
  Package,
  HeartHandshake,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { MedicineAutocomplete } from "@/components/ui/MedicineAutocomplete";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";
import { PageTitle } from "@/components/layout/PageTitle";

// --- Interfaces Preserved ---
interface Medicine {
  id: number;
  name: string;
  genericName?: string | null;
  strength?: string | null;
  form?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}

interface DonationOffer {
  id: number;
  userId: number;
  medicineId: number;
  city: string;
  expiry?: string;
  notes?: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function PatientDonationsPage() {
  // --- State Preserved ---
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [togglingOfferId, setTogglingOfferId] = useState<number | null>(null);

  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [city, setCity] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // --- Logic Preserved ---
  useEffect(() => {
    fetchOffers();
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("/api/global/medicines");
      const result = await response.json();
      if (result.success && result.data) setMedicines(result.data);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/patient/donation-offers");
      const result: ApiResponse<DonationOffer[]> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch donation offers");
      setOffers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async () => {
    if (!selectedMedicine || !city.trim()) {
      setError("Please select a medicine and enter a city");
      return;
    }
    try {
      setFormLoading(true);
      setError(null);
      const response = await fetch("/api/patient/donation-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: selectedMedicine.id, city: city.trim() }),
      });
      const result: ApiResponse<DonationOffer> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to create donation offer");
      setSuccessMessage("Donation offer created successfully!");
      setIsFormDialogOpen(false);
      resetForm();
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const updateOffer = async () => {
    if (!editingOfferId || !selectedMedicine || !city.trim()) {
      setError("Please select a medicine and enter a city");
      return;
    }
    try {
      setFormLoading(true);
      setError(null);
      const response = await fetch(`/api/patient/donation-offers/${editingOfferId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: selectedMedicine.id, city: city.trim() }),
      });
      const result: ApiResponse<DonationOffer> = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to update donation offer");
      setSuccessMessage(result.message || "Donation offer updated successfully!");
      setIsFormDialogOpen(false);
      resetForm();
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleOfferStatus = async (offer: DonationOffer) => {
    const newStatus = offer.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      setTogglingOfferId(offer.id);
      setError(null);
      const response = await fetch(`/api/patient/donation-offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result: ApiResponse<DonationOffer> = await response.json();
      if (!result.success) throw new Error(result.error || `Failed to ${newStatus === "CLOSED" ? "close" : "reopen"} donation offer`);
      setSuccessMessage(result.message || (newStatus === "CLOSED" ? "Donation offer closed successfully!" : "Donation offer reopened successfully!"));
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTogglingOfferId(null);
    }
  };

  const resetForm = () => {
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    setCity("");
    setEditingOfferId(null);
    setFormMode("create");
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredOffers = offers.filter((offer) => {
    if (statusFilter === "ALL") return true;
    return offer.status === statusFilter;
  });

  const statusCounts = offers.reduce<{ ALL: number; OPEN: number; CLOSED: number }>(
    (acc, offer) => {
      if (offer.status === "OPEN") acc.OPEN += 1;
      if (offer.status === "CLOSED") acc.CLOSED += 1;
      return acc;
    },
    { ALL: offers.length, OPEN: 0, CLOSED: 0 }
  );

  const handleOpenCreate = () => {
    resetForm();
    setFormMode("create");
    setIsFormDialogOpen(true);
  };

  const handleEditOffer = (offer: DonationOffer) => {
    setFormMode("edit");
    setEditingOfferId(offer.id);
    setSelectedMedicine(offer.medicine);
    setMedicineSearchTerm(offer.medicine.name);
    setCity(offer.city);
    setIsFormDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    if (formMode === "edit") updateOffer();
    else createOffer();
  };

  // --- ANIMATED BADGE COMPONENT ---
  const getStatusBadge = (status: string) => {
    return status === "OPEN" ? (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 gap-1.5 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-emerald-100 cursor-default">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-bold tracking-wide">Active</span>
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 gap-1.5 shadow-sm transition-all duration-300 hover:bg-slate-200 cursor-default">
        <XCircle className="w-3.5 h-3.5" />
        <span className="font-medium">Closed</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 group cursor-default">
              {/*<div className="p-3 bg-blue-100 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <HeartHandshake className="h-7 w-7 text-[#119abf] group-hover:text-blue-600 transition-colors" />
              </div>*/}
              <PageTitle> My Donation Offers</PageTitle>
               
              
            </div>
            <p className="text-slate-500 mt-1">
              Your generosity saves lives. Manage your contributions here.
            </p>
          </div>
        
          <Button
            onClick={handleOpenCreate}
            size="lg"
            className="bg-[#119abf] hover:bg-[#0e8cae] text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 active:scale-95 font-semibold text-md h-12 px-6 rounded-xl"
          >
            <Plus className="h-5 w-5 mr-2 animate-pulse" />
            Donate Medicine
          </Button>
        </div>

        {/* Notifications (Animated Slide In) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-red-900">Action Required</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-emerald-900">Success!</h4>
              <p className="text-sm text-emerald-700 mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white rounded-2xl shadow-sm animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            // LIVELY EMPTY STATE
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
                <div className="bg-white p-6 rounded-full shadow-lg relative z-10 animate-bounce-slow">
                  <Package className="h-12 w-12 text-[#119abf]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No donations yet</h3>
              <p className="text-slate-500 max-w-md text-center mb-8 text-lg leading-relaxed">
                You haven't listed any medicines. <br/>
                <span className="text-[#119abf] font-medium">Be the hero someone needs today.</span>
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleOpenCreate} 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 rounded-xl h-12 px-8 font-semibold"
              >
                Start your first donation
              </Button>
            </div>
          ) : (
            <>
              {/* Animated Filter Tabs */}
              <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-lg ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                      <Filter className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filter Status</span>
                  </div>
                  
                  <div className="flex p-1.5 bg-slate-100/80 rounded-xl w-full sm:w-auto relative">
                    {(["ALL", "OPEN", "CLOSED"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`
                          flex-1 sm:flex-none relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ease-out
                          ${statusFilter === status 
                            ? "bg-white text-slate-900 shadow-md scale-100" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95"
                          }
                        `}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                        <span className={`ml-2 text-[10px] py-0.5 px-2 rounded-full transition-colors duration-300 ${
                          statusFilter === status ? "bg-[#119abf] text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {statusCounts[status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STAGGERED GRID ANIMATION */}
              {filteredOffers.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-500 animate-in fade-in zoom-in-95 duration-300">
                  <p className="font-medium text-lg">No {statusFilter.toLowerCase()} offers found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOffers.map((offer, index) => (
                    <div 
                      key={offer.id}
                      className="animate-in slide-in-from-bottom-8 fade-in duration-500 fill-mode-backwards"
                      style={{ animationDelay: `${index * 100}ms` }} // ✨ STAGGERED DELAY
                    >
                      <Card 
                        className={`group h-full flex flex-col overflow-hidden border-t-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                          offer.status === 'OPEN' ? 'border-t-emerald-500' : 'border-t-slate-400'
                        }`}
                      >
                        <CardHeader className="pb-3 space-y-3 bg-white relative">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-[#119abf] transition-colors duration-300">
                                {offer.medicine.name}
                              </CardTitle>
                              {offer.medicine.genericName && (
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                                    {offer.medicine.genericName}
                                  </p>
                                </div>
                              )}
                            </div>
                            {getStatusBadge(offer.status)}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm bg-slate-50/30 pt-5 flex-grow">
                          <div className="grid gap-3 text-slate-600">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                 <MapPin className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-slate-700">{offer.city}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                 <Calendar className="h-4 w-4" />
                              </div>
                              <span>Posted {formatDate(offer.createdAt)}</span>
                            </div>

                            {offer.medicine.strength && (
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                  <Pill className="h-4 w-4" />
                                </div>
                                <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-100 text-slate-800 shadow-sm">
                                  {offer.medicine.strength} {offer.medicine.form}
                                </span>
                              </div>
                            )}
                          </div>

                          {offer.notes && (
                            <div className="bg-amber-50 p-3 rounded-xl text-xs text-slate-700 border border-amber-100/60 mt-3 relative">
                              <div className="absolute -left-1 top-3 w-1 h-6 bg-amber-300 rounded-r-full"></div>
                              <span className="font-bold text-amber-800 block mb-1">Note:</span> 
                              "{offer.notes}"
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-4 pb-5 px-5 gap-3 bg-white border-t border-slate-100 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOffer(offer)}
                            disabled={offer.status !== "OPEN" || togglingOfferId === offer.id}
                            className="flex-1 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 active:scale-95 rounded-xl font-medium"
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            onClick={() => toggleOfferStatus(offer)}
                            disabled={togglingOfferId === offer.id}
                            size="sm"
                            className={`flex-1 transition-all duration-300 active:scale-95 rounded-xl shadow-md hover:shadow-lg font-semibold ${
                              offer.status === "OPEN" 
                                ? "bg-slate-900 hover:bg-black text-white" 
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {togglingOfferId === offer.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : offer.status === "OPEN" ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                Mark Fulfilled
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3.5 w-3.5 mr-2" />
                                Reopen Offer
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Create/Edit Dialog --- */}
      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
        setIsFormDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent 
          className="sm:max-w-[550px] p-0 gap-0 bg-white border-none shadow-2xl rounded-3xl"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest("[data-city-dropdown]")) e.preventDefault();
          }}
        >
          <div className="bg-gradient-to-r from-[#119abf] to-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-3 text-white">
                 <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-lg border border-white/10">
                    {formMode === "edit" ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                 </div>
                 {formMode === "edit" ? "Update Offer" : "Donate Medicine"}
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2 font-medium">
                {formMode === "edit" 
                  ? "Modify the details of your donation."
                  : "Help someone in need by sharing your medicine."
                }
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-7 bg-slate-50/50">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <Pill className="h-4 w-4 text-[#119abf]" />
                 Medicine Details
              </Label>
              {medicines.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-white text-slate-500 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#119abf]" /> Loading database...
                </div>
              ) : (
                <div className="relative shadow-sm">
                  <MedicineAutocomplete
                    medicines={medicines}
                    value={medicineSearchTerm}
                    onChange={setMedicineSearchTerm}
                    onSelect={(medicine) => {
                      setSelectedMedicine(medicine);
                      setMedicineSearchTerm(medicine?.name ?? "");
                    }}
                    placeholder="Type to find medicine..."
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <MapPin className="h-4 w-4 text-[#119abf]" />
                 Pickup City
              </Label>
              {LEBANON_CITIES.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-white text-slate-500 text-sm">
                  Loading cities...
                </div>
              ) : (
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={city}
                  onChange={setCity}
                  placeholder="Select a city..."
                  className="w-full shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="bg-white p-6 flex flex-row-reverse gap-3 border-t border-slate-100">
            <Button 
              onClick={handleDialogSubmit} 
              disabled={formLoading} 
              className="bg-[#119abf] hover:bg-[#0e8cae] text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 min-w-[140px] rounded-xl h-11 font-bold tracking-wide"
            >
              {formLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : formMode === "edit" ? (
                "Save Changes"
              ) : (
                "Create Offer"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormDialogOpen(false);
                resetForm();
              }}
              disabled={formLoading}
              className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 rounded-xl h-11 px-6 font-medium hover:text-slate-900"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}