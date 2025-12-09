import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <Section
      className="py-20 bg-gradient-to-br from-primary to-secondary"
      id="cta"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-primary">
          Ready to Get Started?
        </h2>
        <p className="mt-6 text-lg text-black/90 max-w-2xl mx-auto leading-relaxed">
          Join thousands of patients, pharmacies, and charities making
          healthcare more accessible in Lebanon. Sign up for free today.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 bg-primary text-black hover:bg-white/90 border-0"
          >
            <Link href="/register">
              Get Started Free
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-base px-8 py-6 bg-primary text-black hover:bg-white/10"
          >
            <Link href="/login">Already have an account? Sign in</Link>
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-white/70 text-sm">
            ✓ Free forever &nbsp;•&nbsp; ✓ No credit card required &nbsp;•&nbsp;
            ✓ Verified pharmacies
          </p>
        </div>
      </div>
    </Section>
  );
};

export default CTA;
