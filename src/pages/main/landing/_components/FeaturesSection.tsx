import React from "react";
import { Users, Globe2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      title: "Team Workspace & Role Collaboration",
      description: "Empower teachers and administrative staff to collaborate seamlessly in a unified workspace, with granular permission controls mapped strictly to their assigned system roles."
    },
    {
      icon: Globe2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      title: "Isolated Subdomain Architecture",
      description: "Every registered institution receives a dedicated, lightning-fast subdomain (e.g., mzumbe.eduasas.co.tz) ensuring complete data isolation and instant access links."
    },
    {
      icon: ShieldCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      title: "Strict Authentication & Accountability",
      description: "Mandatory multi-layer authentication for all team members guarantees absolute transparency, secure audit trails, and strict governance across every academic workflow."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Enterprise Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Built for security, collaboration, and scale
          </h2>
          <p className="text-slate-600 text-base">
            Designed from the ground up to give educational institutions absolute control over their digital infrastructure.
          </p>
        </div>

        {/* Features 3-Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="p-8 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore More Features Link / Button */}
        <div className="text-center">
          <Link 
            to="/features" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>Explore all platform features</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;