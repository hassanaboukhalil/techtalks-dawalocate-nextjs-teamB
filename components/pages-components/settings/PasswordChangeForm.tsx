import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordChangeFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  onPasswordError?: (error: string) => void; // Add callback for password errors
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push("At least 8 characters");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter");
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push("At least one number");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default function PasswordChangeForm({ onSubmit, onPasswordError, loading = false, error, success }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);

  const passwordHint = "Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.";

  const handleSubmit = async () => {
    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      return;
    }

    // Security: Implement progressive delay for failed attempts
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;

    if (failedAttempts > 0 && timeSinceLastAttempt < Math.min(1000 * Math.pow(2, failedAttempts - 1), 30000)) {
      const remainingDelay = Math.ceil((1000 * Math.pow(2, failedAttempts - 1) - timeSinceLastAttempt) / 1000);
      setCurrentPasswordError(`Too many failed attempts. Please wait ${remainingDelay} seconds before trying again.`);
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    // Clear password errors on successful validation
    setPasswordErrors([]);
    setConfirmPasswordError(null);
    setCurrentPasswordError(null);

    try {
      await onSubmit({ currentPassword, newPassword, confirmPassword });

      // Security: Reset failed attempts on success
      setFailedAttempts(0);
      setLastAttemptTime(0);

      // Clear form on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // Security: Handle specific error types
      const errorMessage = error.response?.data?.error || "An error occurred while updating your password";

      if (errorMessage.toLowerCase().includes("current password is incorrect")) {
        setCurrentPasswordError("Current password is incorrect. Please check and try again.");
        setFailedAttempts(prev => prev + 1);
        setLastAttemptTime(Date.now());

        // Security: Clear the current password field for security
        setCurrentPassword("");

        // Notify parent component to stop loading state only (don't pass the error message)
        onPasswordError?.("");
      } else {
        // For other errors (network, server errors), re-throw to parent
        throw error;
      }
    }
  };

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors([]);
    setConfirmPasswordError(null);
    setCurrentPasswordError(null);
    setFailedAttempts(0);
    setLastAttemptTime(0);
  };

  // Add real-time password validation
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    // Clear errors when user starts typing
    if (passwordErrors.length > 0) {
      setPasswordErrors([]);
    }
    // Also clear confirm password error if it exists
    if (confirmPasswordError) {
      setConfirmPasswordError(null);
    }
  };

  // Add real-time confirm password validation
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Validate against new password in real-time
    if (value && newPassword && value !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(null);
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in animation-delay-400">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative p-4 rounded-2xl shadow-lg" style={{ backgroundColor: "var(--color-primary)" }}>
          <div className="absolute inset-0 rounded-2xl opacity-20" style={{ backgroundColor: "var(--color-primary)" }}></div>
          <Shield className="w-6 h-6 text-white relative z-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Security</h2>
          <p className="text-slate-500 text-sm mt-1">
            Change your password regularly to keep your account secure.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-lg animate-fade-in animation-delay-500">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          Change password
        </h3>

        {/* Current Password */}
        <div className="space-y-3 animate-fade-in animation-delay-600">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Current password
          </label>
          <div className="relative group">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                // Clear current password error when user starts typing
                if (currentPasswordError) {
                  setCurrentPasswordError(null);
                }
              }}
              className={`w-full h-12 rounded-xl border bg-white px-4 pr-12 text-sm outline-none focus:ring-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                currentPasswordError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100/50'
                  : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100/50'
              }`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Toggle current password visibility"
            >
              {showCurrent ? <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" /> : <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />}
            </button>
          </div>

          {/* Current Password Error */}
          {currentPasswordError && (
            <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-full bg-red-100 mt-0.5">
                  <Shield className="w-3 h-3 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">Password verification failed</p>
                  <p className="text-xs text-red-600">{currentPasswordError}</p>
                  {failedAttempts > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Attempt {failedAttempts} of 5. Account will be temporarily locked after 5 failed attempts.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-3 mt-6 animate-fade-in animation-delay-700">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            New password
          </label>
          <div className="relative group">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              className={`w-full h-12 rounded-xl border bg-white px-4 pr-12 text-sm outline-none focus:ring-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                passwordErrors.length > 0
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100/50'
                  : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100/50'
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Toggle new password visibility"
            >
              {showNew ? <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" /> : <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />}
            </button>
          </div>

          {/* Password Validation Feedback */}
          {passwordErrors.length > 0 && (
            <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-full bg-red-100 mt-0.5">
                  <Shield className="w-3 h-3 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">Password requirements:</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-3 mt-6 animate-fade-in animation-delay-800">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Confirm new password
          </label>
          <div className="relative group">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`w-full h-12 rounded-xl border bg-white px-4 pr-12 text-sm outline-none focus:ring-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                confirmPasswordError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100/50'
                  : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100/50'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" /> : <Eye className="w-5 h-5 text-slate-500 transition-colors hover:text-slate-700" />}
            </button>
          </div>

          {/* Confirm Password Error */}
          {confirmPasswordError && (
            <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-full bg-red-100 mt-0.5">
                  <Shield className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-xs font-medium text-red-700">{confirmPasswordError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-fade-in animation-delay-900">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-full bg-amber-100 mt-0.5">
              <Shield className="w-3 h-3 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 font-medium">{passwordHint}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end animate-fade-in animation-delay-1000">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="default"
            size="default"
            style={{
              backgroundColor: "#2699b2",
              borderColor: "#2699b2",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
            className="font-semibold text-white shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Update password
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
