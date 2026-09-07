import { Link } from 'react-router-dom';
import { Button } from "@/components/atoms";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white text-center relative overflow-hidden border-t border-blue-800/50">
      
      {/* Decorative Background Grid/Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Small Highlight Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-6 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Launch Your School Platform Today</span>
        </div>

        {/* Main Title */}
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
          Ready to transform your school's workflow?
        </h2>

        {/* Subtitle */}
        <p className="text-blue-100/90 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Join modern educational institutions across Tanzania leveraging EduAsas for complete administrative control, automated grading rules, and secure subdomains.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link to="/schools/create" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 px-8 h-13 font-bold shadow-xl shadow-black/25 transition-transform hover:scale-105">
              Register Your School Now <ArrowRight className="w-4 h-4 ml-2 text-blue-600" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 border-blue-400/40 text-white hover:bg-blue-800/50 backdrop-blur-sm">
              Sign In to Portal
            </Button>
          </Link>
        </div>

        {/* Trust Footer Notes inside CTA */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200/70 font-medium pt-6 border-t border-blue-800/60 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Subdomain Provisioning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Necta & Standard Grading Ready</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default FinalCtaSection;