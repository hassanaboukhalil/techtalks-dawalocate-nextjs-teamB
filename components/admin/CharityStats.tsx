"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

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
      cardBg: "bg-gradient-to-br from-rose-50 via-white to-rose-100/60",
      iconBg: "bg-rose-200/70",
      iconColor: "text-rose-700",
      glow: "shadow-rose-400/30",
    },
    {
      title: "Pending Review",
      value: stats.PENDING,
      icon: Clock,
      cardBg: "bg-gradient-to-br from-amber-50 via-white to-amber-100/60",
      iconBg: "bg-amber-200/70",
      iconColor: "text-amber-700",
      glow: "shadow-amber-400/30",
    },
    {
      title: "Approved",
      value: stats.APPROVED,
      icon: CheckCircle,
      cardBg: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60",
      iconBg: "bg-emerald-200/70",
      iconColor: "text-emerald-700",
      glow: "shadow-emerald-400/30",
    },
    {
      title: "Rejected",
      value: stats.REJECTED,
      icon: XCircle,
      cardBg: "bg-gradient-to-br from-red-50 via-white to-red-100/60",
      iconBg: "bg-red-200/70",
      iconColor: "text-red-700",
      glow: "shadow-red-400/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className={`
            relative overflow-hidden rounded-xl border border-slate-200
            ${stat.cardBg}
            shadow-sm hover:shadow-xl transition-all duration-300
          `}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {stat.title}
            </CardTitle>

            {/* BIG animated icon */}
            <div
              className={`
                h-16 w-16 rounded-2xl flex items-center justify-center
                ${stat.iconBg}
                ${stat.glow}
                shadow-lg
                animate-[pulse_3s_ease-in-out_infinite]
              `}
            >
              <stat.icon
                className={`h-9 w-9 ${stat.iconColor} animate-[float_4s_ease-in-out_infinite]`}
              />
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {stat.value}
              </div>
            )}
          </CardContent>

          {/* Bottom color accent */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5" />
        </Card>
      ))}

      {/* Floating animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
