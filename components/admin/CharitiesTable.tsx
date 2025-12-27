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
                body: JSON.stringify({
                    charityId: selectedCharity.id,
                    reason,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to approve charity");
            }

            if (data.success) {
                onRefresh();
                setApproveDialogOpen(false);
                setSelectedCharity(null);
            } else {
                throw new Error(data.error || "Failed to approve charity");
            }
        } catch (error) {
            console.error("Error approving charity:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to approve charity"
            );
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
                body: JSON.stringify({
                    charityId: selectedCharity.id,
                    reason,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reject charity");
            }

            if (data.success) {
                onRefresh();
                setRejectDialogOpen(false);
                setSelectedCharity(null);
            } else {
                throw new Error(data.error || "Failed to reject charity");
            }
        } catch (error) {
            console.error("Error rejecting charity:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to reject charity"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: Charity["status"]) => {
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
                            <TableHead>Charity Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Campaigns</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Loading charities...</span>
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
                                <TableRow key={charity.id}>
                                    <TableCell className="font-medium">
                                        {charity.name}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {charity.email}
                                    </TableCell>
                                    <TableCell>
                                        {charity.city || (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">
                                            {charity.campaignCount}
                                        </span>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(charity.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleView(charity)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {charity.status !== "APPROVED" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleApprove(charity)}
                                                    disabled={actionLoading === charity.id}
                                                    title="Approve Charity"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
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
                                                    title="Reject Charity"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

            {/* Pagination */}
            {!loading && charities.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {pagination.offset + 1} to{" "}
                        {Math.min(
                            pagination.offset + pagination.limit,
                            pagination.total
                        )}{" "}
                        of {pagination.total} charities
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
