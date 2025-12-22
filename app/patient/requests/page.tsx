"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Pill, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    quantity: 1,
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
  }, []);

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
          quantity: formData.quantity,
        }],
        notes: "",
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await fetchRequests(); // Refresh the list
        setIsNewDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingRequestId(null);
        setFormData({ medicine: "", city: "", quantity: 1 });
        setError(null); // Clear any error banner
      } else {
        setError(data.error || `Failed to ${editingRequestId ? "update" : "create"} request`);
      }
    } catch {
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
      quantity: 1, // Default since quantity isn't stored
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
    setFormData({ medicine: "", city: "", quantity: 1 });
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
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first medicine request to get started
            </p>
            <Button onClick={() => setIsNewDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{request.medicine.name}</CardTitle>
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
                <Input
                  id="medicine"
                  placeholder="e.g., Paracetamol, Ibuprofen"
                  value={formData.medicine}
                  onChange={(e) =>
                    setFormData({ ...formData, medicine: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity Needed</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                  required
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-medicine">Medicine Name</Label>
                <Input
                  id="edit-medicine"
                  placeholder="e.g., Paracetamol, Ibuprofen"
                  value={formData.medicine}
                  onChange={(e) =>
                    setFormData({ ...formData, medicine: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity Needed</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                  required
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
        {isDeleteDialogOpen && (
          <div style={{ display: 'none' }}>
            {/* Debug: Log selectedRequestId when dialog opens */}
            {console.log("Delete dialog opened with selectedRequestId:", selectedRequestId)}
          </div>
        )}
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
