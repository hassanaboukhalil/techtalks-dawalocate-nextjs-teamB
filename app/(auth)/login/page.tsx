"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Logo from "@/components/layout/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Invalid email or password");
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FA] lg:#F5F7FA xl:bg-white">
      <div className="flex items-center justify-center md:w-screen bg-[#F5F7FA] lg:bg-transparent h-3/4 overflow-y-auto">
        {/* Left Panel - Hidden on mobile */}
        <div className="hidden xl:flex justify-center items-center md:w-1/2 bg-linear-to-br from-[#0AA6C8] via-[#0886A2] to-[#6366f1] relative h-screen">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMTEuMDUtOC45NSAyMC0yMCAyMHMtMjAtOC45NS0yMC0yMCA4Ljk1LTIwIDIwLTIwIDIwIDguOTUgMjAgMjB6bS0yMC0yYzYuNjI3IDAgMTItNS4zNzMgMTItMTJzLTUuMzczLTEyLTEyLTEyUzQgNS4zNzMgNCAxMnM1LjM3MyAxMiAxMiAxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10 flex flex-col items-center py-32 text-white px-12 w-full">
            <div className="max-w-md">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                Log in to access your dashboard and continue finding medicines,
                managing your health profile, and connecting with pharmacies and
                charities in your area.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-[62%] lg:w-1/2 flex flex-col items-center justify-center bg-white p-8 md:p-10 md:max-h-screen lg:overflow-y-auto md:my-16 lg:my-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Logo withTitle={false} width={28} height={28} />
              <h2 className="text-2xl font-bold text-gray-900">
                Log in to your account
              </h2>
            </div>
            <p className="text-gray-600 text-sm text-center">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

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

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-secondary font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
