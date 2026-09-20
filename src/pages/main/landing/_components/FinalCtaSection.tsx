import { Link } from 'react-router-dom';
import { EduButton } from "@/components/elements/EduButton";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-card text-foreground text-center relative overflow-hidden border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Subtle Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Your School Platform Today</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight text-foreground">
          Ready to transform your school's workflow?
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
          Join modern educational institutions across Tanzania leveraging EduAsas for complete administrative control, automated grading rules, and secure subdomains.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link to="/register" className="w-full sm:w-auto">
            <EduButton 
              size="lg" 
              variant="primary" 
              icon={ArrowRight} 
              iconPosition="right" 
              className="w-full sm:w-auto min-h-[44px] px-7"
            >
              Register Your School
            </EduButton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <EduButton 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto min-h-[44px] px-7 border-border text-foreground hover:bg-muted"
            >
              School Portal Login
            </EduButton>
          </Link>
        </div>

        {/* Trust Footer Notes */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-6 border-t border-border max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Instant Subdomain Provisioning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>NECTA & Standard Grading Ready</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default FinalCtaSection;
