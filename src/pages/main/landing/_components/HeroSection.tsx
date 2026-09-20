import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Globe, Layers, Users } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section 
      id="hero-section"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-background text-foreground border-b border-border"
    >
      {/* Subtle architectural dot grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Modern Operating System for Tanzanian Schools</span>
          </div>
        </div>

        {/* Main Heading & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-5 mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Empowering Modern Education with{" "}
            <span className="text-primary">Precision & Reliability</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage institutional subdomains, automated NECTA and standard grading rules, team workspaces, and student lifecycles seamlessly in one unified cloud system.
          </p>
        </div>

        {/* Action Buttons with 44px min touch target */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground px-7 font-semibold border border-primary/20">
              Register Your School <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[44px] px-7 border-border text-foreground hover:bg-muted font-medium">
              School Portal Login
            </Button>
          </Link>
        </div>

        {/* Clean Enterprise SaaS Mockup */}
        <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-2 sm:p-3 shadow-xs">
          <div className="rounded-lg border border-border/80 bg-background p-4 sm:p-6">
            
            {/* Mockup Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              
              <div className="px-3 py-1 rounded-md bg-muted border border-border text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>mzumbe.eduasas.co.tz</span>
              </div>
              
              <div className="text-xs text-muted-foreground font-medium hidden sm:block">
                Enterprise Workspace
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-lg bg-card border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Total Students</span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">1,482</div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Active enrollment profiles
                </span>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Grading System</span>
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">NECTA Standard</div>
                <span className="text-[11px] text-primary font-medium mt-1">
                  PSLE, CSEE & ACSEE Rules
                </span>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Tenant Isolation</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-foreground">Subdomain Safe</div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Encrypted & Isolated Data
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12 pt-6 border-t border-border text-xs sm:text-sm text-muted-foreground font-medium text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Automated NECTA Grading</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Dedicated Multi-Tenant Isolation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Staff Role Collaboration</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
