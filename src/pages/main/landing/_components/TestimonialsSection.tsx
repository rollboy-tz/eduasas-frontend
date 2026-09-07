import React from "react";
import { MessageSquarePlus, Star, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms";

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      quote: "Managing our school timetable and student records used to take forever. Now everything is fast, and switching to Necta grading takes just a single click.",
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
    <section id="reviews" className="py-24 bg-slate-50/50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">User Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Trusted by teachers and school leaders
            </h2>
            <p className="text-slate-600 text-base">
              Here is what educators across different schools are saying about their daily experience using EduAsas.
            </p>
          </div>

          {/* Send Feedback CTA Button */}
          <div>
            <Link to="/feedback">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 gap-2 h-11 px-5 shadow-sm">
                <MessageSquarePlus className="w-4 h-4 text-blue-600" />
                <span>Send Feedback</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Reviews Grid (6 Comments) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-slate-200 mb-2" />
                <p className="text-slate-700 text-sm leading-relaxed mb-6">
                  "{review.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">{review.author}</h4>
                <p className="text-xs text-slate-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner for Additional Feedback Action */}
        <div className="p-8 rounded-2xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Have something to share about your experience?</h3>
            <p className="text-blue-100 text-sm">We are always eager to hear your thoughts and suggestions.</p>
          </div>
          <Link to="/feedback" className="shrink-0">
            <Button className="bg-white text-blue-600 hover:bg-slate-100 font-medium px-6 h-11">
              Send Feedback <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;