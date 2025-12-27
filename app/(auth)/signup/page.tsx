"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Eye, EyeOff, Mail, Clock, Check, X } from "lucide-react";
import { signIn } from "next-auth/react";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";
import { OpeningHoursInput } from "@/components/ui/OpeningHoursInput";
import { VerificationCodeInput } from "@/components/ui/VerificationCodeInput";
import Logo from "@/components/layout/Logo";
import Image from "next/image";
import AuthLeftPanel from "@/components/pages-components/auth/AuthLeftPanel";

import lebanonFlag from "@/public/images/Lebanon.jpeg";

type SignupStep = "details" | "verify";

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false); // Prevent duplicate verifications

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "patient",
    city: "",
    phone: "",
    address: "",
    openingHours: "",
    hasDelivery: false,
  });

  // Timer countdown
  useEffect(() => {
    if (currentStep !== "verify" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clear error and verification states when changing steps
  useEffect(() => {
    // Clear error when entering any new step
    setError("");

    // Additional cleanup when entering verify step
    if (currentStep === "verify") {
      setVerificationCode("");
      setLoading(false);
      setIsVerifying(false);
    }
  }, [currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyCode = async (code: string) => {
    // Prevent duplicate verification attempts
    if (isVerifying || loading) {
      return;
    }

    // Validate code length
    if (code.length !== 6) {
      return;
    }

    setIsVerifying(true);
    setLoading(true);

    try {
      // First verify the code
      const verifyResponse = await fetch(
        "/api/auth/email-verification/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, code }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Invalid verification code");
        setVerificationCode("");
        setLoading(false);
        setIsVerifying(false);
        return;
      }

      if (verifyData.verified) {
        // Verification successful - now create the account
        const submissionData = {
          ...formData,
          phone: formData.phone ? `+961${formData.phone}` : "",
        };

        const signupResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        });

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
          setError(signupData.error || "Failed to create account");
          setLoading(false);
          setIsVerifying(false);
          return;
        }

        // Auto-login after successful signup
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          // Signup succeeded but login failed - redirect to login
          router.push("/login?signup=success");
          return;
        }

        // Success - redirect to dashboard
        router.push("/");
      }
    } catch (err) {
      setError("Failed to connect to server");
      setVerificationCode("");
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/email-verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend code");
        return;
      }

      setTimeLeft(900);
      setCanResend(false);
      setResendCooldown(60);
      setVerificationCode("");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };
  const passwordCriteria = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(formData.password) },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(formData.password),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Validate password strength
    if (!passwordCriteria.every((c) => c.valid)) {
      setError("Please meet all password requirements");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Validate city and phone
    if (!formData.city) {
      setError("Please select your city");
      setLoading(false);
      return;
    }

    if (!formData.phone || formData.phone.length !== 8) {
      setError("Please enter a valid 8-digit phone number");
      setLoading(false);
      return;
    }

    // Validate opening hours for pharmacy
    if (formData.userType === "pharmacy" && formData.openingHours) {
      try {
        const slots = JSON.parse(formData.openingHours) as Array<{
          days: string[];
          openTime: string;
          closeTime: string;
        }>;
        const hasValidSlot = slots.some((slot) => slot.days.length > 0);
        if (!hasValidSlot) {
          setError("Please select at least one day for opening hours");
          setLoading(false);
          return;
        }
      } catch {
        setError("Invalid opening hours format");
        setLoading(false);
        return;
      }
    }

    try {
      // Send verification code to email
      const response = await fetch("/api/auth/email-verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification code");
        setLoading(false);
        return;
      }

      // Move to verification step
      setError("");
      setCurrentStep("verify");
      setTimeLeft(900);
      setCanResend(false);
      setLoading(false);
    } catch {
      setError("Failed to connect to server");
      setLoading(false);
    }
  };

  const showExtraFields =
    formData.userType === "pharmacy" || formData.userType === "charity";

  // Step 2: Email Verification (After form submission)
  if (currentStep === "verify") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA] lg:bg-[#F5F7FA] xl:bg-white">
        <div className="flex items-center justify-center md:w-screen bg-[#F5F7FA] lg:bg-transparent h-3/4 overflow-y-auto">
          <AuthLeftPanel variant="verify" />
          {/* Right Panel */}
          <div className="md:w-[62%] lg:w-1/2 flex flex-col items-center justify-center bg-white p-8 md:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Logo withTitle={false} width={28} height={28} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Verify Your Email
                  </h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900 font-medium">
                    Code sent to
                  </p>
                  <p className="text-sm text-blue-700 font-mono">
                    {formData.email}
                  </p>
                </div>
                <p className="text-gray-600 text-sm">
                  Step 2 of 2: Enter the 6-digit code from your email
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <VerificationCodeInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  onComplete={handleVerifyCode}
                  disabled={loading || isVerifying}
                  error={!!error}
                />
              </div>

              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span
                    className={`text-sm font-medium ${
                      timeLeft < 60 ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {timeLeft > 0
                      ? `Expires in ${formatTime(timeLeft)}`
                      : "Code expired"}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleVerifyCode(verificationCode)}
                className="w-full h-11 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md mb-4"
                disabled={
                  loading || isVerifying || verificationCode.length !== 6
                }
              >
                {loading || isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn&apos;t receive the code?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={loading || resendCooldown > 0}
                  className="text-sm text-primary hover:text-secondary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Complete Profile (First)
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA] lg:#F5F7FA xl:bg-white">
      <div className="flex items-center justify-center md:w-screen bg-[#F5F7FA] lg:bg-transparent h-3/4 overflow-y-auto">
        <AuthLeftPanel variant="welcome" />

        {/* Right Panel - Form */}
        <div className="md:w-[62%] lg:w-1/2 flex flex-col items-center bg-white p-8 md:p-10 md:max-h-screen lg:overflow-y-auto md:my-16 lg:my-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Logo withTitle={false} width={28} height={28} />
              <h2 className="text-2xl font-bold text-gray-900">
                Create an account
              </h2>
            </div>
            <p className="text-gray-600 text-sm text-center">
              Step 1 of 2: Fill in your details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  I am a
                </label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userType: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="patient" className="text-gray-900">
                      Patient
                    </SelectItem>
                    <SelectItem value="pharmacy" className="text-gray-900">
                      Pharmacy
                    </SelectItem>
                    <SelectItem value="charity" className="text-gray-900">
                      Charity Organization
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>
                <CityAutocomplete
                  cities={LEBANON_CITIES}
                  value={formData.city}
                  onChange={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                  placeholder="Select your city"
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Extra Fields for All User Types */}
            {formData.userType && (
              <div className="space-y-5 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary pr-10 text-gray-900"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.password.length > 0 && (
                      <>
                        {passwordCriteria.every((c) => c.valid) ? (
                          <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-green-700 font-medium">
                              Strong password! All requirements met.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1 mt-2">
                            {passwordCriteria.map((item, index) => {
                              const isMet = item.valid;

                              let colorClass = "text-gray-500";
                              let icon = (
                                <div className="w-3 h-3 rounded-full border border-gray-400" />
                              );

                              if (isMet) {
                                colorClass = "text-green-600";
                                icon = (
                                  <Check className="w-3 h-3 text-green-600" />
                                );
                              } else {
                                colorClass = "text-red-500";
                                icon = <X className="w-3 h-3 text-red-500" />;
                              }

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  {icon}
                                  <span className={colorClass}>
                                    {item.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                        <Image
                          src={lebanonFlag}
                          alt="Lebanon"
                          className="w-6 h-4 object-cover rounded-sm"
                          width={20}
                          height={20}
                        />
                        <span className="text-gray-900 font-medium text-sm">
                          +961
                        </span>
                        <span className="text-gray-300">|</span>
                      </div>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 8) {
                            setFormData({ ...formData, phone: value });
                          }
                        }}
                        pattern="^\d{8}$"
                        className="h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900 pl-[110px]"
                        placeholder="70123456"
                        required
                        minLength={8}
                        maxLength={8}
                        title="Please enter exactly 8 digits (e.g., 70123456)"
                      />
                    </div>
                  </div>
                </div>

                {showExtraFields && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900"
                      placeholder="Street address"
                      required
                    />
                  </div>
                )}

                {formData.userType === "pharmacy" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Opening Hours
                      </label>
                      <OpeningHoursInput
                        value={formData.openingHours}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            openingHours: value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <input
                        type="checkbox"
                        id="hasDelivery"
                        checked={formData.hasDelivery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasDelivery: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                      <label
                        htmlFor="hasDelivery"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        We offer delivery service
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-secondary font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
