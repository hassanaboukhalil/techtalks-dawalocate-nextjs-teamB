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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isApprove ? (
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg">
                {isApprove ? "Approve" : "Reject"} {typeLabel}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {item.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              {item.name}
            </p>
            <p className="text-sm text-gray-600">{item.email}</p>
            <p className="text-xs text-gray-500">
              Current Status: <span className="font-medium">{item.status}</span>
            </p>
          </div>

          {isApprove ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                This {type.toLowerCase()} will be approved and will be able to:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                {type === "pharmacy" ? (
                  <>
                    <li>Manage their inventory</li>
                    <li>View patient requests</li>
                    <li>Create donation offers</li>
                  </>
                ) : (
                  <>
                    <li>Create and manage campaigns</li>
                    <li>Request donations</li>
                    <li>View available medicine offers</li>
                  </>
                )}
                <li>Interact with the platform</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This {type.toLowerCase()} will be rejected and
                will not be able to access platform features.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={loading}
            className={!isApprove ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            {loading
              ? `${isApprove ? "Approving" : "Rejecting"}...`
              : `${isApprove ? "Approve" : "Reject"} ${typeLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
