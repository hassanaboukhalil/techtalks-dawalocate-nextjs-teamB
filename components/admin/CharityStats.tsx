"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface CharityStatsProps {
    stats: {
        PENDING: number;
        APPROVED: number;
        REJECTED: number;
        total: number;
    };
    loading: boolean;
}

export function CharityStats({ stats, loading }: CharityStatsProps) {
    const statCards = [
        {
            title: "Total Charities",
            value: stats.total,
            icon: Heart,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
        },
        {
            title: "Pending Review",
            value: stats.PENDING,
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "Approved",
            value: stats.APPROVED,
            icon: CheckCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Rejected",
            value: stats.REJECTED,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
                <Card key={stat.title} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Loading...</span>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold">{stat.value}</div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
