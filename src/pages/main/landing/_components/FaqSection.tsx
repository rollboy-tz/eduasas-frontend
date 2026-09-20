import React, { useState } from "react";
import { ChevronDown, HelpCircle, Send, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EduInput } from "@/components/fields/EduInput";
import { EduButton } from "@/components/elements/EduButton";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [userQuestion, setUserQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I register a school on EduAsas?",
      answer: "You must first create a user account on the system. Once logged in, you will see a button to add a school on your dashboard. Simply click it and follow the step-by-step registration instructions.",
      link: "/register"
    },
    {
      question: "How can I add staff members to my school?",
      answer: "After creating your school, navigate to the members menu on your dashboard. Select 'Add New Invitation', enter their details, assign their specific roles, and send the invitation link directly to them.",
      link: "/login"
    },
    {
      question: "How do staff or team members join an already added school?",
      answer: "When invited, they will receive an email inbox notification or a text message. They can create an account using the exact email or phone number used for the invitation. Once logged in, they will find the school invitation waiting on their dashboard to join.",
      link: "/register"
    },
    {
      question: "How can parents view and track student information?",
      answer: "If the school enrolls a student and provides the parent's email or phone number as the guardian contact, the parent can create an account using those exact credentials to view linked students.",
      link: "/login"
    },
    {
      question: "How do parents receive student academic results?",
      answer: "Parents receive results through email reports or SMS notifications. If they have an active parent account, they can also view detailed performance directly on their dashboard.",
      link: "/login"
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
    <section id="faq" className="py-20 bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions? We've Got Answers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Everything you need to know about setting up schools, managing staff, tracking students, and accessing results.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-14">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="border border-border rounded-lg bg-card overflow-hidden transition-colors"
              >
                <button
                  id={`faq-accordion-${index}`}
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-foreground focus:outline-none min-h-[44px]"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/50 space-y-2.5">
                    <p>{faq.answer}</p>
                    <div className="pt-1">
                      <Link 
                        to={faq.link} 
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ask a Question / Inquiry Box */}
        <div className="p-6 sm:p-8 rounded-lg bg-card border border-border">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <MessageCircle className="w-5 h-5" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Have a question not listed here?</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Send your inquiry below, and our support team will get back to you promptly.
            </p>

            <form onSubmit={handleQuestionSubmit} className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 items-start">
                <div className="w-full flex-grow text-left">
                  <EduInput
                    value={userQuestion}
                    onChange={(val) => setUserQuestion(val)}
                    placeholder="Type your inquiry here..."
                    size="md"
                    className="w-full text-foreground"
                  />
                </div>
                <EduButton 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  icon={Send} 
                  className="w-full sm:w-auto min-h-[44px] shrink-0"
                >
                  Send Inquiry
                </EduButton>
              </div>

              {submitted && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  Thank you! Your inquiry has been sent. We will respond shortly.
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
