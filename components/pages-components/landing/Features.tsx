import Section from "@/components/layout/Section";
import {
  Search,
  Heart,
  QrCode,
  Package,
  Users,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: Search,
    title: "Smart Medicine Search",
    description:
      "Find pharmacies near you that have your needed medicine in stock with real-time availability.",
  },
  {
    id: 2,
    icon: QrCode,
    title: "Digital Health Card",
    description:
      "Store your health profile securely and generate a QR card for emergency access to your medical info.",
  },
  {
    id: 3,
    icon: Heart,
    title: "Donation Network",
    description:
      "Donate unused medicines or request hard-to-find medications. Connect with those who can help.",
  },
  {
    id: 4,
    icon: Package,
    title: "Pharmacy Inventory",
    description:
      "Pharmacies can manage their medicine stock and help patients find what they need instantly.",
  },
  {
    id: 5,
    icon: Users,
    title: "Charity Campaigns",
    description:
      "Charities can run targeted campaigns for collecting and distributing essential medicines.",
  },
  {
    id: 6,
    icon: ShieldCheck,
    title: "Verified & Secure",
    description:
      "All pharmacies and charities are verified. Your health data is encrypted and protected.",
  },
];

const Features = () => {
  return (
    <Section className="py-20 bg-background" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            A complete platform connecting patients, pharmacies, and charities
            to ensure everyone gets the medicine they need.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="bg-primary-hover p-3 rounded-xl w-fit">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default Features;
