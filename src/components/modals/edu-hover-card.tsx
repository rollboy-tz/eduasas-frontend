/**
 * @fileoverview EduHoverCard Component - Enterprise Edition
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0-Enterprise
 */

"use client";

import React, { useState, useRef } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingArrow,
  FloatingPortal,
  Placement,
} from "@floating-ui/react";
import { cn } from "@/lib/utils/helper";

/**
 * Properties for the EduHoverCard component.
 */
export interface EduHoverCardProps {
  /** The element that triggers the hover card. */
  trigger: React.ReactNode;
  
  /** The content to be rendered inside the hover card. */
  children: React.ReactNode;
  
  /** Whether to show a directional pointer arrow. Defaults to true. */
  showArrow?: boolean;
  
  /** Additional custom Tailwind CSS classes for the card container. */
  className?: string;
  
  /** Preferred side to render the card. Defaults to "bottom". */
  side?: "top" | "bottom" | "left" | "right";
  
  /** Alignment along the chosen side. Defaults to "center". */
  align?: "start" | "center" | "end";
  
  /** Spacing/gap between the trigger and the card in pixels. Defaults to 8. */
  spacing?: number;
  
  /** Whether to render inside a React Portal to prevent clipping. Defaults to true. */
  portal?: boolean;
}

/**
 * @component EduHoverCard
 * @description 
 * An advanced, high-performance hover card component built on top of Floating UI. 
 * Features smooth hover interactions with intelligent delays, boundary shifting, 
 * directional pointing arrows, and portal rendering.
 * 
 * @example
 * ```tsx
 * <EduHoverCard className="underline" trigger="{<span">Hover me</span>} side="top">
 *   <div className="text-xs">Detailed tooltip or preview card info here.</div>
 * </EduHoverCard>
 * ```
 */
export function EduHoverCard({ 
  trigger, 
  children, 
  showArrow = true, 
  className,
  side = "bottom",
  align = "center",
  spacing = 8,
  portal = true
}: EduHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const placement: Placement = `${side}-${align}` as Placement;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement,
    strategy: "fixed", // Inazuia kadi kuruka wakati wa kusoma kurasa (scrolling)
    middleware: [
      offset(spacing),
      flip({ padding: 10 }), // Inajipindua ikigonga kingo za skrini
      shift({ padding: 10 }), // Inajisogeza isitoke nje kabisa
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Hover configuration yenye delay nzuri kuzuia kadi kujifunga ghafla
  const hover = useHover(context, {
    move: true, // Ruhusu panya kuhamia kwenye kadi bila kujifunga
    delay: { open: 150, close: 200 }, // Muda wa kusubiri kabla ya kufunguka au kufungwa
  });
  
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover, focus, dismiss, role,
  ]);

  const cardContent = (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="z-[9999] outline-none"
    >
      <div className={cn(
        "bg-card text-card-foreground border border-border shadow-xl rounded-xl p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md relative",
        className
      )}>
        {showArrow && (
          <FloatingArrow 
            ref={arrowRef} 
            context={context} 
            className="fill-card stroke-border" 
            strokeWidth={1}
          />
        )}
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className="inline-block">
        {trigger}
      </div>
      
      {isOpen && (
        portal ? <FloatingPortal>{cardContent}</FloatingPortal> : cardContent
      )}
    </>
  );
}