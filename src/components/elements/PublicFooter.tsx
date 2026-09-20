import React from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  Building2, 
  Layers,
  Globe
} from "lucide-react";
import { EduAsasLogo } from "./EduasasLogo";

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-950 text-zinc-400 overflow-hidden border-t border-border">
      {/* Background Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        
        {/* Brand Statement & Socials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-border/60 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center">
              <EduAsasLogo 
                imageWidth={34} 
                imageHeight={34} 
                titleClasses="text-xl font-bold tracking-tight ml-2 flex items-center"
                eduClasses="text-white"
                asasClasses="text-primary-400"
              />
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xl">
              The modern multi-tenant school management and academic performance platform built specifically for Tanzanian educational institutions. Engineered for speed, security, and precision.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:justify-end gap-3 items-start sm:items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-border text-xs text-zinc-300">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>eduasas.co.tz</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-border/60 text-sm">
          
          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <Layers className="w-4 h-4 text-primary" /> Platform
            </h4>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Core Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Register School</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">School Portal Login</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Resources
            </h4>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li><a href="#grading" className="hover:text-white transition-colors">Grading Rules (NECTA/Standard)</a></li>
              <li><a href="/help" className="flex items-center gap-1.5 hover:text-white transition-colors"><HelpCircle className="w-3.5 h-3.5" /> Help Center</a></li>
              <li><a href="/policies" className="hover:text-white transition-colors">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Headquarters */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <MapPin className="w-4 h-4 text-amber-400" /> Headquarters
            </h4>
            <ul className="space-y-1.5 text-zinc-400 text-xs">
              <li><span className="text-zinc-200 font-medium">EduAsas Technologies Ltd.</span></li>
              <li><span>P.O. Box 1234, Mlimani City</span></li>
              <li><span>Dar es Salaam, Tanzania</span></li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-primary-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Security
                </span>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <Building2 className="w-4 h-4 text-sky-400" /> Contacts
            </h4>
            <ul className="space-y-1.5 text-zinc-400 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="mailto:support@eduasas.co.tz" className="hover:text-white truncate transition-colors">support@eduasas.co.tz</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="tel:+255700000000" className="hover:text-white transition-colors">+255 700 000 000</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Rollboy Services Branding */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {currentYear} EduAsas Platform. All rights reserved.</p>
          
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900 border border-border px-3.5 py-1.5 rounded-md">
            <span>Engineered with excellence by</span>
            <strong className="text-zinc-200 font-semibold">Rollboy Services</strong>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PublicFooter;
