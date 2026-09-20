import React, { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { EduButton } from "@/components/elements/EduButton";
import { EduAsasLogo } from "@/components/elements/EduasasLogo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export const AdaptiveHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor user scroll to refine elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="main-adaptive-header"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b backdrop-blur-md",
        isScrolled
          ? "bg-background/90 border-border shadow-xs"
          : "bg-background/75 border-border/50"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          id="header-brand-logo"
          role="button"
          tabIndex={0}
          className="flex items-center cursor-pointer select-none group min-h-[44px] focus:outline-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <EduAsasLogo 
            imageWidth={34} 
            imageHeight={34} 
            titleClasses="text-lg font-bold tracking-tight ml-2 flex items-center"
            eduClasses="text-foreground"
            asasClasses="text-primary"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a 
            href="#features" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
          >
            Features
          </a>
          <a 
            href="#grading" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
          >
            Grading Rules
          </a>
          <a 
            href="#pricing" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
          >
            Pricing
          </a>
          <a 
            href="#about" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 py-1"
          >
            About
          </a>
        </nav>

        {/* Desktop Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          
          <a href="/login">
            <EduButton 
              variant="ghost" 
              size="md"
              className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium min-h-[40px] px-4"
            >
              Sign In
            </EduButton>
          </a>
          <a href="/register">
            <EduButton 
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="font-medium px-4 min-h-[40px] border border-primary/20"
            >
              Get Account
            </EduButton>
          </a>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact />

          <button
            id="mobile-nav-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-menu"
          className="md:hidden px-5 pt-3 pb-6 border-b border-border bg-background/95 backdrop-blur-md"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-sm font-medium py-3 px-2 rounded-md text-foreground hover:bg-muted border-b border-border/40"
            >
              Features
            </a>
            <a 
              href="#grading" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-sm font-medium py-3 px-2 rounded-md text-foreground hover:bg-muted border-b border-border/40"
            >
              Grading Rules
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-sm font-medium py-3 px-2 rounded-md text-foreground hover:bg-muted border-b border-border/40"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-sm font-medium py-3 px-2 rounded-md text-foreground hover:bg-muted border-b border-border/40"
            >
              About
            </a>

            <div className="pt-4 flex flex-col gap-2.5">
              <a href="/login" className="w-full">
                <EduButton variant="outline" size="md" className="w-full justify-center min-h-[44px] border-border text-foreground hover:bg-muted">
                  Sign In
                </EduButton>
              </a>
              <a href="/register" className="w-full">
                <EduButton 
                  variant="primary" 
                  size="md" 
                  icon={ArrowRight} 
                  iconPosition="right" 
                  className="w-full justify-center min-h-[44px] border border-primary/20"
                >
                  Get Account
                </EduButton>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AdaptiveHeader;
