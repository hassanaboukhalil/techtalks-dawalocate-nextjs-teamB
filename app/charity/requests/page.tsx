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
        <PageTitle>
          {requestIdParam ? "Request Details" : "Medicine Requests"}
        </PageTitle>

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
                
                <CityAutocomplete
                  cities={cities}
                  value={cityFilter}
                  onChange={setCityFilter}
                  placeholder="All Cities"
                  className="pl-3"
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
      <div
        className="
          bg-white rounded-2xl overflow-hidden
          border border-[#2699B2]/30
          shadow-[0_10px_30px_rgba(38,153,178,0.18)]
        "
      >
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading requests...</p>
          </div>
        ) : (
          <>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <Table>
              <TableHeader
                className="
                  sticky top-0 z-10
                  shadow-[0_2px_0_0_rgba(38,153,178,0.15)]
                "
              >
                <TableRow
                  className="
                    bg-[#f4fbff]
                    border-b-[3px] border-[#2699B2]
                  "
                >
                   <TableHead
                      className="
                        h-14
                        text-left
                        align-middle
                        text-xs font-extrabold uppercase tracking-widest
                        text-[#2699B2]
                        bg-[#f4fbff]
                        px-6
                        border-r border-[#2699B2]/15
                      "
                    >
                      Medicine
                    </TableHead>

                    <TableHead className="h-14 text-left align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2] bg-[#f4fbff] px-6 border-r border-[#2699B2]/15">
                      Patient
                    </TableHead>

                    <TableHead className="h-14 text-left align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2] bg-[#f4fbff] px-6 border-r border-[#2699B2]/15">
                      Location
                    </TableHead>

                    <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2] bg-[#f4fbff] px-6 border-r border-[#2699B2]/15">
                      Status
                    </TableHead>

                    <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2] bg-[#f4fbff] px-6 border-r border-[#2699B2]/15">
                      Requested
                    </TableHead>

                    <TableHead className="h-14 text-center align-middle text-xs font-extrabold uppercase tracking-widest text-[#2699B2] bg-[#f4fbff] px-6">
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
                      <TableRow
                        key={request.id}
                        className="
                          group
                          border-b border-[#2699B2]/10
                          hover:bg-[#2699B2]/5
                          transition-colors
                        "
                      >
                        <TableCell className="px-6 text-left align-middle">
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
                        <TableCell className="px-6 text-left align-middle">
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
                        <TableCell className="px-6 text-left align-middle">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{request.city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="px-6 text-center align-middle">
                          <div className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 text-left align-middle">
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
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden">
            {selectedRequest && (
              <>
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-[#2699B2] to-[#1f8a9e] px-6 py-5 overflow-hidden">
                  {/* Decorative blur circles */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  
                  <div className="relative flex items-center gap-4">
                    {/* Frosted glass icon container */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        Request Details
                      </Dialog.Title>
                      <p className="text-white/80 text-sm">
                        Medicine request information
                      </p>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Medicine Information */}
                  <div className="bg-[#2699B2]/5 rounded-2xl p-4 border border-[#2699B2]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-[#2699B2]/10 rounded-lg">
                        <Package className="h-4 w-4 text-[#2699B2]" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Medicine Information</h3>
                    </div>
                    <div className="space-y-2 pl-8">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-28">Name:</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {selectedRequest.medicine.name}
                        </span>
                      </div>
                      {selectedRequest.medicine.genericName && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-28">Generic:</span>
                          <span className="text-sm text-gray-900">
                            {selectedRequest.medicine.genericName}
                          </span>
                        </div>
                      )}
                      {(selectedRequest.medicine.strength || selectedRequest.medicine.form) && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-28">Details:</span>
                          <span className="text-sm text-gray-900">
                            {[selectedRequest.medicine.strength, selectedRequest.medicine.form]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-slate-200 rounded-lg">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Patient Information</h3>
                    </div>
                    <div className="flex items-start gap-4 pl-8">
                      {/* Patient Avatar */}
                      <div className="flex-shrink-0 w-14 h-14 bg-[#2699B2]/10 rounded-full flex items-center justify-center border-2 border-[#2699B2]/20">
                        <User className="w-7 h-7 text-[#2699B2]" />
                      </div>
                      {/* Patient Details */}
                      <div className="flex-1 space-y-1.5">
                        <p className="font-semibold text-gray-900">{selectedRequest.user.name}</p>
                        {selectedRequest.user.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{selectedRequest.user.email}</span>
                          </div>
                        )}
                        {selectedRequest.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{selectedRequest.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{selectedRequest.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Status */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-slate-200 rounded-lg">
                        <Heart className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Request Status</h3>
                    </div>
                    <div className="space-y-3 pl-8">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">Requested:</span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(selectedRequest.createdAt)}
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-[#2699B2]/10 border border-[#2699B2]/20 rounded-xl">
                        <p className="text-sm text-gray-700">
                          As a charity, you can help coordinate medicine access for this patient.
                          Contact them directly or work with your pharmacy network.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 h-11 rounded-xl font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement contact/help functionality
                      alert("Contact functionality will be implemented here");
                    }}
                    className="flex-[2] h-11 rounded-xl font-semibold text-white bg-[#2699B2] hover:bg-[#1f7f94] transition-colors shadow-lg shadow-[#2699B2]/30 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Patient
                  </button>
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
