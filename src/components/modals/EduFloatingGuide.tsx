/**
 * @fileoverview EduFloatingGuide Component - Enterprise Edition
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.1.0-Beast
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, LucideIcon } from "lucide-react";
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  arrow, 
  useInteractions, 
  useClick, 
  useDismiss, 
  useRole,
  limitShift,
  Side
} from "@floating-ui/react";
import { cn } from "@/lib/utils/helper";

/**
 * Properties for the EduFloatingGuide component.
 */
export interface EduFloatingGuideProps {
  /** The title displayed at the top of the guide card. */
  title: string;
  
  /** The descriptive guide content rendered inside the body. */
  children: React.ReactNode;
  
  /** Text displayed on the trigger button. Defaults to "How it works?". */
  buttonText?: string;
  
  /** Custom Tailwind classes for the header container. */
  titleClassName?: string;
  
  /** Icon displayed on the trigger button. Defaults to `Info`. */
  triggerIcon?: LucideIcon;
  
  /** Icon displayed in the header badge inside the card. Defaults to `Info`. */
  headerIcon?: LucideIcon;
  
  /** Additional custom classes for the trigger button. */
  buttonClassName?: string;
  
  /** Additional custom classes for the floating guide card container. */
  cardClassName?: string;
  
  /** Visual variant theme for colors and borders. */
  variant?: "primary" | "warning" | "info";
  
  /** Preferred placement side. Defaults to "bottom". */
  side?: Side;
}

/**
 * @component EduFloatingGuide
 * @description 
 * An advanced, highly responsive floating guide popover built with Floating UI 
 * and Framer Motion. Features intelligent boundary shifting, smooth scaling animations, 
 * directional arrows, and full light/dark mode enterprise styling.
 */
export function EduFloatingGuide({
  title,
  children,
  buttonText = "How it works?",
  triggerIcon: TriggerIcon = Info,
  headerIcon: HeaderIcon = Info,
  buttonClassName,
  titleClassName = "",
  cardClassName,
  variant = "primary",
  side = "bottom",
}: EduFloatingGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: side,
    strategy: "fixed",
    middleware: [
      offset(12), // Nafasi safi kati ya kitufe na kadi
      flip({ fallbackAxisSideDirection: 'start' }),
      shift({ 
        padding: 16, 
        limiter: limitShift(), 
      }),
      arrow({ element: arrowRef }), // Arrow imewashwa rasmi kwa ajili ya muonekano wa kishua
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Rangi zilizosawazishwa kwa viwango vya Enterprise (Light & Dark mode safe)
  const variantStyles = {
    primary: "text-primary bg-primary/10 border-primary/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  // Hesabu za kuweka mshale kwenye upande sahihi kutokana na mahali kadi ilipojipenyeza
  const sideMapping = placement.split("-")[0] as Side;
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[sideMapping];

  return (
    <>
      {/* 1. TRIGGER BUTTON */}
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="button"
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all duration-200 shadow-sm hover:opacity-90 active:scale-95",
          variantStyles[variant],
          buttonClassName
        )}
      >
        <TriggerIcon size={14} className="shrink-0" />
        <span>{buttonText}</span>
      </button>

      {/* 2. INTELLIGENT FLOATING GUIDE CARD */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[9999] outline-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "w-[calc(100vw-32px)] md:w-[380px] p-4 rounded-xl border border-border bg-card text-card-foreground shadow-2xl backdrop-blur-xl relative",
                cardClassName
              )}
            >
              {/* Arrow Indicator */}
              <div
                ref={arrowRef}
                style={{
                  position: 'absolute',
                  left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
                  top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
                  [staticSide]: '-4px',
                }}
                className="w-2.5 h-2.5 bg-card border-l border-t border-border rotate-45"
              />

              {/* Header Content */}
              <div className={cn("flex items-start justify-between pb-3 mb-3 border-b border-border/40", titleClassName)}>
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-1.5 rounded-md", variantStyles[variant])}>
                    <HeaderIcon size={16} />
                  </div>
                  <h5 className="font-semibold text-sm text-foreground tracking-tight">{title}</h5>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                  aria-label="Close guide"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body Content */}
              <div className="text-xs text-muted-foreground leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}