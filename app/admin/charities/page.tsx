"use client";

import { useEffect, useState } from "react";
import { CharitiesTable } from "@/components/admin/CharitiesTable";
import { CharityFilters } from "@/components/admin/CharityFilters";
import { CharityStats } from "@/components/admin/CharityStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, User, Phone, Mail, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

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

interface CharityStats {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    total: number;
}

interface PaginationData {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export default function AdminCharitiesPage() {
    const [charities, setCharities] = useState<Charity[]>([]);
    const [stats, setStats] = useState<CharityStats>({
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        total: 0,
    });
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchName, setSearchName] = useState("");
    const [searchPhone, setSearchPhone] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [cityFilter, setCityFilter] = useState("");


    // 👇👇👇 PASTE THIS BLOCK HERE 👇👇👇
    const searchParams = useSearchParams();

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) {
            setSearchName(query); // 👈 This puts "Charity 1" into the Name box
        }
    }, [searchParams]);
    // 👆👆👆 END OF NEW BLOCK 👆👆👆

    const fetchCharities = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query params
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);

            const searchTerms = [searchName, searchPhone, searchEmail]
                .filter(term => term.trim().length > 0)
                .join(" ");
            if (searchTerms) params.append("search", searchTerms);

            if (cityFilter) params.append("city", cityFilter);
            params.append("limit", pagination.limit.toString());
            params.append("offset", pagination.offset.toString());

            const response = await fetch(`/api/admin/charities?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch charities");
            }

            if (data.success) {
                setCharities(data.data);
                setStats(data.stats);
                setPagination(data.pagination);
            } else {
                throw new Error(data.error || "Failed to fetch charities");
            }
        } catch (err) {
            console.error("Error fetching charities:", err);
            setError(
                err instanceof Error ? err.message : "An unexpected error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharities();
    }, [statusFilter, searchName, searchPhone, searchEmail, cityFilter, pagination.offset]);

    const handleRefresh = () => {
        fetchCharities();
    };

    const handlePageChange = (newOffset: number) => {
        setPagination((prev) => ({ ...prev, offset: newOffset }));
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setPagination((prev) => ({ ...prev, offset: 0 }));
    };

    const handleCityFilterChange = (city: string) => {
        setCityFilter(city);
        setPagination((prev) => ({ ...prev, offset: 0 }));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Charity Management</h1>
                    <p className="text-gray-600 mt-1">
                        Review, approve, and manage charity organization accounts
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Statistics */}
            <CharityStats stats={stats} loading={loading} />

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Three Search Fields Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search by Name */}
                            <div className="space-y-2">
                                <Label htmlFor="search-name">Search by Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search-name"
                                        placeholder="Enter name..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Search by Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="search-phone">Search by Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search-phone"
                                        placeholder="Enter phone..."
                                        value={searchPhone}
                                        onChange={(e) => setSearchPhone(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Search by Email */}
                            <div className="space-y-2">
                                <Label htmlFor="search-email">Search by Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search-email"
                                        placeholder="Enter email..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Other Filters */}
                        <CharityFilters
                            statusFilter={statusFilter}
                            cityFilter={cityFilter}
                            onStatusFilterChange={handleStatusFilterChange}
                            onCityFilterChange={handleCityFilterChange}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Charities Table */}
            <Card>
                <CardContent className="pt-6">
                    <CharitiesTable
                        charities={charities}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onRefresh={fetchCharities}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
