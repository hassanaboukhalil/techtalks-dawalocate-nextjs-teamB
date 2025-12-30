"use client";

import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Search, HeartHandshake, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import medicalImage from "../../../public/images/landing-page/medicines-img.png";

const Hero = () => {
  return (
    <Section className="min-h-[90vh] pt-24 pb-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
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
          <p className="mt-8 text-lg sm:text-xl text-gray-600 leading-relaxed">
            Quickly locate nearby pharmacies with your needed medicines in
            stock. Connect patients, donors, pharmacies, and charities around
            hard-to-find medications.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center items-center">
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 hover:bg-tertiary text-white"
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
              className="text-base px-8 py-6 border-primary text-primary hover:bg-secondary"
            >
              <Link href="#how-it-works">
                <HeartHandshake className="size-5" />
                How It Works
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Trusted by the community
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 sm:gap-12 text-center lg:text-left">
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

        {/* Right Column - Image with Floating Cards */}
        <div className="relative">
          {/* Main Image Container */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/5 to-secondary/20">
            <Image
              src={medicalImage}
              alt="Organized medicines - capsules and tablets"
              fill
              className="object-contain p-8"
              priority
            />
          </div>

          {/* Floating Card 1 - Top Left */}
          <div className="absolute -top-4 -left-4 bg-card p-4 rounded-xl shadow-lg hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="size-5 text-green" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Live Updates</div>
                <div className="font-semibold text-sm text-gray-900">
                  Stock Availability
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card 2 - Bottom Right */}
          <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-xl shadow-lg hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Community</div>
                <div className="font-semibold text-sm text-gray-900">
                  Powered Network
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
