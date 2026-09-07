import React, { useState, useEffect } from "react";
import { Globe, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";

export const AdaptiveHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fuatilia scroll ya mtumiaji ili kubadilisha mandhari ya header kiotomatiki
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
        isScrolled 
        ? "bg-zinc-900/70 backdrop-blur-md border-zinc-800/80 text-white shadow-lg"
        : "bg-white/90 backdrop-blur-md border-zinc-200/80 text-zinc-900" )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* 1. Logo & Enterprise Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${
            isScrolled 
              ? "bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-inner" 
              : "bg-blue-600/10 border-blue-500/20 text-blue-600 shadow-sm"
          }`}>
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight flex items-center gap-1.5">
              EduAsas
            </span>
          </div>
        </div>

        {/* 2. Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a 
            href="#features" 
            className={`transition-colors duration-200 hover:opacity-100 ${
              isScrolled ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Features
          </a>
          <a 
            href="#grading" 
            className={`transition-colors duration-200 hover:opacity-100 ${
              isScrolled ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Grading Rules
          </a>
          <a 
            href="#pricing" 
            className={`transition-colors duration-200 hover:opacity-100 ${
              isScrolled ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Pricing
          </a>
          <a 
            href="#about" 
            className={`transition-colors duration-200 hover:opacity-100 ${
              isScrolled ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            About
          </a>
        </nav>

        {/* 3. Pro Action Buttons (Sign In & Register School) */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/login">
            <Button 
              variant="ghost" 
              className={`transition-colors duration-200 ${
                isScrolled 
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80" 
                  : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              Sign In
            </Button>
          </a>
          <a href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-medium px-5 transition-all duration-200 hover:scale-[1.02]">
              Get Account <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
        </div>

        {/* Mobile Menu Trigger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className={`p-2.5 rounded-xl border transition-colors ${
              isScrolled 
                ? "bg-zinc-800/80 border-zinc-700 text-white" 
                : "bg-zinc-100 border-zinc-200 text-zinc-900"
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-6 pt-4 pb-8 border-b transition-all duration-300 shadow-xl ${
          isScrolled ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        }`}>
          <div className="flex flex-col gap-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium py-2 border-b border-zinc-800/40"
            >
              Features
            </a>
            <a 
              href="#grading" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium py-2 border-b border-zinc-800/40"
            >
              Grading Rules
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium py-2 border-b border-zinc-800/40"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium py-2"
            >
              About
            </a>
            <div className="pt-4 flex flex-col gap-3">
              <a href="/login" className="w-full">
                <Button variant="outline" className="w-full justify-center h-11">Sign In</Button>
              </a>
              <a href="/schools/create" className="w-full">
                <Button className="w-full justify-center h-11 bg-blue-600 hover:bg-blue-700 text-white">
                  Get Account <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdaptiveHeader; // Note: fixed syntax typo check below if needed, use export default AdaptiveHeader;