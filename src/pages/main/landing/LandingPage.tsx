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

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* 1. Adaptive Header (Inabadilika rangi inapofanya scroll) */}
      <AdaptiveHeader />

      {/* 2. Hero Section (Artistic, Modern Dark Theme with Mockup Preview) */}
      <HeroSection />

      {/* 3. Partners / Educational Ecosystem Section */}
      <PartnersSection />

      {/* 4. Core Features Section (Team Workspace, Subdomain Isolation, Authentication) */}
      <FeaturesSection />

      {/* 5. User Feedback / Reviews Section */}
      <TestimonialsSection />

      {/* 6. Frequently Asked Questions (FAQ) & Ask a Question Section */}
      <FaqSection />

      {/* 7. Final Conversion Call to Action Banner */}
      <FinalCtaSection />

      {/* 8. Public Footer (Dark w/ Dot Pattern & Rollboy Services Branding) */}
      <PublicFooter />

    </div>
  );
}

export default LandingPage;