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
    Stethoscope,
    Pill,
    X
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
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
  } from "@/components/ui/dialog";
  
  import { LEBANON_CITIES } from "@/constants/lebanon-cities";
  import { cn } from "@/lib/utils";

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
    const [itemsPerPage] = useState(20); 

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Get requestId from URL query parameter
    const requestIdParam = searchParams.get("requestId");

    // --- HOOKS ---
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [requestsResponse, inventoryResponse, medicinesResponse] = await Promise.all([
            axios.get("/api/global/requests?status=OPEN"),
            axios.get("/api/pharmacy/inventory"),
            axios.get("/api/global/medicines"),
          ]);

          if (requestsResponse.data.success) setRequests(requestsResponse.data.data);
          if (inventoryResponse.data.success) setInventory(inventoryResponse.data.data);
          if (medicinesResponse.data.success) setMedicines(medicinesResponse.data.data);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

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

    useEffect(() => {
      let filtered = [...requests];
      filtered = filtered.filter((req) => req.status === "OPEN");

      if (requestIdParam) {
        const requestId = parseInt(requestIdParam);
        filtered = filtered.filter((req) => req.id === requestId);
      }

      if (cityFilter) {
        filtered = filtered.filter((req) =>
          req.city.toLowerCase().includes(cityFilter.toLowerCase())
        );
      }

      if (medicineSearch) {
        const medicineLower = medicineSearch.toLowerCase();
        filtered = filtered.filter(
          (req) =>
            req.medicine.name.toLowerCase().includes(medicineLower) ||
            req.medicine.genericName?.toLowerCase().includes(medicineLower)
        );
      }

      if (patientSearch) {
        const patientLower = patientSearch.toLowerCase();
        filtered = filtered.filter((req) =>
          req.user.name.toLowerCase().includes(patientLower)
        );
      }

      setFilteredRequests(filtered);
      setCurrentPage(1);
    }, [requests, medicineSearch, patientSearch, cityFilter, requestIdParam]);

    // --- HELPERS ---
    const canHelp = (medicineId: number): { canHelp: boolean; inventoryItem: InventoryItem | null } => {
      const inventoryItem = inventory.find(
        (item) => item.medicineId === medicineId && item.status === "IN_STOCK" && item.quantity > 0
      );
      return {
        canHelp: !!inventoryItem,
        inventoryItem: inventoryItem || null,
      };
    };

    const getStatusBadge = (status: string) => {
      const styles = {
        OPEN: "bg-blue-50 text-blue-700 border-blue-200",
        IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
        FULFILLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
      const labels = {
        OPEN: "Open Request",
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
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm", styles[status as keyof typeof styles])}>
          <Icon className="h-3.5 w-3.5" />
          {labels[status as keyof typeof labels] || status}
        </span>
      );
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    if (sessionStatus === "loading") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      );
    }
    <style jsx global>{`
      @keyframes headerGlow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    
      .table-header-alive {
        background-size: 200% 200%;
        animation: headerGlow 6s ease-in-out infinite;
      }
    `}</style>
    

    return (
      
      <div className="p-8 max-w-[1800px] mx-auto min-h-screen bg-slate-50/50 animate-in fade-in duration-700">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-8 mb-10">
          <div className="space-y-1">
            <PageTitle>Patient Requests</PageTitle>
              
            
            <p className="text-slate-500 text-lg font-medium">
              Match your inventory with patients in need.
            </p>
          </div>

          {/* --- FILTERS --- */}
          {!requestIdParam && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Medicine Search - No extra wrapper, component handles style */}
              <div className="md:col-span-5">
                <MedicineAutocomplete
                  medicines={medicines}
                  value={medicineSearch}
                  onChange={setMedicineSearch}
                  placeholder="Search by medicine name..."
                />
              </div>

              {/* Patient - Kept User icon as it is standard input */}

              <div className="md:col-span-4 relative group">

                  <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 h-12 flex items-center px-4 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">

                    <User className="h-4 w-4 text-slate-400 mr-3 shrink-0" />

                    <input

                      className="w-full h-full outline-none text-slate-700 placeholder:text-slate-400 bg-transparent text-sm font-medium"

                      placeholder="Search by patient name..."

                      value={patientSearch}

                      onChange={(e) => setPatientSearch(e.target.value)}

                    />

                  </div>

              </div>

              {/* City Filter - No extra wrapper, component handles style */}
              <div className="md:col-span-3">
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

        {/* --- TABLE --- */}
        <div className="relative rounded-2xl border border-[#2699B2] bg-white shadow-[0_6px_18px_rgba(38,153,178,0.14)]">


          
          <div className="relative bg-white rounded-[1.45rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
              <p>Loading requests...</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-x-auto">
                <Table>
                <TableHeader className="sticky top-0 z-10 shadow-[0_2px_0_0_rgba(38,153,178,0.15)]">

                    <TableRow
                      className="
                        bg-[#f4fbff]
                        border-b-[4px] border-[#2699B2]
                      "
                    >
                      <TableHead className="pl-8 h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Medicine
                      </TableHead>
                      <TableHead className="h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Patient
                      </TableHead>
                      <TableHead className="h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2]">
                        Location
                      </TableHead>
                      <TableHead className="h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2] text-center">
                        Status
                      </TableHead>
                      <TableHead className="h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2] text-center">
                        Availability
                      </TableHead>
                      <TableHead className="h-14 border-r border-[#2699B2]/15 text-xs font-extrabold uppercase tracking-widest text-[#2699B2] text-right pr-8">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>


                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableEmpty
                        message="No matching requests found."
                        icon={<PackageX className="h-12 w-12 text-slate-300 mb-3" />}
                      />
                    ) : (
                      (() => {
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

                        return paginatedRequests.map((request) => {
                          const { canHelp: pharmacyCanHelp, inventoryItem } = canHelp(request.medicineId);
                          
                          return (
                            <TableRow 
                              key={request.id} 
                              // ✨ Colored Border Logic: Green if stock available, Transparent/Gray if not
                              className={cn(
                                "group border-b border-slate-50 last:border-0 h-20 hover:bg-slate-50/50 transition-all border-l-4",
                                pharmacyCanHelp ? "border-l-emerald-500" : "border-l-transparent hover:border-l-slate-300"
                              )}
                            >
                              <TableCell className="pl-8">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-slate-800 text-base">{request.medicine.name}</span>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    {request.medicine.genericName && (
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                        {request.medicine.genericName}
                                      </span>
                                    )}
                                    {(request.medicine.strength || request.medicine.form) && (
                                      <span className="text-slate-400">
                                        {[request.medicine.strength, request.medicine.form].filter(Boolean).join(" • ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 text-sm">{request.user.name}</span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(request.createdAt)}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-1.5 text-slate-600 font-medium text-sm">
                                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                  {request.city}
                                </div>
                              </TableCell>

                              <TableCell className="text-center">
                                {getStatusBadge(request.status)}
                              </TableCell>

                              <TableCell className="text-center">
                                {pharmacyCanHelp ? (
                                  <div className="inline-flex flex-col items-center justify-center py-1 px-2 bg-emerald-50 border border-emerald-100 rounded-lg min-w-[90px]">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-xs font-bold text-emerald-700">In Stock</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600/70 mt-0.5">
                                      {inventoryItem?.quantity} Units
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center gap-1.5 py-1 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 min-w-[90px]">
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold">No Stock</span>
                                  </div>
                                )}
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
                        });
                      })()
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* --- PAGINATION --- */}
              {!requestIdParam && filteredRequests.length > itemsPerPage && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Page {currentPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100 h-8 text-xs font-bold"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                      className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100 h-8 text-xs font-bold"
                    >
                      Next <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* --- MODAL --- */}
        {/* --- MODAL --- */}
<Dialog
  open={modalOpen}
  onOpenChange={(open) => {
    setModalOpen(open);
    if (!open && requestIdParam) {
      window.history.replaceState({}, "", "/pharmacy/requests");
    }
  }}
>
  <DialogContent className="p-0 overflow-hidden max-w-xl">

    {selectedRequest && (
      <>
        {/* ===== HEADER ===== */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white overflow-hidden">
          <Stethoscope className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 rotate-12" />

          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-extrabold tracking-tight">
              Request Details
            </DialogTitle>
            <DialogDescription className="text-indigo-100">
              Request ID #{selectedRequest.id}
            </DialogDescription>
          </DialogHeader>

          <DialogClose asChild>
            <button className="absolute top-4 right-4 rounded-full bg-white/20 hover:bg-white/30 p-2 transition">
              <X className="h-4 w-4 text-white" />
            </button>
          </DialogClose>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Medicine */}
          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Medicine
              </h4>
              <div className="text-lg font-bold text-slate-800">
                {selectedRequest.medicine.name}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {selectedRequest.medicine.genericName && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded">
                    {selectedRequest.medicine.genericName}
                  </span>
                )}
                {(selectedRequest.medicine.strength || selectedRequest.medicine.form) && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    {[selectedRequest.medicine.strength, selectedRequest.medicine.form]
                      .filter(Boolean)
                      .join(" - ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Patient */}
          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-slate-500" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                  Patient
                </h4>
                <div className="text-base font-bold text-slate-800">
                  {selectedRequest.user.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {selectedRequest.city}
                </div>

                {selectedRequest.user.phone && (
                  <div className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    {selectedRequest.user.phone}
                  </div>
                )}

                <div className="col-span-2 flex items-center gap-2 text-sm bg-slate-50 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Requested on {formatDate(selectedRequest.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          {(() => {
            const { canHelp: pharmacyCanHelp, inventoryItem } =
              canHelp(selectedRequest.medicineId);

            return (
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4",
                  pharmacyCanHelp
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-rose-50 border-rose-100"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    pharmacyCanHelp ? "bg-emerald-100" : "bg-rose-100"
                  )}
                >
                  {pharmacyCanHelp ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>

                <div>
                  <h4
                    className={cn(
                      "font-bold text-sm",
                      pharmacyCanHelp ? "text-emerald-800" : "text-rose-800"
                    )}
                  >
                    {pharmacyCanHelp
                      ? "Match Found in Inventory"
                      : "Not Available in Stock"}
                  </h4>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      pharmacyCanHelp ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {pharmacyCanHelp
                      ? `You have ${inventoryItem?.quantity} units. Expiry: ${
                          inventoryItem?.expiresAt
                            ? formatDate(inventoryItem.expiresAt)
                            : "N/A"
                        }`
                      : "You do not have this exact medicine."}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ===== FOOTER ===== */}
        <DialogFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="font-bold">
              Close
            </Button>
          </DialogClose>

          {canHelp(selectedRequest.medicineId).canHelp && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
              Contact Patient
            </Button>
          )}
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>

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