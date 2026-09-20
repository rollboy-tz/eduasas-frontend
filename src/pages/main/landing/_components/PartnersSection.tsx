import React from "react";
import { School, GraduationCap, Building, ShieldCheck } from "lucide-react";

export const PartnersSection: React.FC = () => {
  const partners = [
    {
      icon: School,
      title: "Primary Schools",
      subtitle: "PSLE Grading & Management",
      description: "Optimized for standard primary school operations, student registrations, and 50/100-point grading rules."
    },
    {
      icon: GraduationCap,
      title: "Secondary Schools",
      subtitle: "CSEE Curriculum Support",
      description: "Built to handle ordinary level student records, staff allocations, and terminal examinations seamlessly."
    },
    {
      icon: Building,
      title: "Advanced High Schools",
      subtitle: "ACSEE & Advanced Tiers",
      description: "Comprehensive administrative tools tailored for high schools managing complex subject combinations and grading."
    },
    {
      icon: ShieldCheck,
      title: "Multi-Tenant Infrastructure",
      subtitle: "Secure Subdomain Isolation",
      description: "Providing every registered academic institution with a dedicated, highly secure, and isolated digital environment."
    }
  ];

  return (
    <section className="py-16 bg-muted/40 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Ecosystem & Coverage</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Engineered for every tier of education in Tanzania
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            From primary academies to advanced high schools, EduAsas powers institutional workflows end-to-end.
          </p>
        </div>

        {/* Partners / Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div 
                key={index} 
                className="p-5 rounded-lg bg-card border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1">{partner.title}</h3>
                  <span className="text-xs font-semibold text-primary mb-2 block">{partner.subtitle}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PartnersSection;
