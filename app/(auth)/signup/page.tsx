"use client";

import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { LEBANON_CITIES } from "@/constants/lebanon-cities";
import { OpeningHoursInput } from "@/components/ui/OpeningHoursInput";
import Logo from "@/components/layout/Logo";
import Image from "next/image";

import lebanonFlag from "@/public/images/Lebanon.jpeg";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      // Prepend +961 to phone number for backend
      const submissionData = {
        ...formData,
        phone: formData.phone ? `+961${formData.phone}` : "",
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
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

      // Redirect to home - middleware will handle routing to correct dashboard
      router.push("/");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const showExtraFields =
    formData.userType === "pharmacy" || formData.userType === "charity";

  return (
    <div className="flex items-center justify-center md:w-screen bg-card h-3/4 overflow-y-auto">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex md:w-1/2 bg-linear-to-br from-[#0AA6C8] via-[#0886A2] to-[#6366f1] relative h-screen">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMTEuMDUtOC45NSAyMC0yMCAyMHMtMjAtOC45NS0yMC0yMCA4Ljk1LTIwIDIwLTIwIDIwIDguOTUgMjAgMjB6bS0yMC0yYzYuNjI3IDAgMTItNS4zNzMgMTItMTJzLTUuMzczLTEyLTEyLTEyUzQgNS4zNzMgNCAxMnM1LjM3MyAxMiAxMiAxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center py-32 text-white px-12 w-full">
          <div className="max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to DawaLocate</h1>
            </div>
            <p className="text-lg text-white/90 leading-relaxed">
              Your personal hub for finding medicines, managing your health
              profile, and connecting with pharmacies and charities in your
              area.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-1/2 flex flex-col items-center bg-background p-8 md:p-10 md:max-h-screen overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Logo withTitle={false} width={28} height={28} />
            <h2 className="text-2xl font-bold text-gray-900">
              Create an account
            </h2>
          </div>
          <p className="text-gray-600 text-sm text-center">
            Join DawaLocate to get started
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
            </div>

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
          </div>

          {/* Extra Fields for All User Types */}
          {formData.userType && (
            <div className="space-y-5 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
  );
}
