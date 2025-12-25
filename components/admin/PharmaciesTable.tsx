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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewPharmacyDialog } from "./ViewPharmacyDialog";
import { ApproveRejectDialog } from "./ApproveRejectDialog";

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

export function PharmaciesTable({
  pharmacies,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}: PharmaciesTableProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null
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
      const response = await fetch("/api/admin/pharmacies/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: selectedPharmacy.id,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve pharmacy");
      }

      if (data.success) {
        onRefresh();
        setApproveDialogOpen(false);
        setSelectedPharmacy(null);
      } else {
        throw new Error(data.error || "Failed to approve pharmacy");
      }
    } catch (error) {
      console.error("Error approving pharmacy:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to approve pharmacy"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason?: string) => {
    if (!selectedPharmacy) return;

    try {
      setActionLoading(selectedPharmacy.id);
      const response = await fetch("/api/admin/pharmacies/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: selectedPharmacy.id,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject pharmacy");
      }

      if (data.success) {
        onRefresh();
        setRejectDialogOpen(false);
        setSelectedPharmacy(null);
      } else {
        throw new Error(data.error || "Failed to reject pharmacy");
      }
    } catch (error) {
      console.error("Error rejecting pharmacy:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to reject pharmacy"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Pharmacy["status"]) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      APPROVED: "bg-green-100 text-green-800 border-green-300",
      REJECTED: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <Badge
        variant="outline"
        className={`${variants[status]} font-medium`}
      >
        {status}
      </Badge>
    );
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pharmacy Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Medicines</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading pharmacies...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : pharmacies.length === 0 ? (
              <TableEmpty
                message="No pharmacies found"
                icon={<AlertCircle className="h-10 w-10" />}
              />
            ) : (
              pharmacies.map((pharmacy) => (
                <TableRow key={pharmacy.id}>
                  <TableCell className="font-medium">
                    {pharmacy.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pharmacy.email}
                  </TableCell>
                  <TableCell>
                    {pharmacy.city || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pharmacy.phone || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pharmacy.hasDelivery ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {pharmacy.medicineCount}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(pharmacy.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleView(pharmacy)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {pharmacy.status !== "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleApprove(pharmacy)}
                          disabled={actionLoading === pharmacy.id}
                          title="Approve Pharmacy"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {actionLoading === pharmacy.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {pharmacy.status !== "REJECTED" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleReject(pharmacy)}
                          disabled={actionLoading === pharmacy.id}
                          title="Reject Pharmacy"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === pharmacy.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && pharmacies.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(
              pagination.offset + pagination.limit,
              pagination.total
            )}{" "}
            of {pagination.total} pharmacies
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(
                  Math.max(0, pagination.offset - pagination.limit)
                )
              }
              disabled={pagination.offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(pagination.offset + pagination.limit)
              }
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
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

