import React, { useState } from "react";
import { ChevronDown, HelpCircle, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [userQuestion, setUserQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I register a school on EduAsas?",
      answer: "You must first create a user account on the system. Once logged in, you will see a button to add a school on your dashboard. Simply click it and follow the step-by-step registration instructions.",
      link: "/docs/register-school"
    },
    {
      question: "How can I add staff members to my school?",
      answer: "After creating your school, navigate to the members menu on your dashboard. Select 'Add New Invitation', enter their details, assign their specific roles, and send the invitation link directly to them.",
      link: "/docs/managing-staff"
    },
    {
      question: "How do staff or team members join an already added school?",
      answer: "When invited, they will receive an email inbox notification or a text message. If they haven't received it, they can simply create an account using the exact email or phone number used for the invitation. Once logged in, they will find the school invitation waiting on their dashboard to join.",
      link: "/docs/joining-school"
    },
    {
      question: "How can parents view and track student information?",
      answer: "If the school enrolls a student and provides the parent's email or phone number as the guardian contact, the parent can create an account using those exact credentials. Once inside their dashboard, they will automatically see all students linked to their guardian profile. If they face any issues, they can contact school support.",
      link: "/docs/parent-portal"
    },
    {
      question: "How do parents receive student academic results?",
      answer: "Parents receive results through email reports or SMS notifications. If they have an active parent account, they can also view detailed performance on their dashboard. Additionally, if the school publishes results publicly on its subdomain, specific secure links will be shared or proper procedures will be provided.",
      link: "/docs/accessing-results"
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    setSubmitted(true);
    setUserQuestion("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Got Questions? We've Got Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base">
            Everything you need to know about setting up schools, managing staff, tracking students, and accessing results.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-slate-200/80 rounded-2xl bg-slate-50/40 overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 focus:outline-none"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 space-y-3">
                    <p>{faq.answer}</p>
                    <div className="pt-2">
                      <Link 
                        to={faq.link} 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>Learn more</span> &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ask a Question / Post Feedback Box */}
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
              <MessageCircle className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Have a question not listed here?</h3>
            <p className="text-slate-400 text-sm">
              Drop your question or post your inquiry below, and our support team will get back to you promptly.
            </p>

            <form onSubmit={handleQuestionSubmit} className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-grow px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 h-11 shrink-0">
                  <Send className="w-4 h-4 mr-2" /> Post Question
                </Button>
              </div>

              {submitted && (
                <p className="text-xs text-emerald-400 font-medium pt-1">
                  Thank you! Your question has been posted successfully. We will respond shortly.
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;