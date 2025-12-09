import Section from "@/components/layout/Section";
import { ShieldCheck, Clock, Users, Award } from "lucide-react";

const badges = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Verified Pharmacies",
    description: "All pharmacies are verified and licensed",
  },
  {
    id: 2,
    icon: Clock,
    title: "Real-Time Updates",
    description: "Live medicine availability tracking",
  },
  {
    id: 3,
    icon: Users,
    title: "10K+ Active Users",
    description: "Trusted by the Lebanese community",
  },
  {
    id: 4,
    icon: Award,
    title: "100% Free",
    description: "No hidden fees or subscriptions",
  },
];

const TrustBadges = () => {
  return (
    <Section className="py-12 bg-primary-hover">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-primary p-3 rounded-full">
                    <Icon className="size-6 text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  {badge.title}
                </h4>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default TrustBadges;
