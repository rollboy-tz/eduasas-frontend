import React from "react";
import { School, GraduationCap, Building, ShieldCheck } from "lucide-react";

export const PartnersSection: React.FC = () => {
  const partners = [
    {
      icon: School,
      title: "Primary Schools",
      subtitle: "PLSE Grading & Management",
      description: "Optimized for standard primary school operations, student registrations, and 50/100-point grading rules."
    },
    {
      icon: GraduationCap,
      title: "Secondary Schools",
      subtitle: "CSEE Curriculum Support",
      description: "Built to handle ordinary level student records, parent communications, and internal terminal exams seamlessly."
    },
    {
      icon: Building,
      title: "Advanced High Schools",
      subtitle: "ACSEE & Advanced Tiers",
      description: "Comprehensive administration tools tailored for high schools managing complex subject combinations and grading."
    },
    {
      icon: ShieldCheck,
      title: "Multi-Tenant Infrastructure",
      subtitle: "Secure Subdomain Isolation",
      description: "Providing every registered academic institution with a dedicated, highly secure, and isolated digital environment."
    }
  ];

  return (
    <section className="py-20 bg-slate-50/80 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Ecosystem & Coverage</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Engineered for every tier of education in Tanzania
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From primary academies to advanced high schools, EduAsas powers institutional workflows end-to-end.
          </p>
        </div>

        {/* Partners / Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div 
                key={index} 
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-text text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{partner.title}</h3>
                <span className="text-xs font-semibold text-blue-600 mb-2.5 block">{partner.subtitle}</span>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {partner.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PartnersSection;