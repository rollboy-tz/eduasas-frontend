import React from "react";
import { MessageSquarePlus, Star, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EduButton } from "@/components/elements/EduButton";

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      quote: "Managing our school timetable and student records used to take forever. Now everything is fast, and switching to NECTA grading takes just a single click.",
      author: "Mwl. Juma Magesa",
      role: "Headmaster, Tanganyika High School",
      rating: 5,
    },
    {
      quote: "Our teachers can easily update student marks and attendance from their own accounts without messing up other departments. Very simple to use.",
      author: "Mwenyeji Asha Kassim",
      role: "Academic Master, Arusha Secondary",
      rating: 5,
    },
    {
      quote: "The system runs smoothly even on our slow internet connection. Registering new students and tracking parent contacts is now super organized.",
      author: "Mwl. Baraka Mwakyusa",
      role: "Director, Mlimani Primary",
      rating: 5,
    },
    {
      quote: "We love having our own school link (subdomain). It makes our institution look professional, and parents can easily check announcements.",
      author: "Madam Grace Kimaro",
      role: "Director, Bright Future Academy",
      rating: 5,
    },
    {
      quote: "Generating exam reports at the end of the term is no longer a headache. The grading rules match exactly what we need for secondary levels.",
      author: "Mwl. Peter Joseph",
      role: "Teacher, Dodoma High School",
      rating: 5,
    },
    {
      quote: "Setting up our school account took less than five minutes. Customer support is helpful, and the interface is very clean and straight to the point.",
      author: "Mwl. Neema Shayo",
      role: "Teacher, Kilimanjaro Schools",
      rating: 5,
    },
  ];

  return (
    <section id="reviews" className="py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">User Feedback</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Trusted by teachers and school leaders
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here is what educators across different schools are saying about their daily experience using EduAsas.
            </p>
          </div>

          <div>
            <Link to="/feedback">
              <EduButton 
                variant="outline" 
                size="md" 
                icon={MessageSquarePlus} 
                className="border-border text-foreground hover:bg-muted min-h-[44px]"
              >
                Send Feedback
              </EduButton>
            </Link>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg bg-card border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-muted-foreground/30 mb-2" />
                <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed mb-4">
                  "{review.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <h4 className="font-bold text-foreground text-xs sm:text-sm">{review.author}</h4>
                <p className="text-[11px] text-muted-foreground">{review.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-6 rounded-lg bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-foreground">Have something to share about your experience?</h3>
            <p className="text-xs text-muted-foreground">We are always eager to hear your thoughts and suggestions.</p>
          </div>
          <Link to="/feedback" className="shrink-0">
            <EduButton 
              variant="primary" 
              size="md" 
              icon={ArrowRight} 
              iconPosition="right"
              className="min-h-[44px]"
            >
              Share Your Feedback
            </EduButton>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
