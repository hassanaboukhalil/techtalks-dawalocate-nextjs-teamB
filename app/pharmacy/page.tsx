"use client";

import { LogoutButton } from "@/components/ui/LogoutButton";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";

const page = () => {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userStatus = session?.user?.status;

  // PENDING status - Show waiting for approval message
  if (userStatus === "PENDING") {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Waiting for Approval
            </h2>
            <p className="text-gray-700 mb-4">
              Your pharmacy account is currently under review by our administrators.
            </p>
            <p className="text-gray-600 text-sm">
              You'll receive access to the dashboard once your account has been approved. 
              This usually takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED status - Show rejection message
  if (userStatus === "REJECTED") {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Account Not Approved
            </h2>
            <p className="text-gray-700 mb-4">
              Unfortunately, your pharmacy account was not approved.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              If you believe this is an error, please contact our support team for assistance.
            </p>
            <div className="flex justify-center">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=dawalocate@gmail.com&su=Support%20Request%20-%20Pharmacy%20Account"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED status or no status (for patients) - Show normal dashboard
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
        <LogoutButton />
      </div>
      
      {userStatus === "APPROVED" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Your pharmacy account is approved and active!
          </p>
        </div>
      )}
      
      <div>pharmacy home page</div>
    </div>
  );
};

export default page;
