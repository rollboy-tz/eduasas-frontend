"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/helper";

export interface TimeColumnItem {
  value: number | string;
  label: string;
  disabled?: boolean;
}

interface TimeColumnProps {
  items: TimeColumnItem[];
  selected: number | string | null;
  onSelect: (value: number | string) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export function TimeColumn({ items, selected, onSelect, ariaLabel, disabled }: TimeColumnProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = items.findIndex((item) => item.value === selected);
    if (index >= 0) {
      itemRefs.current[index]?.scrollIntoView({ block: "center" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={ariaLabel}
      className="h-56 w-full overflow-y-auto scroll-smooth py-2 snap-y snap-mandatory flex flex-col items-stretch [scrollbar-width:thin]"
    >
      {items.map((item, index) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={item.value}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={disabled || item.disabled}
            onClick={() => onSelect(item.value)}
            className={cn(
              "snap-center shrink-0 flex items-center justify-center w-full h-8 text-sm font-medium rounded-md transition-colors cursor-pointer",
              "text-foreground hover:bg-muted",
              "focus-visible:outline-none",
              isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
              (disabled || item.disabled) && "opacity-30 cursor-not-allowed hover:bg-transparent"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
