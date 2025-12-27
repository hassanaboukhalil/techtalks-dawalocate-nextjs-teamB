"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Phone,
    Mail,
    Heart,
    Calendar,
} from "lucide-react";

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

interface ViewCharityDialogProps {
    charity: Charity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewCharityDialog({
    charity,
    open,
    onOpenChange,
}: ViewCharityDialogProps) {
    const getStatusBadge = (status: Charity["status"]) => {
        const variants = {
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
            APPROVED: "bg-green-100 text-green-800 border-green-300",
            REJECTED: "bg-red-100 text-red-800 border-red-300",
        };

        return (
            <Badge variant="outline" className={`${variants[status]} font-medium`}>
                {status}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                                <Heart className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-gray-900">
                                    {charity.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    Charity Organization
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="pt-2">
                            {getStatusBadge(charity.status)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Contact Information */}
                    <section className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <h3 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                            <Mail className="h-4 w-4 text-rose-600" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                                <p className="text-sm text-gray-900 flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    {charity.email}
                                </p>
                            </div>

                            {charity.phone && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                                    <p className="text-sm text-gray-900 flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        {charity.phone}
                                    </p>
                                </div>
                            )}

                            {charity.city && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">City</p>
                                    <p className="text-sm text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                        {charity.city}
                                    </p>
                                </div>
                            )}
                        </div>

                        {charity.address && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                                <p className="text-sm text-gray-900 italic">
                                    {charity.address}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Charity Activity */}
                    <section className="bg-white rounded-lg p-5 border border-gray-200">
                        <h3 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                            <Heart className="h-4 w-4 text-rose-600" />
                            Charity Activity
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="text-center p-4 bg-rose-50 rounded-lg flex-1">
                                <p className="text-2xl font-bold text-rose-700">{charity.campaignCount}</p>
                                <p className="text-xs font-medium text-rose-600 uppercase">Active Campaigns</p>
                            </div>
                        </div>
                    </section>

                    {/* Registration Details */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Registered On</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(charity.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Last Updated</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(charity.updatedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
