"use client";

import { Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CharityCTA() {
  const router = useRouter();

  return (
    <div className="mt-16 bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white text-center">
      <Heart className="h-12 w-12 mx-auto mb-4 opacity-90" />
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        Are you a charity organization?
      </h2>
      <p className="text-white/90 mb-6 max-w-xl mx-auto">
        Join DawaLocate to create impactful medicine donation campaigns and
        reach communities in need across Lebanon
      </p>
      <Button
        onClick={() => router.push("/signup")}
        className="bg-white text-primary hover:bg-gray-100 border-white rounded-xl px-8 py-6 text-lg font-semibold"
      >
        Register Your Charity
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
