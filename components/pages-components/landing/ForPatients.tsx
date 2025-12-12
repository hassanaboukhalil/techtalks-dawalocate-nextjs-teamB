import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Search, QrCode, Heart, FileText } from "lucide-react";
import Link from "next/link";

const patientFeatures = [
  {
    id: 1,
    icon: Search,
    title: "Find Medicine Instantly",
    description:
      "Search by medicine name and location to see which pharmacies have it in stock.",
  },
  {
    id: 2,
    icon: QrCode,
    title: "Digital Health Card",
    description:
      "Create a secure health profile with a QR card for emergency medical access.",
  },
  {
    id: 3,
    icon: Heart,
    title: "Donate or Request",
    description:
      "Offer unused medicines or request hard-to-find medications from the community.",
  },
  {
    id: 4,
    icon: FileText,
    title: "Track Your Requests",
    description:
      "Keep track of your medicine requests and get notified when help is available.",
  },
];

const ForPatients = () => {
  return (
    <Section className="py-20 bg-secondary" id="for-patients">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-block bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              For Patients
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Your Health, <br />
              Our Priority
            </h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              DawaLocate empowers you to take control of your health by making
              medicine accessible and affordable. Never miss your medication
              again.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-primary hover:bg-[#094A58]! text-white"
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>

          {/* Right: Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {patientFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-card p-6 rounded-xl shadow-sm"
                >
                  <div className="bg-primary-hover p-3 rounded-lg w-fit">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mt-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ForPatients;
