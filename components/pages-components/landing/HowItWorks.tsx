import Section from "@/components/layout/Section";
import { MapPin, Search, Phone, CheckCircle } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Search,
    title: "Search for Medicine",
    description:
      "Enter the medicine name and your city or area to find available pharmacies.",
  },
  {
    id: 2,
    icon: MapPin,
    title: "View Nearby Pharmacies",
    description:
      "See a list of pharmacies near you with real-time stock availability.",
  },
  {
    id: 3,
    icon: Phone,
    title: "Contact & Confirm",
    description:
      "Call the pharmacy directly to confirm availability and reserve your medicine.",
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Get Your Medicine",
    description:
      "Visit the pharmacy or opt for delivery if available in your area.",
  },
];

const HowItWorks = () => {
  return (
    <Section className="py-20 bg-card" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Finding your medicine is simple and fast. Just four easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connector Line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                )}

                <div className="text-center">
                  {/* Icon Circle */}
                  <div className="relative inline-flex">
                    <div className="bg-primary text-white p-6 rounded-full">
                      <Icon className="size-8" />
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-sm font-bold size-8 rounded-full flex items-center justify-center border-4 border-card">
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mt-6">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
