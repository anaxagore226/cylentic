import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingCapabilities } from "@/components/landing/landing-capabilities";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingTeam } from "@/components/landing/landing-team";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingContact } from "@/components/landing/landing-contact";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCapabilities />
        <LandingTestimonials />
        <LandingTeam />
        <LandingPricing />
        <LandingFaq />
        <LandingContact />
      </main>

      <LandingFooter />
    </div>
  );
}
