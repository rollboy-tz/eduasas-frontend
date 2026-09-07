import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Globe, Layers, Users } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-slate-950 text-white border-b border-zinc-800/80">
      
      {/* Artistic Background Gradients & Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement / AI Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Next-Gen Operating System for Tanzanian Schools</span>
          </div>
        </div>

        {/* Main Title & Broad Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Empowering Modern Education with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">Precision & Intelligence</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Manage institutional subdomains, automated Necta and Standard grading rules, secure team workspaces, and student lifecycles effortlessly from a single lightning-fast platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/schools/create" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-13 font-semibold shadow-xl shadow-blue-600/30 transition-transform hover:scale-105">
              Register Your School <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white backdrop-blur-sm">
              School Portal Login
            </Button>
          </Link>
        </div>

        {/* Artistic Glassmorphic UI Preview Mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4 backdrop-blur-xl shadow-2xl shadow-blue-950/40 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
          
          <div className="relative rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 sm:p-6 overflow-hidden">
            
            {/* Mockup Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>mzumbe.eduasas.co.tz</span>
              </div>
              <div className="text-xs text-zinc-500 font-medium">Enterprise Workspace</div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400">Total Students</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">1,482</div>
                <span className="text-[10px] text-emerald-400 font-medium mt-1">↑ Active enrollment profiles</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400">Grading System</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white">Necta / Standard</div>
                <span className="text-[10px] text-blue-400 font-medium mt-1">PLSE, CSEE & ACSEE Rules</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400">System Security</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">Isolated</div>
                <span className="text-[10px] text-emerald-400 font-medium mt-1">Subdomain protected</span>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Badges / Quick Highlights Under Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 pt-8 border-t border-zinc-900 text-sm text-zinc-400 font-medium">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Automated Necta & Standard Grading</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Secure Multi-Tenant Isolation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Role-Based Staff Collaboration</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;