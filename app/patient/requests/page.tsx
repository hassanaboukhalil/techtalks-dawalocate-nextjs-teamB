"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Pill, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { MedicineAutocomplete } from "@/components/ui/MedicineAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
}

interface Request {
  id: number;
  city: string;
  status: "OPEN" | "IN_PROGRESS" | "FULFILLED";
  createdAt: string;
  updatedAt?: string;
  medicine: Medicine;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default function PatientRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete data
  const [medicines, setMedicines] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Dialog states
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    medicine: "",
    city: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patient/requests");
      const data: ApiResponse<Request[]> = await response.json();

      if (data.success && data.data) {
        setRequests(data.data);
      } else {
        setError(data.error || "Failed to fetch requests");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchMedicinesAndCities();
  }, []);

  // Fetch medicines and cities
  const fetchMedicinesAndCities = async () => {
    try {
      // Fetch medicines
      const medicineRes = await fetch("/api/global/medicines");
      const medicineData = await medicineRes.json();
      if (medicineData.success) {
        setMedicines(medicineData.data);
      }

      // Set cities from constant
      setCities(LEBANON_CITIES);
    } catch (err) {
      console.error("Failed to load autocomplete data:", err);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-800 border-blue-200",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FULFILLED: "bg-green-100 text-green-800 border-green-200",
    };
    const labels = {
      OPEN: "Open",
      IN_PROGRESS: "In Progress",
      FULFILLED: "Fulfilled",
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ensure we have a valid ID for edit operations
      if (editingRequestId && (editingRequestId <= 0 || isNaN(editingRequestId))) {
        setError("Invalid request ID");
        return;
      }

      const url = editingRequestId
        ? `/api/patient/requests/${editingRequestId}`
        : "/api/patient/requests";

      const method = editingRequestId ? "PUT" : "POST";

      const body = {
        medicines: [{
          name: formData.medicine,
          city: formData.city,
        }],
        notes: formData.note,
      };

      console.log("Request method:", method);
      console.log("Request URL:", url);
      console.log("Request body:", JSON.stringify(body));

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Response not OK. Status:", response.status, "Body:", text);
        setError(`Request failed with status ${response.status}`);
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log("Form submission response:", data);
      console.log("Response full object:", JSON.stringify(data, null, 2));
      console.log("Is edit operation:", editingRequestId !== null);

      if (data.success) {
        console.log("Success! Refreshing requests...");
        await fetchRequests(); // Refresh the list
        setIsNewDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingRequestId(null);
        setFormData({ medicine: "", city: "", note: "" });
        setError(null); // Clear any error banner
      } else {
        console.error("Request failed:", data.error);
        console.error("Error details:", data.details);
        setError(data.error || `Failed to ${editingRequestId ? "update" : "create"} request`);
      }
    } catch (error) {
      console.error("Network/Parse error:", error);
      setError("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (request: Request) => {
    setEditingRequestId(request.id);
    setFormData({
      medicine: request.medicine.name,
      city: request.city,
      note: "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (requestId: number) => {
    console.log("handleDelete called with ID:", requestId, "Type:", typeof requestId);

    // Additional validation and type checking
    if (requestId == null || requestId === undefined) {
      console.error("Request ID is null or undefined:", requestId);
      setError("Invalid request ID for deletion");
      return;
    }

    const idNumber = Number(requestId);
    if (isNaN(idNumber) || idNumber <= 0) {
      console.error("Request ID is not a valid positive number:", requestId, "Converted:", idNumber);
      setError("Invalid request ID for deletion");
      return;
    }

    const idString = String(idNumber);
    console.log("Final ID string for URL:", idString);

    // Double-check that idString is not "undefined" or "null"
    if (idString === "undefined" || idString === "null" || idString === "") {
      console.error("idString is invalid:", idString);
      setError("Invalid request ID for deletion");
      return;
    }

    try {
      const url = `/api/patient/requests/${idString}`;
      console.log("Making DELETE request to:", url);
      console.log("URL components check - idString:", idString, "URL:", url);
      const response = await fetch(url, {
        method: "DELETE",
      });

      console.log("DELETE response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("DELETE Response not OK. Status:", response.status, "Body:", text);
        setError(`Delete failed with status ${response.status}`);
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      console.log("DELETE response data:", data);

      if (data.success) {
        console.log("Delete successful, removing from local state");
        // Remove the deleted request from local state
        setRequests(prev => prev.filter(req => req.id !== idNumber));
        setIsDeleteDialogOpen(false);
        setSelectedRequestId(null);
        setError(null); // Clear any error banner
      } else {
        console.error("Delete failed:", data.error);
        setError(data.error || "Failed to delete request");
      }
    } catch (error) {
      console.error("Delete network error:", error);
      setError("Network error occurred");
    }
  };

  // Reset form when dialogs close
  const resetForm = () => {
    setFormData({ medicine: "", city: "", note: "" });
    setEditingRequestId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Medicine Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage your medicine requests and track their status
          </p>
        </div>
        <Button
          onClick={() => setIsNewDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

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

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex justify-center items-center min-h-96">
          <Card className="text-center py-16 max-w-md w-full relative overflow-hidden">
            {/* Animated background elements */}
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
                No requests yet
              </h3>
              <p className="text-gray-600 mb-2 animate-fade-in">
                Your medicine cabinet is feeling lonely...
              </p>
              <p className="text-gray-500 mb-8 animate-fade-in text-sm">
                Let's change that!
              </p>

              <Button 
                onClick={() => setIsNewDialogOpen(true)}
                className="animate-pulse-soft hover:animate-pulse-faster relative overflow-hidden group"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Create Request
              </Button>

              <p className="text-xs text-gray-400 mt-6 animate-blink">✨ Click here to get started ✨</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.medicine.name}</CardTitle>
                    {request.medicine.genericName && (
                      <p className="text-xs text-gray-500 mt-1">({request.medicine.genericName})</p>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {request.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  {request.medicine.genericName && (
                    <p className="text-sm text-gray-500">
                      Generic: {request.medicine.genericName}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(request)}
                    disabled={request.status !== "OPEN"}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("Delete button clicked on card, request ID:", request.id, "Type:", typeof request.id);
                      if (request.id && typeof request.id === 'number' && request.id > 0) {
                        setSelectedRequestId(request.id);
                        setIsDeleteDialogOpen(true);
                      } else {
                        console.error("Invalid request ID from card:", request.id);
                        setError("Invalid request selected for deletion");
                      }
                    }}
                    disabled={request.status !== "OPEN"}
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

      {/* New Request Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={(open) => {
        setIsNewDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Medicine Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="medicine">Medicine Name</Label>
                <MedicineAutocomplete
                  medicines={medicines}
                  value={formData.medicine ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, medicine: value })
                  }
                  placeholder="Search medicine by name..."
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <CityAutocomplete
                  cities={cities}
                  value={formData.city ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                  placeholder="Select your city..."
                />
              </div>

            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medicine Request</DialogTitle>
          </DialogHeader>
          {editingRequestId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-700">
                <Calendar className="inline h-4 w-4 mr-1" />
                Created: {requests.find(r => r.id === editingRequestId) && 
                  new Date(requests.find(r => r.id === editingRequestId)!.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-medicine">Medicine Name <span className="text-red-500">*</span></Label>
                <MedicineAutocomplete
                  medicines={medicines}
                  value={formData.medicine ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, medicine: value })
                  }
                  placeholder="Search medicine by name..."
                />
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <CityAutocomplete
                  cities={cities}
                  value={formData.city ?? ""}
                  onChange={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                  placeholder="Select your city..."
                />
              </div>

            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setSelectedRequestId(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this medicine request? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedRequestId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                console.log("Delete button clicked with ID:", selectedRequestId, "Type:", typeof selectedRequestId);
                if (selectedRequestId) {
                  console.log("Calling handleDelete with:", selectedRequestId);
                  handleDelete(selectedRequestId);
                } else {
                  console.error("selectedRequestId is null/undefined when delete button clicked");
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!selectedRequestId}
            >
              Delete Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
