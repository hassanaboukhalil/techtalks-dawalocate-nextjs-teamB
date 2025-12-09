import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Hero from "@/components/pages-components/landing/Hero";
import TrustBadges from "@/components/pages-components/landing/TrustBadges";
import Features from "@/components/pages-components/landing/Features";
import HowItWorks from "@/components/pages-components/landing/HowItWorks";
import ForPatients from "@/components/pages-components/landing/ForPatients";
import ForPharmacies from "@/components/pages-components/landing/ForPharmacies";
import ForCharities from "@/components/pages-components/landing/ForCharities";
import Testimonials from "@/components/pages-components/landing/Testimonials";
import FAQ from "@/components/pages-components/landing/FAQ";
import CTA from "@/components/pages-components/landing/CTA";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "DawaLocate - Find Medicines, Save Lives | Lebanon's Medicine Locator",
  description:
    "Find nearby pharmacies with your needed medicines in stock. Connect patients, pharmacies, and charities around hard-to-find medications in Lebanon. Free, verified, and real-time.",
  keywords:
    "medicine finder Lebanon, pharmacy locator, find medicine, Lebanon pharmacies, medicine availability, donate medicine, medicine donation, health card Lebanon, QR health card",
  openGraph: {
    title: "DawaLocate - Find Medicines, Save Lives",
    description:
      "Quickly locate nearby pharmacies with your needed medicines in stock. Connect with donors and charities around hard-to-find medications.",
    type: "website",
    locale: "en_US",
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBadges />
        <Features />
        <HowItWorks />
        <ForPatients />
        <ForPharmacies />
        <ForCharities />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
