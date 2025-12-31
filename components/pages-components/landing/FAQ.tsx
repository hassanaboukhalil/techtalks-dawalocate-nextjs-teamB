"use client";

import Section from "@/components/layout/Section";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "Is DawaLocate free to use?",
    answer:
      "Yes! DawaLocate is completely free for patients to search for medicines. Pharmacies and charities also have free access to basic features. Our mission is to make healthcare accessible to everyone in Lebanon.",
  },
  {
    id: 2,
    question: "How accurate is the medicine availability information?",
    answer:
      "Pharmacies update their inventory in real-time through our platform. However, we always recommend calling the pharmacy to confirm availability before visiting, as stock can change quickly during high demand.",
  },
  {
    id: 3,
    question: "How do I register my pharmacy?",
    answer:
      "Click on 'Register' and select 'Pharmacy' as your account type. You'll need to provide your pharmacy license and business information. Our team reviews all pharmacy applications within 24-48 hours to ensure authenticity.",
  },
  {
    id: 4,
    question: "Can I donate medicines through DawaLocate?",
    answer:
      "Yes! As a patient, you can list unused, unopened medicines you'd like to donate. You can also browse medicine requests from others in need. Charities can create campaigns for specific medicines they're collecting.",
  },
  {
    id: 5,
    question: "What is the QR Health Card?",
    answer:
      "The QR Health Card is a digital health profile you can create that includes your medical conditions, allergies, current medications, and emergency contact. In emergencies, healthcare providers can scan your QR code to access this critical information.",
  },
  {
    id: 6,
    question: "How do I request a hard-to-find medicine?",
    answer:
      "Sign up, navigate to 'My Requests', and add the medicine details. Pharmacies, donors, and charities can see your request and contact you directly if they can help.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section className="py-20 bg-background" id="faq">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about DawaLocate
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-card rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="size-5 text-primary shrink-0" />
                ) : (
                  <Plus className="size-5 text-primary shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center p-8 bg-secondary rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Our team is here to help you get the most out of DawaLocate.
          </p>
          <a
            href="mailto:info@dawalocate.com"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </Section>
  );
};

export default FAQ;
