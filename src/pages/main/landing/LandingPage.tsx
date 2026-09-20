import React from "react";
import { AdaptiveHeader } from "@/components/elements/AdaptiveHeader";
import { PublicFooter } from "@/components/elements/PublicFooter";
import { 
  HeroSection, 
  PartnersSection, 
  FeaturesSection, 
  TestimonialsSection, 
  FaqSection, 
  FinalCtaSection 
} from "./_components";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* 1. Adaptive Header with Theme Toggle */}
      <AdaptiveHeader />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Partners / Educational Ecosystem Section */}
      <PartnersSection />

      {/* 4. Core Features Section */}
      <FeaturesSection />

      {/* 5. User Feedback & Testimonials Section */}
      <TestimonialsSection />

      {/* 6. Frequently Asked Questions Section */}
      <FaqSection />

      {/* 7. Final Conversion Call to Action */}
      <FinalCtaSection />

      {/* 8. Public Footer */}
      <PublicFooter />
    </div>
  );
};

export default LandingPage;
