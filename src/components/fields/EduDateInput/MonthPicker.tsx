"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import { MONTHS_FULL, toComparable } from "./date-utils";
import { YearPicker } from "./YearPicker";

interface MonthPickerProps {
  value: Date | null;
  viewYear: number;
  onChange: (date: Date) => void;
  onYearChange: (year: number) => void;
  min?: Date | null;
  max?: Date | null;
  disabled?: boolean;
}

export function MonthPicker({
  value,
  viewYear,
  onChange,
  onYearChange,
  min,
  max,
  disabled,
}: MonthPickerProps) {
  const [yearJump, setYearJump] = useState(false);
  const [yearRangeAnchor, setYearRangeAnchor] = useState(viewYear);

  if (yearJump) {
    return (
      <YearPicker
        value={new Date(viewYear, 0, 1)}
        viewYear={yearRangeAnchor}
        onChange={(d) => {
          onYearChange(d.getFullYear());
          setYearJump(false);
        }}
        onNavigate={setYearRangeAnchor}
        min={min}
        max={max}
        disabled={disabled}
      />
    );
  }

  function isDisabledMonth(monthIndex: number) {
    const cmp = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    if (min) {
      const minCmp = toComparable(min).slice(0, 7);
      if (cmp < minCmp) return true;
    }
    if (max) {
      const maxCmp = toComparable(max).slice(0, 7);
      if (cmp > maxCmp) return true;
    }
    return false;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onYearChange(viewYear - 1)}
          aria-label="Previous year"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setYearRangeAnchor(viewYear);
            setYearJump(true);
          }}
          aria-label={`${viewYear}, choose a different year`}
          className="text-sm font-semibold text-foreground hover:text-primary rounded px-2 py-0.5 transition-colors focus-visible:outline-none cursor-pointer"
        >
          {viewYear}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onYearChange(viewYear + 1)}
          aria-label="Next year"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MONTHS_FULL.map((month, index) => {
          const isSelected =
            value !== null && value.getFullYear() === viewYear && value.getMonth() === index;
          const isDisabled = Boolean(disabled) || isDisabledMonth(index);

          return (
            <button
              key={month}
              type="button"
              disabled={isDisabled}
              aria-selected={isSelected}
              onClick={() => onChange(new Date(viewYear, index, 1))}
              className={cn(
                "rounded-md py-2 text-xs font-medium transition-colors cursor-pointer",
                "text-foreground hover:bg-muted",
                "focus-visible:outline-none",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
}
