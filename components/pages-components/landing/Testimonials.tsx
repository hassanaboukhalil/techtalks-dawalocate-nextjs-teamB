import Section from "@/components/layout/Section";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sara M.",
    role: "Patient",
    location: "Beirut",
    content:
      "I was desperately looking for my mother's diabetes medication. DawaLocate helped me find it in less than 5 minutes at a nearby pharmacy. This platform is a lifesaver!",
    rating: 5,
  },
  {
    id: 2,
    name: "Dr. Ahmed K.",
    role: "Pharmacy Owner",
    location: "Tripoli",
    content:
      "Since joining DawaLocate, we've connected with so many more patients. The inventory system is simple, and it saves us countless phone calls. Highly recommend!",
    rating: 5,
  },
  {
    id: 3,
    name: "Lebanese Red Cross",
    role: "Charity Organization",
    location: "Lebanon",
    content:
      "Our medicine donation campaigns have become so much more efficient with DawaLocate. We can target specific areas and medicines, and the community response has been amazing.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <Section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Trusted by the Community
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See what patients, pharmacies, and charities are saying about
            DawaLocate.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-background p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">
                  {testimonial.role} • {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Testimonials;
