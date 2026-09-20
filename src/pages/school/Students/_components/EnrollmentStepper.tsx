// path: src/components/students/EnrollmentStepper.tsx

/**
 * @file Stepper header mpya - horizontal progress bar yenye circles
 * zinazounganishwa na line inayojaa (animated fill) badala ya ile ya
 * awali (compact prev/next circle pekee). Minimal kwa makusudi - hakuna
 * step titles zote kuonekana kwa wakati mmoja (zingelemea UI), caption
 * moja tu ya step ya sasa chini ya stepper.
 */
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/";

export interface StepperStep {
  id: string;
  title: string;
}

export interface EnrollmentStepperProps {
  steps: StepperStep[];
  activeIndex: number;
  /** Inaitwa mtu akibofya step yoyote - parent inaamua kama kuruhusu (validation). */
  onStepClick: (stepId: string) => void;
}

export function EnrollmentStepper({ steps, activeIndex, onStepClick }: EnrollmentStepperProps) {
  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${activeIndex + 1} of ${steps.length}: ${steps[activeIndex].title}`}
    >
      <div className="flex items-center w-full">
        {steps.map((step, i) => {
          const isComplete = i < activeIndex;
          const isActive = i === activeIndex;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                aria-label={step.title}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "relative shrink-0 flex items-center  text-sm justify-center rounded-full transition-all duration-300 cursor-pointer",
                  isActive ? "h-9 w-9 font-bold" : "h-8.5 w-8.5 font-bold",
                  isComplete && "bg-blue-500 text-white",
                  isActive && "bg-blue-500 text-white ring-4 ring-blue-500/15",
                  !isComplete && !isActive && "bg-gray-200 text-white"
                )}
              >
                {isComplete ? <Check className="h-4.5 w-4.5" strokeWidth={3} /> : i + 1}
              </button>

              {i < steps.length - 1 && (
                <div className="flex-1 h-[3px] mx-2 rounded-full bg-gray-300 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                    initial={false}
                    animate={{ width: isComplete ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <motion.p
        key={steps[activeIndex].id}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-5 text-center text-base font-bold text-gray-500 tracking-wide"
      >
        {steps[activeIndex].title}
      </motion.p>
    </div>
  );
}