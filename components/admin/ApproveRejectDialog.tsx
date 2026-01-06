"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

interface Item {
  id: number;
  name: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ApproveRejectDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => Promise<void>;
  action: "approve" | "reject";
  type: "pharmacy" | "charity";
}

export function ApproveRejectDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
  action,
  type,
}: ApproveRejectDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const isApprove = action === "approve";
  const typeLabel = type === "pharmacy" ? "Pharmacy" : "Charity";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-slate-200 shadow-xl overflow-hidden p-0">
        {/* ===== HEADER STRIP ===== */}
        <div
          className={`h-1 w-full ${
            isApprove ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />

        <div className="p-6 space-y-6">
          {/* ===== HEADER ===== */}
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div
                className={`
                  h-14 w-14 rounded-2xl flex items-center justify-center
                  shadow-lg
                  ${
                    isApprove
                      ? "bg-emerald-100 text-emerald-700 shadow-emerald-300/40"
                      : "bg-rose-100 text-rose-700 shadow-rose-300/40"
                  }
                  animate-[pulse_3s_ease-in-out_infinite]
                `}
              >
                {isApprove ? (
                  <CheckCircle className="h-7 w-7 animate-[float_4s_ease-in-out_infinite]" />
                ) : (
                  <AlertCircle className="h-7 w-7 animate-[float_4s_ease-in-out_infinite]" />
                )}
              </div>

              <div>
                <DialogTitle className="text-xl font-extrabold text-slate-900">
                  {isApprove ? "Approve" : "Reject"} {typeLabel}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">
                  Confirm your action for this {type.toLowerCase()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ===== ITEM CARD ===== */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="text-sm font-bold text-slate-900">{item.name}</p>
            <p className="text-sm text-slate-600">{item.email}</p>
            <p className="text-xs text-slate-500">
              Current status:{" "}
              <span className="font-semibold">{item.status}</span>
            </p>
          </div>

          {/* ===== CONTENT ===== */}
          {isApprove ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                After approval, this {type.toLowerCase()} will be able to:
              </p>
              <ul className="text-sm text-slate-600 space-y-2 ml-5 list-disc">
                {type === "pharmacy" ? (
                  <>
                    <li>Manage their medicine inventory</li>
                    <li>View patient requests</li>
                    <li>Create donation offers</li>
                  </>
                ) : (
                  <>
                    <li>Create and manage campaigns</li>
                    <li>Request medicine donations</li>
                    <li>View available offers</li>
                  </>
                )}
                <li>Fully interact with the platform</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-800 font-medium">
                ⚠️ This {type.toLowerCase()} will be rejected and permanently
                blocked from accessing platform features.
              </p>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-300"
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={loading}
              className={
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
              }
            >
              {loading
                ? `${isApprove ? "Approving" : "Rejecting"}...`
                : `${isApprove ? "Approve" : "Reject"} ${typeLabel}`}
            </Button>
          </DialogFooter>
        </div>

        {/* ===== FLOAT ANIMATION ===== */}
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
