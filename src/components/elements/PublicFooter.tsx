import React from "react";
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  Building2, 
  Layers 
} from "lucide-react";
import { 
  FaTwitter as Twitter,
  FaLinkedin as Linkedin,
  FaGithub as Github,
  FaInstagram as Instagram,
  FaFacebook as Facebook,
} from "react-icons/fa";

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-900 text-zinc-400 overflow-hidden border-t border-zinc-800">
      {/* Background Radial Gradient Dots Pattern Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-45 pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        
        {/* 1. SEHEMU YA JUU: Brand Statement & Social Media */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-zinc-800/80 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">EduAsas</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-xl">
              The ultimate multi-tenant school management and academic performance platform built specifically for modern educational institutions. Engineered for absolute speed, reliability, and precision.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-4 items-start sm:items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Connect with us</span>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              ].map(({ icon: Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SEHEMU YA KATI: Grid ya Links, Resources, Address & Contacts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-zinc-800/80 text-sm">
          
          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <Layers className="w-4 h-4 text-blue-500" /> Platform
            </h4>
            <ul className="space-y-2.5">
              <li><a href="/features" className="hover:text-white transition-colors">Core Features</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="/schools/create" className="hover:text-white transition-colors">Register School</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">School Portal Login</a></li>
              <li><a href="/directory" className="hover:text-white transition-colors">School Directory</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Resources
            </h4>
            <ul className="space-y-2.5">
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/grading-rules" className="hover:text-white transition-colors">Grading Rules (Necta/Standard)</a></li>
              <li><a href="/api-docs" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">EduAsas Blog</a></li>
              <li><a href="/help" className="flex items-center gap-1.5 hover:text-white transition-colors"><HelpCircle className="w-3.5 h-3.5" /> Help Center</a></li>
            </ul>
          </div>

          {/* Headquarters / Address */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <MapPin className="w-4 h-4 text-amber-500" /> Headquarters
            </h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li><span className="text-zinc-300 font-medium">EduAsas Technologies Ltd.</span></li>
              <li><span>P.O. Box 1234, Mlimani City</span></li>
              <li><span>Dar es Salaam, Tanzania</span></li>
              <li className="pt-1">
                <a href="/security" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Security
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-xs">
              <Building2 className="w-4 h-4 text-purple-500" /> Contacts
            </h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="mailto:support@eduasas.co.tz" className="hover:text-white truncate transition-colors">support@eduasas.co.tz</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="mailto:sales@eduasas.co.tz" className="hover:text-white truncate transition-colors">sales@eduasas.co.tz</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="tel:+255700000000" className="hover:text-white transition-colors">+255 700 000 000</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="tel:+255711000000" className="hover:text-white transition-colors">+255 711 000 000</a>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. SEHEMU YA CHINI: Copyright & Rollboy Services Branding */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {currentYear} EduAsas Platform. All rights reserved.</p>
          
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-800/50 border border-zinc-800 px-3.5 py-1.5 rounded-full shadow-sm">
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