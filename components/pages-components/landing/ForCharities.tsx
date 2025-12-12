import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Megaphone, Target, HandHeart, BarChart } from "lucide-react";
import Link from "next/link";

const charityFeatures = [
  {
    id: 1,
    icon: Megaphone,
    title: "Run Campaigns",
    description:
      "Create targeted campaigns for collecting specific medicines in need.",
  },
  {
    id: 2,
    icon: Target,
    title: "Reach Your Community",
    description:
      "Connect with donors, patients, and pharmacies in target areas.",
  },
  {
    id: 3,
    icon: HandHeart,
    title: "Coordinate Donations",
    description: "Manage medicine donations and match them with those in need.",
  },
  {
    id: 4,
    icon: BarChart,
    title: "Track Impact",
    description:
      "Monitor campaign progress and see the real difference you're making.",
  },
];

const ForCharities = () => {
  return (
    <Section className="py-20 bg-secondary" id="for-charities">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-block bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              For Charities
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Amplify Your Impact
            </h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              DawaLocate provides charities with tools to run effective medicine
              donation campaigns, coordinate with the community, and ensure help
              reaches those who need it most.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-primary hover:bg-[#094A58]! text-white"
            >
              <Link href="/register">Start a Campaign</Link>
            </Button>
          </div>

          {/* Right: Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {charityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-card p-6 rounded-xl shadow-sm border border-gray-100"
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

export default ForCharities;
