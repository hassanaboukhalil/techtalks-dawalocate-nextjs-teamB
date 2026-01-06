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
import { ViewCharityDialog } from "@/components/admin/ViewCharityDialog";
import { ApproveRejectDialog } from "@/components/admin/ApproveRejectDialog";

/* ===================== Types (UNCHANGED) ===================== */

interface Charity {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  campaignCount: number;
}

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface CharitiesTableProps {
  charities: Charity[];
  loading: boolean;
  pagination: PaginationData;
  onPageChange: (offset: number) => void;
  onRefresh: () => void;
}

/* ===================== Component ===================== */

export function CharitiesTable({
  charities,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}: CharitiesTableProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /* ===================== Handlers (UNCHANGED) ===================== */

  const handleView = (charity: Charity) => {
    setSelectedCharity(charity);
    setViewDialogOpen(true);
  };

  const handleApprove = (charity: Charity) => {
    setSelectedCharity(charity);
    setApproveDialogOpen(true);
  };

  const handleReject = (charity: Charity) => {
    setSelectedCharity(charity);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async (reason?: string) => {
    if (!selectedCharity) return;

    try {
      setActionLoading(selectedCharity.id);
      const response = await fetch("/api/admin/charities/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: selectedCharity.id, reason }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onRefresh();
      setApproveDialogOpen(false);
      setSelectedCharity(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to approve charity");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason?: string) => {
    if (!selectedCharity) return;

    try {
      setActionLoading(selectedCharity.id);
      const response = await fetch("/api/admin/charities/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: selectedCharity.id, reason }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onRefresh();
      setRejectDialogOpen(false);
      setSelectedCharity(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reject charity");
    } finally {
      setActionLoading(null);
    }
  };

  /* ===================== Status Badge (ENHANCED STYLE ONLY) ===================== */

  const getStatusBadge = (status: Charity["status"]) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
    };

    const dot = {
      PENDING: "bg-amber-500",
      APPROVED: "bg-emerald-500",
      REJECTED: "bg-rose-500",
    };

    return (
      <Badge
        variant="outline"
        className={`${styles[status]} pl-2 pr-3 py-1 border shadow-sm`}
      >
        <span
          className={`mr-2 h-1.5 w-1.5 rounded-full ${dot[status]} animate-pulse`}
        />
        {status}
      </Badge>
    );
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  /* ===================== UI ===================== */

  return (
    <div className="space-y-4 w-full">
      {/* TABLE CONTAINER */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <TableRow>
                <TableHead className="uppercase text-xs tracking-wider text-slate-500">
                  Charity Name
                </TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-slate-500">
                  Email
                </TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-slate-500">
                  City
                </TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-slate-500">
                  Campaigns
                </TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-slate-500">
                  Status
                </TableHead>
                <TableHead className="text-right uppercase text-xs tracking-wider text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading charities...
                    </div>
                  </TableCell>
                </TableRow>
              ) : charities.length === 0 ? (
                <TableEmpty
                  message="No charities found"
                  icon={<AlertCircle className="h-10 w-10" />}
                />
              ) : (
                charities.map((charity) => (
                  <TableRow
                    key={charity.id}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="font-semibold text-slate-800">
                      {charity.name}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {charity.email}
                    </TableCell>
                    <TableCell>
                      {charity.city ?? (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {charity.campaignCount}
                    </TableCell>
                    <TableCell>{getStatusBadge(charity.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleView(charity)}
                          className="h-8 w-8 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {charity.status !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleApprove(charity)}
                            disabled={actionLoading === charity.id}
                            className="h-8 w-8 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                          >
                            {actionLoading === charity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {charity.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleReject(charity)}
                            disabled={actionLoading === charity.id}
                            className="h-8 w-8 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                          >
                            {actionLoading === charity.id ? (
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
      </div>

      {/* PAGINATION */}
      {!loading && charities.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {pagination.offset + 1}
            </span>{" "}
            –{" "}
            <span className="font-bold text-slate-900">
              {Math.min(
                pagination.offset + pagination.limit,
                pagination.total
              )}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {pagination.total}
            </span>
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
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
              {currentPage} / {totalPages}
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
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* DIALOGS (UNCHANGED) */}
      {selectedCharity && (
        <>
          <ViewCharityDialog
            charity={selectedCharity}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <ApproveRejectDialog
            item={selectedCharity}
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            onConfirm={handleApproveConfirm}
            action="approve"
            type="charity"
          />
          <ApproveRejectDialog
            item={selectedCharity}
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            onConfirm={handleRejectConfirm}
            action="reject"
            type="charity"
          />
        </>
      )}
    </div>
  );
}
