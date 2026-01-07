"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Search,
  Loader2,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  PackageCheck,
  PackageX,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { MedicineAutocomplete } from "@/components/ui/MedicineAutocomplete";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";

// --- INTERFACES ---
interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  synonyms?: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
}

interface DonationRequest {
  id: number;
  userId: number;
  medicineId: number;
  city: string;
  status: "OPEN" | "IN_PROGRESS" | "FULFILLED";
  createdAt: string;
  updatedAt: string;
  user: Patient;
  medicine: Medicine;
}

interface InventoryItem {
  id: number;
  pharmacyId: number;
  medicineId: number;
  quantity: number;
  status: "IN_STOCK" | "LOW" | "OUT";
  expiresAt: string | null;
  medicine: Medicine;
}

function PharmacyRequestsContent() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DonationRequest[]>([]);
  
  // Filter & Search State
  const [medicineSearch, setMedicineSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get requestId from URL query parameter
  const requestIdParam = searchParams.get("requestId");

  // --- ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS ---
  
  // Fetch requests and inventory - only OPEN requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsResponse, inventoryResponse, medicinesResponse] = await Promise.all([
          axios.get("/api/global/requests?status=OPEN"),
          axios.get("/api/pharmacy/inventory"),
          axios.get("/api/global/medicines"),
        ]);

        if (requestsResponse.data.success) {
          setRequests(requestsResponse.data.data);
        }
        if (inventoryResponse.data.success) {
          setInventory(inventoryResponse.data.data);
        }
        if (medicinesResponse.data.success) {
          setMedicines(medicinesResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle requestId query parameter - open modal for specific request
  useEffect(() => {
    if (requestIdParam && requests.length > 0) {
      const requestId = parseInt(requestIdParam);
      const foundRequest = requests.find((req) => req.id === requestId);
      if (foundRequest) {
        setSelectedRequest(foundRequest);
        setModalOpen(true);
      }
    }
  }, [requestIdParam, requests]);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = [...requests];

    // Always filter for OPEN status (already filtered from API, but double-check)
    filtered = filtered.filter((req) => req.status === "OPEN");

    // If requestId is in URL, filter to show only that request
    if (requestIdParam) {
      const requestId = parseInt(requestIdParam);
      filtered = filtered.filter((req) => req.id === requestId);
    }

    // Filter by city
    if (cityFilter) {
      filtered = filtered.filter((req) =>
        req.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    // Filter by medicine search
    if (medicineSearch) {
      const medicineLower = medicineSearch.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.medicine.name.toLowerCase().includes(medicineLower) ||
          req.medicine.genericName?.toLowerCase().includes(medicineLower)
      );
    }

    // Filter by patient search
    if (patientSearch) {
      const patientLower = patientSearch.toLowerCase();
      filtered = filtered.filter((req) =>
        req.user.name.toLowerCase().includes(patientLower)
      );
    }

    setFilteredRequests(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [requests, medicineSearch, patientSearch, cityFilter, requestIdParam]);

  // --- NOW CONDITIONAL RETURNS CAN HAPPEN AFTER ALL HOOKS ---
  
  // SESSION CHECKS
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper: Check if pharmacy has medicine in stock
  const canHelp = (medicineId: number): { canHelp: boolean; inventoryItem: InventoryItem | null } => {
    const inventoryItem = inventory.find(
      (item) => item.medicineId === medicineId && item.status === "IN_STOCK" && item.quantity > 0
    );
    return {
      canHelp: !!inventoryItem,
      inventoryItem: inventoryItem || null,
    };
  };

  // Helper: Get status badge
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
    const icons = {
      OPEN: Clock,
      IN_PROGRESS: AlertCircle,
      FULFILLED: CheckCircle2,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        <Icon className="h-3 w-3" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Helper: Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      {/* --- HEADER + FILTERS --- */}
      <div className="flex flex-col gap-6 mb-6">
        <PageTitle>
          {requestIdParam ? "Request Details" : "Patients Medicines Requests"}
        </PageTitle>

        {/* Only show filters if not viewing a specific request */}
        {!requestIdParam && (
          <div className="flex flex-col md:flex-row gap-4">
          {/* Medicine Search */}
          <div className="flex-1">
            <MedicineAutocomplete
              medicines={medicines}
              value={medicineSearch}
              onChange={setMedicineSearch}
              placeholder="Search by medicine name..."
            />
          </div>

          {/* Patient Search */}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* City Filter */}
          <div className="w-64">
            <CityAutocomplete
              cities={LEBANON_CITIES}
              value={cityFilter}
              onChange={setCityFilter}
              placeholder="Filter by city"
            />
          </div>
        </div>
        )}
      </div>

      {/* --- REQUESTS TABLE --- */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading requests...</p>
          </div>
        ) : (
          <>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow className="border-b-2 border-gray-300">
                    <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Medicine
                    </TableHead>
                    <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Patient
                    </TableHead>
                    <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Location
                    </TableHead>
                    <TableHead className="text-center bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="text-center bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Can Help
                    </TableHead>
                    <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Requested
                    </TableHead>
                    <TableHead className="text-center w-[120px] bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Calculate pagination
                    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

                    return paginatedRequests.length === 0 ? (
                      <TableEmpty
                        message={
                          requestIdParam
                            ? "Request not found."
                            : medicineSearch || patientSearch || cityFilter
                            ? "No matching requests found."
                            : "No open patient requests available yet."
                        }
                        icon={<Package className="h-10 w-10 text-gray-400" />}
                      />
                    ) : (
                      paginatedRequests.map((request) => {
                        const { canHelp: pharmacyCanHelp, inventoryItem } = canHelp(request.medicineId);
                        return (
                          <TableRow key={request.id} className="group">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{request.medicine.name}</span>
                                {request.medicine.genericName && (
                                  <span className="text-sm text-gray-600">{request.medicine.genericName}</span>
                                )}
                                {(request.medicine.strength || request.medicine.form) && (
                                  <span className="text-xs text-gray-500">
                                    {[request.medicine.strength, request.medicine.form]
                                      .filter(Boolean)
                                      .join(" • ")}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{request.user.name}</span>
                                {request.user.email && (
                                  <span className="text-sm text-gray-600">{request.user.email}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{request.city}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-center">
                              {pharmacyCanHelp ? (
                                <div className="flex flex-col items-center gap-1">
                                  <PackageCheck className="h-5 w-5 text-green-600" />
                                  <span className="text-xs font-semibold text-green-700">
                                    {inventoryItem?.quantity} in stock
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <PackageX className="h-5 w-5 text-red-600" />
                                  <span className="text-xs text-gray-500">Not available</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(request.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setModalOpen(true);
                                  }}
                                  className="text-xs"
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    );
                  })()}
                </TableBody>
              </Table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {!requestIdParam && filteredRequests.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRequests.length)} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{" "}
                  {filteredRequests.length} requests
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- REQUEST DETAILS MODAL --- */}
      <Dialog.Root 
        open={modalOpen} 
        onOpenChange={(open) => {
          setModalOpen(open);
          // Clear URL parameter when modal is closed
          if (!open && requestIdParam) {
            window.history.replaceState({}, "", "/pharmacy/requests");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
            {selectedRequest && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-h3 text-primary">Request Details</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <X size={24} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-6">
                  {/* Medicine Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Medicine Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.medicine.name}</span>
                      </div>
                      {selectedRequest.medicine.genericName && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Generic Name:</span>
                          <span className="ml-2 text-gray-900">
                            {selectedRequest.medicine.genericName}
                          </span>
                        </div>
                      )}
                      {(selectedRequest.medicine.strength || selectedRequest.medicine.form) && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Details:</span>
                          <span className="ml-2 text-gray-900">
                            {[selectedRequest.medicine.strength, selectedRequest.medicine.form]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Patient Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.user.name}</span>
                      </div>
                      {selectedRequest.user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{selectedRequest.user.email}</span>
                        </div>
                      )}
                      {selectedRequest.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{selectedRequest.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{selectedRequest.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Status & Availability */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Request Status
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Requested On:</span>
                        <span className="ml-2 text-gray-900">{formatDate(selectedRequest.createdAt)}</span>
                      </div>
                      {(() => {
                        const { canHelp: pharmacyCanHelp, inventoryItem } = canHelp(
                          selectedRequest.medicineId
                        );
                        return (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Your Inventory:</span>
                            <div className="mt-2">
                              {pharmacyCanHelp && inventoryItem ? (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                  <PackageCheck className="h-5 w-5 text-green-600" />
                                  <span className="text-sm font-semibold text-green-800">
                                    Available: {inventoryItem.quantity} units
                                  </span>
                                  {inventoryItem.expiresAt && (
                                    <span className="text-xs text-gray-600 ml-auto">
                                      Expires: {formatDate(inventoryItem.expiresAt)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                  <PackageX className="h-5 w-5 text-red-600" />
                                  <span className="text-sm text-red-800">
                                    Not available in your inventory
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <Button variant="outline">Close</Button>
                  </Dialog.Close>
                  {canHelp(selectedRequest.medicineId).canHelp && (
                    <Button
                      variant="default"
                      onClick={() => {
                        // TODO: Implement contact/help functionality
                        alert("Contact functionality will be implemented here");
                      }}
                    >
                      Contact Patient
                    </Button>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default function PharmacyRequestsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PharmacyRequestsContent />
    </Suspense>
  );
}
