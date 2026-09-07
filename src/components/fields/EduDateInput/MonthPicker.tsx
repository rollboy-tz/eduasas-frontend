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
  // "Ruka kwenye mwaka" - muhimu kwa mfano wa tarehe ya kuzaliwa (mtu wa
  // miaka 20+) ambapo kubonyeza prev/next mara nyingi ni kuchosha.
  // Bofya jina la mwaka -> orodha ya miaka 12 kwa wakati mmoja.
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
          className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-40"
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
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 rounded px-2 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {viewYear}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onYearChange(viewYear + 1)}
          aria-label="Next year"
          className="h-8 w-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-40"
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
                "rounded-md py-2 text-xs font-medium transition-colors text-gray-700",
                "hover:bg-gray-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
                isSelected && "bg-blue-600 text-white hover:bg-blue-600",
                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {month.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}