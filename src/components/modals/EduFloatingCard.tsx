/**
 * @fileoverview EduFloatingDiv Component - Enterprise Edition
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.1.0
 */

import React, { useState } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useClick,
  useInteractions,
  FloatingPortal,
  Placement
} from "@floating-ui/react";
import { cn } from "@/lib/utils/helper";

/**
 * Properties for the EduFloatingDiv component.
 */
export interface EduFloatingDivProps {
  /** The element that triggers the floating content on click. */
  trigger: React.ReactNode;
  
  /** The content to be rendered inside the floating container. */
  children: React.ReactNode;
  
  /** Additional custom Tailwind CSS classes for the floating container. */
  className?: string;
  
  /** The preferred side of the trigger to render the floating content. */
  side?: "top" | "bottom" | "left" | "right";
  
  /** The alignment along the chosen side. */
  align?: "start" | "center" | "end";
  
  /** The gap/spacing between the trigger and the floating container in pixels. */
  spacing?: number;
}

/**
 * @component EduFloatingDiv
 * @description 
 * An advanced, high-performance floating wrapper component built on top of Floating UI. 
 * Manages positioning, flipping, shifting, click triggers, and portal rendering cleanly 
 * without enforcing any background colors or layout restrictions.
 * 
 * @example
 * ```tsx
 * <EduFloatingDiv trigger="{<button">Open Menu</button>} side="bottom" align="start">
 *   <div className="bg-card border border-border shadow-lg rounded-lg p-2">
 *     <p>Menu Item 1</p>
 *   </div>
 * </EduFloatingDiv>
 * ```
 */
export function EduFloatingDiv({
  trigger,
  children,
  className,
  side = "bottom",
  align = "center",
  spacing = 8
}: EduFloatingDivProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Unganisha side na align kupata placement format ya floating-ui (mfano: "bottom-start")
  const placement: Placement = `${side}-${align}` as Placement;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement,
    strategy: "fixed", // Imeashwa ili kuzuia popover "kuruka" au kukatwa na overflow containers wakati wa scroll
    middleware: [
      offset(spacing),
      flip({ padding: 10 }), // Inazuia iguse ukingo wa skrini
      shift({ padding: 10 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  /**
   * Computes the transform origin dynamically based on the active placement side 
   * to ensure smooth and natural scaling animations.
   */
  const getTransformOrigin = (currentSide: string) => {
    switch (currentSide) {
      case "top": return "bottom center";
      case "bottom": return "top center";
      case "left": return "center right";
      case "right": return "center left";
      default: return "center";
    }
  };

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className="inline-block">
        {trigger}
      </div>

      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              transformOrigin: getTransformOrigin(side), // Hapa sasa inafanya kazi kikamilifu kwenye animation!
              pointerEvents: isOpen ? "auto" : "none",
            }}
            {...getFloatingProps()}
            className={cn(
              "z-[9999] transition-all duration-200 ease-out", 
              isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0", 
              className // Hakuna background ya ziada iliyowekwa; inasoma darasa zako moja kwa moja!
            )}
          >
            {children}
          </div>
        )}
      </FloatingPortal>
    </>
  );
}