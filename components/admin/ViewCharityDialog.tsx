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
      PENDING:
        "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      APPROVED:
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      REJECTED:
        "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    };

    const dots = {
      PENDING: "bg-amber-500",
      APPROVED: "bg-emerald-500",
      REJECTED: "bg-rose-500",
    };

    return (
      <Badge
        variant="outline"
        className={`${variants[status]} pl-2 pr-3 py-1 shadow-sm transition-colors`}
      >
        <span
          className={`mr-2 h-1.5 w-1.5 rounded-full ${dots[status]} animate-pulse`}
        />
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 shadow-xl">
        {/* ================= HEADER ================= */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center shadow-md animate-[float_4s_ease-in-out_infinite]">
                <Heart className="h-7 w-7 text-rose-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {charity.name}
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Charity Organization
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2">{getStatusBadge(charity.status)}</div>
          </div>
        </DialogHeader>

        {/* ================= CONTENT ================= */}
        <div className="space-y-6 mt-6">
          {/* ---------- Contact Information ---------- */}
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold mb-4 text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Mail className="h-4 w-4 text-rose-600" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Email
                </p>
                <p className="text-sm text-slate-900 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {charity.email}
                </p>
              </div>

              {charity.phone && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Phone
                  </p>
                  <p className="text-sm text-slate-900 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {charity.phone}
                  </p>
                </div>
              )}

              {charity.city && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    City
                  </p>
                  <p className="text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {charity.city}
                  </p>
                </div>
              )}
            </div>

            {charity.address && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Address
                </p>
                <p className="text-sm text-slate-900 italic">
                  {charity.address}
                </p>
              </div>
            )}
          </section>

          {/* ---------- Charity Activity ---------- */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold mb-4 text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Heart className="h-4 w-4 text-rose-600" />
              Charity Activity
            </h3>

            <div className="flex items-center gap-6">
              <div className="flex-1 text-center p-5 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
                <p className="text-3xl font-extrabold text-rose-700">
                  {charity.campaignCount}
                </p>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                  Active Campaigns
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Registration Details ---------- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Registered On
                  </p>
                  <p className="text-sm text-slate-900">
                    {new Date(charity.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-900">
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

        {/* FLOAT ANIMATION */}
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
      </DialogContent>
    </Dialog>
  );
}
