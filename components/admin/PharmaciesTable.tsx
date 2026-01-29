"use client";

import { useState } from "react";
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
import {
  Check,
  X,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
  Package,
  Truck,
  Ban,
  Store,
  Phone,
  Activity,
  Layers,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewPharmacyDialog } from "./ViewPharmacyDialog";
import { ApproveRejectDialog } from "./ApproveRejectDialog";

/* ===================== TYPES (UNCHANGED) ===================== */

interface Pharmacy {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  medicineCount: number;
}

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface PharmaciesTableProps {
  pharmacies: Pharmacy[];
  loading: boolean;
  pagination: PaginationData;
  onPageChange: (offset: number) => void;
  onRefresh: () => void;
}

/* ===================== COMPONENT ===================== */

export function PharmaciesTable({
  pharmacies,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}: PharmaciesTableProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleView = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setViewDialogOpen(true);
  };

  const handleApprove = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setApproveDialogOpen(true);
  };

  const handleReject = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async (reason?: string) => {
    if (!selectedPharmacy) return;
    try {
      setActionLoading(selectedPharmacy.id);
      const res = await fetch("/api/admin/pharmacies/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacyId: selectedPharmacy.id, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      onRefresh();
      setApproveDialogOpen(false);
      setSelectedPharmacy(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason?: string) => {
    if (!selectedPharmacy) return;
    try {
      setActionLoading(selectedPharmacy.id);
      const res = await fetch("/api/admin/pharmacies/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacyId: selectedPharmacy.id, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      onRefresh();
      setRejectDialogOpen(false);
      setSelectedPharmacy(null);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Pharmacy["status"]) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
    };
    const dots = {
      PENDING: "bg-amber-500",
      APPROVED: "bg-emerald-500",
      REJECTED: "bg-rose-500",
    };
    return (
      <Badge
        variant="outline"
        className={`${styles[status]} pl-2 pr-3 py-1 shadow-sm`}
      >
        <span
          className={`mr-2 h-1.5 w-1.5 rounded-full ${dots[status]} animate-pulse`}
        />
        {status}
      </Badge>
    );
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-4 w-full">
      {/* ✅ BORDER FIXED HERE */}
      <div className="rounded-xl ring-1 ring-slate-200/70 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1000px] border-collapse">
            <TableHeader className="bg-slate-50/90 sticky top-0 z-10">
              <TableRow className="border-b border-slate-200">
                <TableHead className="pl-6 w-[300px]">
                  <Header icon={Store} label="Pharmacy Profile" />
                </TableHead>
                <TableHead>
                  <Header icon={MapPin} label="Location" />
                </TableHead>
                <TableHead>
                  <Header icon={Phone} label="Contact" />
                </TableHead>
                {/* <TableHead><Header icon={Truck} label="Services" /></TableHead> */}
                <TableHead>
                  <Header icon={Package} label="Inventory" />
                </TableHead>
                <TableHead>
                  <Header icon={Activity} label="Status" />
                </TableHead>
                <TableHead className="text-right pr-6">
                  <Header icon={Settings2} label="Actions" align="right" />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  </TableCell>
                </TableRow>
              ) : pharmacies.length === 0 ? (
                <TableEmpty
                  message="No pharmacies found"
                  icon={<AlertCircle className="h-10 w-10" />}
                />
              ) : (
                pharmacies.map((pharmacy) => (
                  <TableRow
                    key={pharmacy.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <TableCell className="pl-6">
                      <div className="font-bold ">{pharmacy.name}</div>
                      <div className="text-sm text-slate-500">
                        {pharmacy.email}
                      </div>
                    </TableCell>
                    <TableCell>{pharmacy.city ?? "—"}</TableCell>
                    <TableCell className="font-mono">
                      {pharmacy.phone?.replaceAll(" ", "") ?? "—"}
                    </TableCell>
                    {/* <TableCell>
                      {pharmacy.hasDelivery ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">Delivery</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">Pickup Only</Badge>
                      )}
                    </TableCell> */}
                    <TableCell className="font-bold">
                      {pharmacy.medicineCount}
                    </TableCell>
                    <TableCell>{getStatusBadge(pharmacy.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Action
                          icon={Eye}
                          onClick={() => handleView(pharmacy)}
                        />
                        {pharmacy.status !== "APPROVED" && (
                          <Action
                            icon={Check}
                            loading={actionLoading === pharmacy.id}
                            onClick={() => handleApprove(pharmacy)}
                            color="emerald"
                          />
                        )}
                        {pharmacy.status !== "REJECTED" && (
                          <Action
                            icon={X}
                            loading={actionLoading === pharmacy.id}
                            onClick={() => handleReject(pharmacy)}
                            color="rose"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINATION (UNCHANGED) */}
      <div className="flex justify-between items-center px-1 text-sm">
        <span className="text-slate-500">
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.offset === 0}
            onClick={() => onPageChange(pagination.offset - pagination.limit)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => onPageChange(pagination.offset + pagination.limit)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedPharmacy && (
        <>
          <ViewPharmacyDialog
            pharmacy={selectedPharmacy}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <ApproveRejectDialog
            item={selectedPharmacy}
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            onConfirm={handleApproveConfirm}
            action="approve"
            type="pharmacy"
          />
          <ApproveRejectDialog
            item={selectedPharmacy}
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            onConfirm={handleRejectConfirm}
            action="reject"
            type="pharmacy"
          />
        </>
      )}
    </div>
  );
}

/* ===================== UI HELPERS ===================== */

function Header({ icon: Icon, label, align = "left" }: any) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {label}
    </div>
  );
}

function Action({ icon: Icon, onClick, loading, color = "indigo" }: any) {
  const map: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={`h-8 w-8 border shadow-sm ${map[color]}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );
}
