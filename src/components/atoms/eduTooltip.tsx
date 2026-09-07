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
  useInteractions,
  safePolygon,
  Placement,
} from "@floating-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib";

interface Props {
  children: React.ReactElement;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}

export  function EduTooltip({ 
  children, 
  content, 
  side = "bottom",
  disabled = false 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, middlewareData, placement, context } = useFloating({
    open: isOpen && !disabled,
    onOpenChange: setIsOpen,
    placement: side as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ 
        fallbackPlacements: ["top", "right", "bottom", "left"],
        padding: 8 
      }),
      shift({ padding: 12 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { 
    move: false, 
    handleClose: safePolygon(),
    delay: { open: 150, close: 50 },
    enabled: !disabled 
  });
  
  const focus = useFocus(context, { enabled: !disabled });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);

  const handlePointerDown = () => setIsOpen(false);

  // LOGIC YA KUBADILISHA DIRECTION YA ARROW
  const currentSide = placement.split("-")[0];
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[currentSide] as string;

  // HAPA NDIPO TUNAGEUZA BORDER KULINGANA NA UPANDE

  const arrowBorderClasses = {
    top: "border-b border-r",    // Inatazama chini
    bottom: "border-t border-l", // Inatazama juu
    left: "border-t border-r",   // Inatazama kulia
    right: "border-b border-l",  // Inatazama kushoto
  }[currentSide] || "border-t border-l";

  const isHorizontal = currentSide === "left" || currentSide === "right";

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  if (!content || disabled) return <>{children}</>;

  return (
    <>
      {React.cloneElement(children as React.ReactElement<any>, {
        ref: refs.setReference,
        ...getReferenceProps({
          onPointerDown: handlePointerDown, 
        }),
      })}

      <AnimatePresence>
        {isOpen && !disabled && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[9999] pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1, ease: "circOut" }}
              className={cn(
                "relative  py-1.5 px-3 rounded-xl whitespace-nowrap",
                "bg-zinc-700  text-zinc-50 font-medium dark:bg-zinc-100",
                "dark:text-zinc-900 text-sm backdrop-blur-md shadow-2xl",
                arrowBorderClasses
              )}
            >
              {content}

              {/* ARROW (TRIANGLE) FIXED */}
              <div
                ref={arrowRef}
                style={{
                  left: arrowX != null ? `${arrowX}px` : "",
                  top: arrowY != null ? `${arrowY}px` : "",
                  [staticSide]: isHorizontal ? "-3.5px" : "-3px", // Imesogezwa kidogo ili ifiche border ya nyuma
                }}
                className={`
                  absolute 
                  w-[6px] h-[6px] 
                  rotate-45 
                  bg-zinc-700 
                  dark:bg-zinc-100 
                  border-border
                `}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}