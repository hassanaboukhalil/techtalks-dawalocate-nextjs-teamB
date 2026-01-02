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
  Calendar,
  Heart,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { MedicineAutocomplete } from "@/components/ui/MedicineAutocomplete";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";

// --- INTERFACES ---
interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
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

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

function CharityRequestsContent() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DonationRequest[]>(
    []
  );
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter & Search State
  const [medicineSearch, setMedicineSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Medicine autocomplete data
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // City autocomplete data
  const [cities, setCities] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Modal State
  const [selectedRequest, setSelectedRequest] =
    useState<DonationRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get requestId from URL query parameter
  const requestIdParam = searchParams.get("requestId");

  // --- PAGINATION CONSTANTS ---
  const ITEMS_PER_PAGE = 20; // Reasonable page size for charity management

  // --- ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS ---

  // Fetch requests with pagination - charities can see OPEN requests to coordinate help
  useEffect(() => {
    const fetchRequests = async (page: number = 1) => {
      try {
        setIsLoadingPage(true);
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const params = new URLSearchParams({
          status: "OPEN",
          limit: ITEMS_PER_PAGE.toString(),
          offset: offset.toString(),
        });

        // Add separate search filters
        if (medicineSearch.trim()) {
          params.append("medicine", medicineSearch.trim());
        }
        if (patientSearch.trim()) {
          params.append("patient", patientSearch.trim());
        }
        if (cityFilter) {
          params.append("city", cityFilter);
        }

        const response = await axios.get(`/api/global/requests?${params}`);
        if (response.data.success) {
          setRequests(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
        setIsLoadingPage(false);
      }
    };

    fetchRequests(currentPage);
  }, [currentPage]); // Only refetch when page changes

  // Handle search and city filter changes - reset to page 1
  useEffect(() => {
    const fetchFilteredRequests = async () => {
      try {
        setIsLoadingPage(true);
        const params = new URLSearchParams({
          status: "OPEN",
          limit: ITEMS_PER_PAGE.toString(),
          offset: "0", // Always start from page 1 when filtering
        });

        // Add separate search filters
        if (medicineSearch.trim()) {
          params.append("medicine", medicineSearch.trim());
        }
        if (patientSearch.trim()) {
          params.append("patient", patientSearch.trim());
        }
        if (cityFilter) {
          params.append("city", cityFilter);
        }

        const response = await axios.get(`/api/global/requests?${params}`);
        if (response.data.success) {
          setRequests(response.data.data);
          setPagination(response.data.pagination);
          setCurrentPage(1); // Reset to page 1 when filtering
        }
      } catch (error) {
        console.error("Failed to fetch filtered requests:", error);
      } finally {
        setIsLoadingPage(false);
      }
    };

    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(fetchFilteredRequests, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineSearch, patientSearch, cityFilter]);

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

  // Update filtered requests when data changes (for local filtering if needed)
  useEffect(() => {
    setFilteredRequests(requests);
  }, [requests]);

  // Fetch medicines for autocomplete
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get("/api/global/medicines");
        if (response.data.success) {
          setMedicines(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };

    fetchMedicines();
  }, []);

  // Set cities for autocomplete
  useEffect(() => {
    setCities(LEBANON_CITIES);
  }, []);

  // --- PAGINATION HELPERS ---
  const totalPages = pagination
    ? Math.ceil(pagination.total / ITEMS_PER_PAGE)
    : 1;
  const hasNextPage = pagination?.hasMore || false;
  const hasPreviousPage = currentPage > 1;

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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
        <h1 className="text-h2 text-primary whitespace-nowrap">
          {requestIdParam ? "Request Details" : "Medicine Requests"}
        </h1>

        {/* Only show filters if not viewing a specific request */}
        {!requestIdParam && (
          <div className="flex flex-col gap-4">
            {/* Search Fields Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Medicine Search */}
              <div className="relative flex-1">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <MedicineAutocomplete
                  medicines={medicines}
                  value={medicineSearch}
                  onChange={setMedicineSearch}
                  placeholder="Search by medicine name..."
                  className="pl-10"
                />
              </div>

              {/* Patient Search */}
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="h-11 rounded-lg border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* City Filter */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <CityAutocomplete
                  cities={cities}
                  value={cityFilter}
                  onChange={setCityFilter}
                  placeholder="All Cities"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- PAGINATION INFO --- */}
      {!requestIdParam && pagination && (
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          <div>
            Showing{" "}
            {requests.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}{" "}
            to {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of{" "}
            {pagination.total} requests
          </div>
          <div className="text-xs">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* --- REQUESTS TABLE --- */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading requests...</p>
          </div>
        ) : (
          <>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
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
                    <TableHead className="bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Requested
                    </TableHead>
                    <TableHead className="text-center w-[120px] bg-gray-200 text-gray-900 font-bold text-sm uppercase tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableEmpty
                      message={
                        requestIdParam
                          ? "Request not found."
                          : isLoadingPage
                          ? "Loading..."
                          : medicineSearch || patientSearch || cityFilter
                          ? "No matching requests found."
                          : "No open medicine requests available yet."
                      }
                      icon={<Package className="h-10 w-10 text-gray-400" />}
                    />
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {request.medicine.name}
                            </span>
                            {request.medicine.genericName && (
                              <span className="text-sm text-gray-600">
                                {request.medicine.genericName}
                              </span>
                            )}
                            {(request.medicine.strength ||
                              request.medicine.form) && (
                              <span className="text-xs text-gray-500">
                                {[
                                  request.medicine.strength,
                                  request.medicine.form,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {request.user.name}
                            </span>
                            {request.user.email && (
                              <span className="text-sm text-gray-600">
                                {request.user.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{request.city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(request.status)}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {!requestIdParam && pagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <div className="text-sm text-gray-600">
                  {isLoadingPage ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    `Page ${currentPage} of ${totalPages}`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage || isLoadingPage}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isLoadingPage}
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
            window.history.replaceState({}, "", "/charity/requests");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
            {selectedRequest && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-h3 text-primary">
                    Request Details
                  </Dialog.Title>
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
                        <span className="text-sm font-medium text-gray-700">
                          Name:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {selectedRequest.medicine.name}
                        </span>
                      </div>
                      {selectedRequest.medicine.genericName && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Generic Name:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedRequest.medicine.genericName}
                          </span>
                        </div>
                      )}
                      {(selectedRequest.medicine.strength ||
                        selectedRequest.medicine.form) && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Details:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {[
                              selectedRequest.medicine.strength,
                              selectedRequest.medicine.form,
                            ]
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
                        <span className="text-sm font-medium text-gray-700">
                          Name:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {selectedRequest.user.name}
                        </span>
                      </div>
                      {selectedRequest.user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {selectedRequest.user.email}
                          </span>
                        </div>
                      )}
                      {selectedRequest.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {selectedRequest.user.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">
                          {selectedRequest.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Status & Charity Actions */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Request Status & Charity Actions
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Status:
                        </span>
                        <div className="mt-1">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Requested On:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(selectedRequest.createdAt)}
                        </span>
                      </div>
                      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                        <p className="text-sm text-gray-700 mb-2">
                          As a charity, you can help coordinate medicine access
                          for this patient.
                        </p>
                        <p className="text-xs text-gray-600">
                          Contact the patient directly or work with your network
                          of pharmacies and donors to fulfill this request.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <Button variant="outline">Close</Button>
                  </Dialog.Close>
                  <Button
                    variant="default"
                    onClick={() => {
                      // TODO: Implement contact/help functionality
                      alert("Contact functionality will be implemented here");
                    }}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Patient
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default function CharityRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CharityRequestsContent />
    </Suspense>
  );
}
