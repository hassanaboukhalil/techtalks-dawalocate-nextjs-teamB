"use client";

import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Search, HeartHandshake } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <Section className="min-h-[90vh] flex-center flex-col pt-24 pb-16">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-hover px-4 py-2 rounded-full mb-6">
          <span className="text-primary font-semibold text-sm">
            🇱🇧 Serving Lebanon
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
          Find Medicines,
          <span className="block text-primary mt-2">Save Lives.</span>
        </h1>

        {/* Subheading */}
        <p className="mt-8 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Quickly locate nearby pharmacies with your needed medicines in stock.
          Connect patients, donors, pharmacies, and charities around
          hard-to-find medications.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white"
          >
            <Link href="/register">
              <Search className="size-5" />
              Find Medicine Now
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 border-primary text-primary hover:bg-primary-hover"
          >
            <Link href="#how-it-works">
              <HeartHandshake className="size-5" />
              How It Works
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Trusted by the community</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-gray-600 mt-1">Pharmacies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-gray-600 mt-1">Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-gray-600 mt-1">Charities</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
