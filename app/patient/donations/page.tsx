"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  Calendar,
  MapPin,
  Pill,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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

// Reusable confirmation modal component
interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  onCancel,
  onConfirm,
  loading,
}: ConfirmActionModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">{description}</p>
        <div className="flex justify-end gap-3 mt-6 pointer-events-auto">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={loading}
            className="text-red-600 hover:text-red-700"
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  // Form states
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
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
        city: city.trim(),
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
      setIsCreateDialogOpen(false);
      resetForm();
      fetchOffers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const closeOffer = async (offerId: number) => {
    try {
      setFormLoading(true);
      setError(null);

      const response = await fetch(`/api/patient/donation-offers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      const result: ApiResponse<DonationOffer> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to close donation offer");
      }

      setSuccessMessage(
        result.message || "Donation offer closed successfully!"
      );
      setIsCloseDialogOpen(false);
      setSelectedOfferId(null);
      fetchOffers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteOffer = async (offerId: number) => {
    try {
      setFormLoading(true);
      setError(null);

      const response = await fetch(`/api/patient/donation-offers/${offerId}`, {
        method: "DELETE",
      });

      const result: ApiResponse<{ deletedId: number; medicineName: string }> =
        await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete donation offer");
      }

      setSuccessMessage(
        result.message || "Donation offer deleted successfully!"
      );
      setIsDeleteDialogOpen(false);
      setSelectedOfferId(null);
      fetchOffers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setMedicineSearchTerm("");
    setSelectedMedicine(null);
    setCity("");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading donation offers...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Donation Offers
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage your medicine donation offers for charities
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No donation offers yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first donation offer to help charities with medicine
              donations
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {offer.medicine.name}
                  </CardTitle>
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
                    <p className="text-sm text-gray-500 mt-2">{offer.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {offer.status === "OPEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOfferId(offer.id);
                        setIsCloseDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOfferId(offer.id);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Offer Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Donation Offer</DialogTitle>
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
                  onSelect={(medicine) => setSelectedMedicine(medicine)}
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
                />
              )}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={createOffer}
              disabled={formLoading}
              className="sm:ml-2"
            >
              {formLoading ? "Creating..." : "Create Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Offer Confirmation Modal */}
      <ConfirmActionModal
        open={isCloseDialogOpen}
        title="Close Donation Offer"
        description="Are you sure you want to close this donation offer? This will mark it as no longer available for charities to view."
        confirmLabel="Yes, Close Offer"
        confirmVariant="default"
        onCancel={() => {
          setIsCloseDialogOpen(false);
          setSelectedOfferId(null);
        }}
        onConfirm={() => selectedOfferId && closeOffer(selectedOfferId)}
        loading={formLoading}
      />

      {/* Delete Offer Confirmation Modal */}
      <ConfirmActionModal
        open={isDeleteDialogOpen}
        title="Delete Donation Offer"
        description="Are you sure you want to delete this donation offer? This action cannot be undone."
        confirmLabel="Yes, Delete Offer"
        confirmVariant="destructive"
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOfferId(null);
        }}
        onConfirm={() => {
          if (selectedOfferId) {
            deleteOffer(selectedOfferId);
          }
        }}
        loading={formLoading}
      />
    </div>
  );
}
