"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface PharmacyStatsProps {
  stats: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    total: number;
  };
  loading: boolean;
}

export function PharmacyStats({ stats, loading }: PharmacyStatsProps) {
  const statCards = [
    {
      title: "Total Pharmacies",
      value: stats.total,
      icon: Building2,
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50/60",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      shadowColor: "hover:shadow-blue-200",
    },
    {
      title: "Pending Review",
      value: stats.PENDING,
      icon: Clock,
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50/60",
      textColor: "text-amber-700",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      shadowColor: "hover:shadow-amber-200",
    },
    {
      title: "Approved",
      value: stats.APPROVED,
      icon: CheckCircle,
      borderColor: "border-emerald-200",
      bgColor: "bg-emerald-50/60",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      shadowColor: "hover:shadow-emerald-200",
    },
    {
      title: "Rejected",
      value: stats.REJECTED,
      icon: XCircle,
      borderColor: "border-rose-200",
      bgColor: "bg-rose-50/60",
      textColor: "text-rose-700",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      shadowColor: "hover:shadow-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={`
            border ${stat.borderColor} ${stat.bgColor} 
            relative overflow-hidden group cursor-default
            transition-all duration-300 ease-in-out
            hover:-translate-y-2 hover:shadow-lg ${stat.shadowColor}
          `}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-bold uppercase tracking-wide ${stat.textColor}`}>
              {stat.title}
            </CardTitle>
            
            {/* ICON CONTAINER */}
            <div className={`
                p-3 rounded-2xl ${stat.iconBg}
            `}>
              <stat.icon 
                className={`h-8 w-8 ${stat.iconColor}`} 
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className={`h-5 w-5 animate-spin ${stat.iconColor}`} />
                <span className={`text-sm font-medium ${stat.textColor} opacity-70`}>Syncing...</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <div className={`text-4xl font-black ${stat.textColor} tabular-nums tracking-tight`}>
                  {stat.value}
                </div>
                <span className={`text-xs font-bold ${stat.textColor} opacity-60 uppercase`}>
                  Records
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}