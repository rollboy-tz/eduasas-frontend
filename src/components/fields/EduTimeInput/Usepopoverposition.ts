import { useCallback, useLayoutEffect, useState, RefObject } from "react";

export interface PopoverPosition {
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
  top?: number;
  bottom?: number;
}

/**
 * usePopoverPosition - sawa kabisa na ile ya date-input/select-input:
 * position:fixed + portal, overflow-safe, responsive clamp kwa simu.
 */
export function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  popoverWidth = 260,
  gap = 8
): PopoverPosition | null {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const width = Math.min(popoverWidth, viewportWidth - gap * 2);

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const minComfortable = 260;

    const placement: "bottom" | "top" =
      spaceBelow >= minComfortable || spaceBelow >= spaceAbove ? "bottom" : "top";

    let left = rect.left;
    left = Math.min(left, viewportWidth - width - gap);
    left = Math.max(gap, left);

    if (placement === "bottom") {
      setPosition({ left, width, maxHeight: Math.max(200, spaceBelow), placement, top: rect.bottom + gap });
    } else {
      setPosition({ left, width, maxHeight: Math.max(200, spaceAbove), placement, bottom: viewportHeight - rect.top + gap });
    }
  }, [triggerRef, popoverWidth, gap]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    compute();
    const handle = () => compute();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open, compute]);

  return position;
}