import { useCallback, useLayoutEffect, useState, RefObject } from "react";

export interface PopoverPosition {
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
  top?: number;
  bottom?: number;
}

export interface UsePopoverPositionOptions {
  /** Upana fasta kwa px - unapuuzwa kama `matchTriggerWidth` ni true. */
  width?: number;
  /** Dropdown ifuate upana wa trigger (default true - tabia ya kawaida ya select). */
  matchTriggerWidth?: boolean;
  gap?: number;
}

/**
 * usePopoverPosition
 *
 * Inakokotoa nafasi ya popover kwa `position: fixed` (relative to viewport),
 * hivyo popover HAIWEZI kukatwa na `overflow: hidden` ya wazazi wowote.
 * Tumia pamoja na React Portal (`createPortal(popover, document.body)`).
 *
 * - Inageuka juu (top) kama hakuna nafasi ya kutosha chini
 * - Upana unabanwa (clamp) usizidi ukingo wa dirisha - responsive kwenye simu
 * - Default: dropdown inafuata upana wa trigger (kama select ya kawaida)
 */
export function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  options?: UsePopoverPositionOptions
): PopoverPosition | null {
  const { width: fixedWidth, matchTriggerWidth = true, gap = 6 } = options ?? {};
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const desiredWidth = matchTriggerWidth ? rect.width : fixedWidth ?? rect.width;
    const width = Math.min(desiredWidth, viewportWidth - gap * 2);

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const minComfortable = 220;

    const placement: "bottom" | "top" =
      spaceBelow >= minComfortable || spaceBelow >= spaceAbove ? "bottom" : "top";

    let left = rect.left;
    left = Math.min(left, viewportWidth - width - gap);
    left = Math.max(gap, left);

    if (placement === "bottom") {
      setPosition({
        left,
        width,
        maxHeight: Math.max(140, spaceBelow),
        placement,
        top: rect.bottom + gap,
      });
    } else {
      setPosition({
        left,
        width,
        maxHeight: Math.max(140, spaceAbove),
        placement,
        bottom: viewportHeight - rect.top + gap,
      });
    }
  }, [triggerRef, fixedWidth, matchTriggerWidth, gap]);

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