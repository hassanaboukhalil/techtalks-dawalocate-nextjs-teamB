import { CheckCircle2, XCircle } from "lucide-react";

interface MessageDisplayProps {
  success?: string | null;
  error?: string | null;
}

export default function MessageDisplay({ success, error }: MessageDisplayProps) {
  return (
    <>
      {/* Success message */}
      {success && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}
    </>
  );
}
