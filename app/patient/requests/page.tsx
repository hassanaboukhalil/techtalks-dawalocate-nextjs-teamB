"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Pill, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Filter, 
  PackageSearch, // Different icon for requests
  Sparkles,
  ClipboardList
} from "lucide-react";
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
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTitle } from "@/components/layout/PageTitle";
import { Badge } from "@/components/ui/badge";

// --- Interfaces Preserved ---
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
  // --- State Preserved ---
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "FULFILLED">("ALL");

  const [formData, setFormData] = useState({
    medicine: "",
    city: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Logic Preserved ---
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

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "ALL") return true;
    return request.status === statusFilter;
  });

  const statusCounts = {
    ALL: requests.length,
    OPEN: requests.filter((r) => r.status === "OPEN").length,
    FULFILLED: requests.filter((r) => r.status === "FULFILLED").length,
  };

  const fetchMedicinesAndCities = async () => {
    try {
      const medicineRes = await fetch("/api/global/medicines");
      const medicineData = await medicineRes.json();
      if (medicineData.success) setMedicines(medicineData.data);
      setCities(LEBANON_CITIES);
    } catch (err) {
      console.error("Failed to load autocomplete data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
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

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        setError(`Request failed with status ${response.status}`);
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        await fetchRequests();
        setIsNewDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingRequestId(null);
        setFormData({ medicine: "", city: "", note: "" });
        setError(null);
      } else {
        setError(data.error || `Failed to ${editingRequestId ? "update" : "create"} request`);
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (request: Request) => {
    setEditingRequestId(request.id);
    setFormData({
      medicine: request.medicine.name,
      city: request.city,
      note: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (requestId: number) => {
    if (requestId == null || requestId === undefined) return;

    const idNumber = Number(requestId);
    if (isNaN(idNumber) || idNumber <= 0) return;

    const idString = String(idNumber);

    try {
      const url = `/api/patient/requests/${idString}`;
      const response = await fetch(url, { method: "DELETE" });
      
      if (!response.ok) {
        setError(`Delete failed with status ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setRequests(prev => prev.filter(req => req.id !== idNumber));
        setIsDeleteDialogOpen(false);
        setSelectedRequestId(null);
        setError(null);
      } else {
        setError(data.error || "Failed to delete request");
      }
    } catch (error) {
      setError("Network error occurred");
    }
  };

  const handleToggleStatus = async (request: Request) => {
    const newStatus = request.status === "OPEN" ? "FULFILLED" : "OPEN";
    
    setTogglingStatusId(request.id);
    try {
      const response = await fetch(`/api/patient/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        setError(`Failed to update status: ${response.status}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        await fetchRequests();
        setError(null);
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const resetForm = () => {
    setFormData({ medicine: "", city: "", note: "" });
    setEditingRequestId(null);
  };

  // --- UI Components ---
  const getStatusBadge = (status: string) => {
    if (status === "OPEN") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 gap-1.5 shadow-sm transition-all duration-300 hover:scale-105 cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-bold tracking-wide">Looking for</span>
        </Badge>
      );
    }
    if (status === "FULFILLED") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 gap-1.5 shadow-sm transition-all duration-300 hover:scale-105 cursor-default">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-bold tracking-wide">Fulfilled</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1">
        {status}
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
              {/*<div className="p-3 bg-amber-100 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="h-7 w-7 text-amber-600 group-hover:text-amber-700 transition-colors" />
              </div>*/}
              <PageTitle>My Requests</PageTitle>
                
              
            </div>
            <p className="text-slate-500 mt-1">
              Track the medicines you need. We'll help you find them.
            </p>
          </div>
          
          <Button
            onClick={() => setIsNewDialogOpen(true)}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/40 active:scale-95 font-semibold text-md h-12 px-6 rounded-xl"
          >
            <Plus className="h-5 w-5 mr-2 animate-pulse" />
            New Request
          </Button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-red-900">Action Required</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
          ) : requests.length === 0 ? (
            // LIVELY EMPTY STATE
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
                <div className="bg-white p-6 rounded-full shadow-lg relative z-10 animate-bounce-slow">
                  <PackageSearch className="h-12 w-12 text-amber-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No requests yet</h3>
              <p className="text-slate-500 max-w-md text-center mb-8 text-lg leading-relaxed">
                You haven't requested any medicines. <br/>
                <span className="text-amber-600 font-medium">Need something? Let us know.</span>
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsNewDialogOpen(true)}
                className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all hover:scale-105 active:scale-95 rounded-xl h-12 px-8 font-semibold"
              >
                Create your first request
              </Button>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-lg ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg">
                      <Filter className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filter Status</span>
                  </div>
                  
                  <div className="flex p-1.5 bg-slate-100/80 rounded-xl w-full sm:w-auto relative">
                    {(["ALL", "OPEN", "FULFILLED"] as const).map((status) => (
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
                          statusFilter === status ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {statusCounts[status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STAGGERED GRID */}
              {filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-500 animate-in fade-in zoom-in-95 duration-300">
                  <p className="font-medium text-lg">No {statusFilter.toLowerCase()} requests found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((request, index) => (
                    <div 
                      key={request.id}
                      className="animate-in slide-in-from-bottom-8 fade-in duration-500 fill-mode-backwards"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Card 
                        className={`group h-full flex flex-col overflow-hidden border-t-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                          request.status === 'OPEN' ? 'border-t-amber-500' : 'border-t-emerald-500'
                        }`}
                      >
                        <CardHeader className="pb-3 space-y-3 bg-white">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors duration-300">
                                {request.medicine.name}
                              </CardTitle>
                              {request.medicine.genericName && (
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                                    {request.medicine.genericName}
                                  </p>
                                </div>
                              )}
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm bg-slate-50/30 pt-5 flex-grow">
                          <div className="grid gap-3 text-slate-600">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                 <MapPin className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-slate-700">{request.city}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                 <Calendar className="h-4 w-4" />
                              </div>
                              <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-4 pb-5 px-5 gap-3 bg-white border-t border-slate-100 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(request)}
                            disabled={request.status !== "OPEN" || togglingStatusId === request.id}
                            className="flex-1 border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 active:scale-95 rounded-xl font-medium"
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            onClick={() => handleToggleStatus(request)}
                            disabled={togglingStatusId === request.id}
                            size="sm"
                            className={`flex-1 transition-all duration-300 active:scale-95 rounded-xl shadow-md hover:shadow-lg font-semibold ${
                              request.status === "OPEN" 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                : "bg-slate-800 hover:bg-slate-900 text-white"
                            }`}
                          >
                            {togglingStatusId === request.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : request.status === "OPEN" ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                Mark Found
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3.5 w-3.5 mr-2" />
                                Re-Open
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* New Request Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={(open) => {
        setIsNewDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent 
          className="sm:max-w-[550px] p-0 gap-0 overflow-visible bg-white border-none shadow-2xl rounded-3xl"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest("[data-city-dropdown]")) e.preventDefault();
          }}
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10  -mr-10 -mt-10 blur-2xl"></div>
            
            <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-3 text-white">
                 <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-lg border border-white/10">
                    <Plus className="h-6 w-6" />
                 </div>
                 Create Request
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2 font-medium">
                Tell us what you need, and we'll broadcast it to potential donors.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-7 bg-slate-50/50">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <Pill className="h-4 w-4 text-amber-600" />
                 Medicine Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative shadow-sm">
                <MedicineAutocomplete
                  medicines={medicines}
                  value={formData.medicine ?? ""}
                  onChange={(value) => setFormData({ ...formData, medicine: value })}
                  placeholder="Search medicine by name..."
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <MapPin className="h-4 w-4 text-amber-600" />
                 Preferred City
              </Label>
              <CityAutocomplete
                cities={cities}
                value={formData.city ?? ""}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="Select your city..."
                className="w-full shadow-sm"
              />
            </div>
            
            <div className="p-6 flex flex-row-reverse gap-3 border-t border-slate-100 -mx-8 -mb-8 rounded-b-3xl bg-white mt-4">
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 transition-all hover:scale-105 active:scale-95 min-w-[140px] rounded-xl h-11 font-bold tracking-wide">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setIsNewDialogOpen(false); resetForm(); }} className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 rounded-xl h-11 px-6 font-medium hover:text-slate-900">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent 
          className="sm:max-w-[550px] p-0 gap-0 overflow-visible bg-white border-none shadow-2xl "
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest("[data-city-dropdown]")) e.preventDefault();
          }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
            <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-3 text-white">
                 <div className="p-2.5 bg-white/20 backdrop-blur-md shadow-lg border border-white/10">
                    <Edit className="h-6 w-6" />
                 </div>
                 Edit Request
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-7 bg-slate-50/50">
            {/* Same form fields as Create */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <Pill className="h-4 w-4 text-blue-600" />
                 Medicine Name <span className="text-red-500">*</span>
              </Label>
              <MedicineAutocomplete
                medicines={medicines}
                value={formData.medicine ?? ""}
                onChange={(value) => setFormData({ ...formData, medicine: value })}
                placeholder="Search medicine by name..."
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                 <MapPin className="h-4 w-4 text-blue-600" />
                 City
              </Label>
              <CityAutocomplete
                cities={cities}
                value={formData.city ?? ""}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="Select your city..."
              />
            </div>

            <div className="p-6 flex flex-row-reverse gap-3 border-t border-slate-100 -mx-8 -mb-8 rounded-b-3xl bg-white mt-4">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 min-w-[140px] rounded-xl h-11 font-bold tracking-wide">
                {submitting ? "Updating..." : "Update Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }} className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 rounded-xl h-11 px-6 font-medium">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setSelectedRequestId(null);
      }}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-900">Delete Request?</DialogTitle>
            <DialogDescription className="text-red-700 font-medium">
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </div>
          <div className="p-6 bg-white flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 font-medium"
              onClick={() => { setIsDeleteDialogOpen(false); setSelectedRequestId(null); }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              onClick={() => {
                if (selectedRequestId) handleDelete(selectedRequestId);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}