"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/helper";

interface YearPickerProps {
  value: Date | null;
  viewYear: number;
  onChange: (date: Date) => void;
  onNavigate: (year: number) => void;
  min?: Date | null;
  max?: Date | null;
  disabled?: boolean;
}

export function YearPicker({
  value,
  viewYear,
  onChange,
  onNavigate,
  min,
  max,
  disabled,
}: YearPickerProps) {
  const startYear = Math.floor(viewYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);
  const minYear = min?.getFullYear();
  const maxYear = max?.getFullYear();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onNavigate(startYear - 12)}
          aria-label="Previous years"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="text-sm font-semibold text-foreground">
          {startYear} - {startYear + 11}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onNavigate(startYear + 12)}
          aria-label="Next years"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => {
          const isSelected = value?.getFullYear() === year;
          const isDisabled =
            Boolean(disabled) ||
            (minYear !== undefined && year < minYear) ||
            (maxYear !== undefined && year > maxYear);

          return (
            <button
              key={year}
              type="button"
              disabled={isDisabled}
              aria-selected={isSelected}
              onClick={() => onChange(new Date(year, 0, 1))}
              className={cn(
                "rounded-md py-2 text-xs font-medium transition-colors cursor-pointer",
                "text-foreground hover:bg-muted",
                "focus-visible:outline-none",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
