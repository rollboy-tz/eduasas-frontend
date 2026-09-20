import React from "react";
import { Users, Globe2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EduButton } from "@/components/elements/EduButton";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      title: "Team Workspace & Role Collaboration",
      description: "Empower teachers and administrative staff to collaborate seamlessly in a unified workspace, with granular permission controls mapped strictly to their assigned roles."
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
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      title: "Strict Authentication & Accountability",
      description: "Mandatory multi-layer authentication for all team members guarantees absolute transparency, secure audit trails, and strict governance across every academic workflow."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Enterprise Capabilities</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for security, collaboration, and scale
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Designed from the ground up to give educational institutions absolute control over their digital infrastructure.
          </p>
        </div>

        {/* Features 3-Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center ${feature.color} mb-5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered CTA */}
        <div className="text-center">
          <Link to="/register">
            <EduButton 
              variant="outline" 
              size="md" 
              icon={ArrowRight} 
              iconPosition="right"
              className="border-border text-foreground hover:bg-muted"
            >
              Explore Complete Academic Features
            </EduButton>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
