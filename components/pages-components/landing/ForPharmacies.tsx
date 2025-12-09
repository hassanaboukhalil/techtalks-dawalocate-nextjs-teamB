import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Users, Clock } from "lucide-react";
import Link from "next/link";

const pharmacyFeatures = [
  {
    id: 1,
    icon: Package,
    title: "Manage Inventory Easily",
    description:
      "Keep your medicine stock updated with our simple inventory management system.",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Increase Visibility",
    description:
      "Reach more patients actively searching for medicines you have in stock.",
  },
  {
    id: 3,
    icon: Users,
    title: "Connect with Patients",
    description:
      "Respond to local medicine requests and build trust in your community.",
  },
  {
    id: 4,
    icon: Clock,
    title: "Save Time",
    description:
      "Reduce phone inquiries by showing real-time stock availability online.",
  },
];

const ForPharmacies = () => {
  return (
    <Section className="py-20 bg-card" id="for-pharmacies">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
            {pharmacyFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-primary-hover p-6 rounded-xl shadow-sm border border-primary/10"
                >
                  <div className="bg-primary p-3 rounded-lg w-fit">
                    <Icon className="size-5 text-white" />
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

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-block bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              For Pharmacies
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Grow Your Business, <br />
              Help Your Community
            </h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              Join hundreds of pharmacies using DawaLocate to connect with
              patients, manage inventory efficiently, and make a real impact in
              your community.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-secondary hover:bg-secondary/90 text-white"
            >
              <Link href="/register">Register Your Pharmacy</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ForPharmacies;
