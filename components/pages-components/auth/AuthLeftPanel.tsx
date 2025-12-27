import Image from "next/image";
import { Mail } from "lucide-react";
import medicinesImg from "@/public/images/auth/medicines-img-auth.svg";
import loginImg from "@/public/images/auth/find-medicine-auth-login-img.svg";

interface AuthLeftPanelProps {
  variant?: "welcome" | "verify" | "login";
}

export default function AuthLeftPanel({
  variant = "welcome",
}: AuthLeftPanelProps) {
  const renderContent = () => {
    switch (variant) {
      case "verify":
        return (
          <div className="relative z-10 flex flex-col items-center py-32 text-white px-12 w-full">
            <div className="max-w-md">
              <div className="mb-8">
                <Mail className="w-20 h-20 mb-6" />
                <h1 className="text-4xl font-bold mb-4">Check Your Email</h1>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                We&apos;ve sent a 6-digit verification code to your email
                address. Enter it to continue.
              </p>
            </div>
          </div>
        );

      case "login":
        return (
          <div className="z-10 flex flex-col items-center justify-center text-white px-12 w-full gap-12">
            <div className="max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                Log in to access your dashboard and continue finding medicines,
                managing your health profile, and connecting with pharmacies and
                charities in your area.
              </p>
            </div>

            {/* Login illustration */}
            <div className="flex justify-center">
              <Image
                src={loginImg}
                alt="Find medicine illustration"
                width={446}
                height={419}
                className="w-full max-w-xs 2xl:max-w-none"
              />
            </div>
          </div>
        );

      case "welcome":
      default:
        return (
          <div className="z-10 flex flex-col items-center justify-center text-white px-12 w-full gap-12">
            <div className="max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to DawaLocate
                </h2>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                Your personal hub for finding medicines, managing your health
                profile, and connecting with pharmacies and charities in your
                area.
              </p>
            </div>

            {/* Medicines illustration */}
            <div className="flex justify-center">
              <Image
                src={medicinesImg}
                alt="Medicines illustration"
                width={446}
                height={419}
                className="w-full max-w-xs 2xl:max-w-none"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="hidden xl:flex justify-center items-center md:w-1/2 bg-linear-to-br from-[#0AA6C8] via-[#0886A2] to-[#6366f1] relative h-screen">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMTEuMDUtOC45NSAyMC0yMCAyMHMtMjAtOC45NS0yMC0yMCA4Ljk1LTIwIDIwLTIwIDIwIDguOTUgMjAgMjB6bS0yMC0yYzYuNjI3IDAgMTItNS4zNzMgMTItMTJzLTUuMzczLTEyLTEyLTEyUzQgNS4zNzMgNCAxMnM1LjM3MyAxMiAxMiAxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      {renderContent()}
    </div>
  );
}
