"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, X, Calendar, MapPin, Pill, AlertCircle, CheckCircle, CheckCircle2, XCircle, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineAutocomplete } from "@/components/ui/MedicineAutocomplete";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";

interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  imageUrl?: string;
  description?: string;
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
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  // Dialog & action states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [togglingOfferId, setTogglingOfferId] = useState<number | null>(null);

  // Form states
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [city, setCity] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Fetch donation offers and medicines on component mount
  useEffect(() => {
    fetchOffers();
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("/api/global/medicines");
      const result = await response.json();

      if (result.success && result.data) {
        setMedicines(result.data);
      }
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

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch donation offers");
      }

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

      const offerData = {
        medicineId: selectedMedicine.id,
        city: city.trim()
      };

      const response = await fetch("/api/patient/donation-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      const result: ApiResponse<DonationOffer> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create donation offer");
      }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineId: selectedMedicine.id,
          city: city.trim(),
        }),
      });

      const result: ApiResponse<DonationOffer> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update donation offer");
      }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result: ApiResponse<DonationOffer> = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || `Failed to ${newStatus === "CLOSED" ? "close" : "reopen"} donation offer`
        );
      }

      setSuccessMessage(
        result.message ||
          (newStatus === "CLOSED"
            ? "Donation offer closed successfully!"
            : "Donation offer reopened successfully!")
      );
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
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    return status === "OPEN" ? (
      <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        Open
      </div>
    ) : (
      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
        <X className="w-3 h-3" />
        Closed
      </div>
    );
  };

  const filteredOffers = offers.filter((offer) => {
    if (statusFilter === "ALL") {
      return true;
    }
    return offer.status === statusFilter;
  });

  const statusCounts = offers.reduce<{ ALL: number; OPEN: number; CLOSED: number }>(
    (acc, offer) => {
      if (offer.status === "OPEN") {
        acc.OPEN += 1;
      }
      if (offer.status === "CLOSED") {
        acc.CLOSED += 1;
      }
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
    if (formMode === "edit") {
      updateOffer();
    } else {
      createOffer();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Donation Offers</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your medicine donation offers for charities
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Offer
        </Button>
      </div>

      {offers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="inline-flex bg-gray-100 rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                statusFilter === "ALL"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === "ALL"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {statusCounts.ALL}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("OPEN")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                statusFilter === "OPEN"
                  ? "bg-white text-[#094A58] shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Open
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === "OPEN"
                    ? "bg-[#E6F7FB] text-[#094A58]"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {statusCounts.OPEN}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("CLOSED")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                statusFilter === "CLOSED"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Closed
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === "CLOSED"
                    ? "bg-gray-200 text-gray-900"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {statusCounts.CLOSED}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* State Blocks */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading donation offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="flex justify-center items-center min-h-96">
          <Card className="text-center py-16 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-8 left-10 w-8 h-8 bg-blue-100 rounded-full animate-float opacity-50"></div>
              <div className="absolute top-20 right-12 w-6 h-6 bg-green-100 rounded-full animate-float-delayed opacity-50"></div>
              <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-pink-100 rounded-full animate-float-slow opacity-50"></div>
            </div>
            <CardContent className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="animate-spin-slow absolute inset-0 border-2 border-transparent border-t-blue-300 border-r-blue-300 rounded-full"></div>
                  <Pill className="h-16 w-16 text-gray-400 animate-bounce relative" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-fade-in">
                No donation offers yet
              </h3>
              <p className="text-gray-600 mb-2 animate-fade-in">
                Your unused medicines could help someone today.
              </p>
              <p className="text-gray-500 mb-8 animate-fade-in text-sm">
                Share what you can spare and track your offers here.
              </p>
              <Button
                onClick={handleOpenCreate}
                className="animate-pulse-soft hover:animate-pulse-faster relative overflow-hidden group"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Create Offer
              </Button>
              <p className="text-xs text-gray-400 mt-6 animate-blink">✨ Donate to make a difference ✨</p>
            </CardContent>
          </Card>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex justify-center items-center min-h-72">
          <Card className="text-center py-12 max-w-md w-full relative">
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="animate-spin-slow absolute inset-0 border-2 border-transparent border-t-blue-300 border-r-blue-300 rounded-full"></div>
                  <Filter className="h-16 w-16 text-gray-400 animate-bounce relative" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-fade-in">
                {statusFilter === "OPEN"
                  ? "No open donation offers"
                  : "No closed donation offers"}
              </h3>
              <p className="text-gray-600 mb-6 animate-fade-in">
                {statusFilter === "OPEN"
                  ? "You don't have any active offers right now."
                  : "You haven't closed any offers yet."}
              </p>
              <Button
                variant="outline"
                onClick={() => setStatusFilter("ALL")}
                className="animate-pulse-soft"
              >
                View All Offers
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{offer.medicine.name}</CardTitle>
                    {offer.medicine.genericName && (
                      <p className="text-xs text-gray-500 mt-1">({offer.medicine.genericName})</p>
                    )}
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {offer.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created {formatDate(offer.createdAt)}
                  </div>
                  {offer.expiry && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Expires {formatDate(offer.expiry)}
                    </div>
                  )}
                  {offer.notes && (
                    <p className="text-sm text-gray-500">Notes: {offer.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOffer(offer)}
                    disabled={offer.status !== "OPEN" || togglingOfferId === offer.id}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => toggleOfferStatus(offer)}
                    disabled={togglingOfferId === offer.id}
                    size="sm"
                    className={`flex-1 transition-all duration-200 text-white shadow-md hover:shadow-lg ${
                      offer.status === "OPEN"
                        ? "bg-primary hover:bg-tertiary"
                        : "bg-green hover:bg-[#1db34a]"
                    }`}
                  >
                    {togglingOfferId === offer.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : offer.status === "OPEN" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Fulfilled
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reopen
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Offer Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
        setIsFormDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent
          className="sm:max-w-[500px]"
          onPointerDownOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest("[data-city-dropdown]")) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest("[data-city-dropdown]")) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {formMode === "edit" ? "Edit Donation Offer" : "Create Donation Offer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="medicine">Medicine</Label>
              {medicines.length === 0 ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                  No medicines available
                </div>
              ) : (
                <MedicineAutocomplete
                  medicines={medicines}
                  value={medicineSearchTerm}
                  onChange={setMedicineSearchTerm}
                  onSelect={(medicine) => {
                    setSelectedMedicine(medicine);
                    setMedicineSearchTerm(medicine?.name ?? "");
                  }}
                  placeholder="Search for a medicine..."
                />
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              {LEBANON_CITIES.length === 0 ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                  No cities available
                </div>
              ) : (
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={city}
                  onChange={setCity}
                  placeholder="Select city..."
                  disablePortal
                />
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormDialogOpen(false);
                resetForm();
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit} disabled={formLoading} className="sm:ml-2">
              {formLoading
                ? formMode === "edit" ? "Saving..." : "Creating..."
                : formMode === "edit" ? "Save Changes" : "Create Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
