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
 * usePopoverPosition
 *
 * Inakokotoa nafasi ya popover kwa `position: fixed` (relative to viewport),
 * hivyo popover HAIWEZI kukatwa na `overflow: hidden` ya wazazi wowote -
 * suluhisho pekee la kuaminika kwa tatizo hilo, ndiyo maana tunatumia
 * pamoja na React Portal (`createPortal(popover, document.body)`).
 *
 * - Inageuka juu (top) kama hakuna nafasi ya kutosha chini
 * - Inabana (clamp) kushoto/kulia isizidi ukingo wa dirisha
 * - Inaweka maxHeight sahihi + overflow-y auto ndani ya popover yenyewe
 * - Inasikiliza scroll (capture: true - inashika scroll ya container yoyote
 *   ya ndani, si dirisha tu) na resize ili ibaki sahihi
 */
export function usePopoverPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  popoverWidth = 288,
  gap = 8
): PopoverPosition | null {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Upana kamwe usizidi viewport (screen ndogo/simu) - hii ndiyo inazuia
    // overflow-x kabisa hata kama popoverWidth iliyotolewa ni kubwa kuliko dirisha.
    const width = Math.min(popoverWidth, viewportWidth - gap * 2);

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const minComfortable = 300;

    const placement: "bottom" | "top" =
      spaceBelow >= minComfortable || spaceBelow >= spaceAbove ? "bottom" : "top";

    // Anza kwa kufuata trigger, kisha bana (clamp) ndani ya viewport pande zote mbili
    let left = rect.left;
    left = Math.min(left, viewportWidth - width - gap);
    left = Math.max(gap, left);

    if (placement === "bottom") {
      setPosition({
        left,
        width,
        maxHeight: Math.max(160, spaceBelow),
        placement,
        top: rect.bottom + gap,
      });
    } else {
      setPosition({
        left,
        width,
        maxHeight: Math.max(160, spaceAbove),
        placement,
        bottom: viewportHeight - rect.top + gap,
      });
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
    // capture: true - inakamata scroll events za container yoyote ya ndani
    // (scroll haina bubble, lakini ina capture), si dirisha peke yake
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open, compute]);

  return position;
}