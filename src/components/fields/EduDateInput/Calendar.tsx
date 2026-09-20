"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import {
  WEEK_DAYS_SHORT,
  MONTHS_FULL,
  getCalendarGrid,
  pad,
  toComparable,
  isSameDay,
  DateInputMessages,
} from "./date-utils";
import { MonthPicker } from "./MonthPicker";

interface CalendarProps {
  value: Date | null;
  viewDate: Date;
  onChange: (date: Date) => void;
  onNavigate: (date: Date) => void;
  min?: Date | null;
  max?: Date | null;
  disabled?: boolean;
  messages: DateInputMessages;
}

export function Calendar({
  value,
  viewDate,
  onChange,
  onNavigate,
  min,
  max,
  disabled,
  messages,
}: CalendarProps) {
  const { year, month, total, start } = getCalendarGrid(viewDate);
  const today = new Date();

  const [drillIntoMonths, setDrillIntoMonths] = useState(false);

  if (drillIntoMonths) {
    return (
      <MonthPicker
        value={viewDate}
        viewYear={year}
        onChange={(d) => {
          onNavigate(d);
          setDrillIntoMonths(false);
        }}
        onYearChange={(y) => onNavigate(new Date(y, month, 1))}
        min={min}
        max={max}
        disabled={disabled}
      />
    );
  }

  function isDisabledDay(day: number) {
    const cmp = `${year}-${pad(month + 1)}-${pad(day)}`;
    if (min && cmp < toComparable(min)) return true;
    if (max && cmp > toComparable(max)) return true;
    return false;
  }

  function selectDay(day: number) {
    if (disabled || isDisabledDay(day)) return;
    onChange(new Date(year, month, day));
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onNavigate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setDrillIntoMonths(true)}
          aria-label={`${MONTHS_FULL[month]} ${year}, choose a different month or year`}
          className="text-sm font-semibold text-foreground hover:text-primary rounded px-2 py-0.5 transition-colors focus-visible:outline-none cursor-pointer"
        >
          {MONTHS_FULL[month]} {year}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onNavigate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {/* Grid */}
      <div role="grid" aria-label={`${MONTHS_FULL[month]} ${year}`}>
        <div className="grid grid-cols-7 mb-1" role="row">
          {WEEK_DAYS_SHORT.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="text-center text-[11px] font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 gap-1" role="rowgroup">
          {Array.from({ length: start }).map((_, i) => (
            <div key={`lead-${i}`} aria-hidden="true" className="aspect-square" />
          ))}

          {Array.from({ length: total }).map((_, i) => {
            const day = i + 1;
            const cellDate = new Date(year, month, day);
            const isSelected = isSameDay(value, cellDate);
            const isToday = isSameDay(today, cellDate);
            const isDisabled = Boolean(disabled) || isDisabledDay(day);

            return (
              <div key={day} role="gridcell" className="flex items-center justify-center aspect-square">
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={cellDate.toDateString()}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "w-full max-w-[36px] aspect-square rounded-md text-xs font-medium transition-colors cursor-pointer",
                    "text-foreground hover:bg-muted",
                    "focus-visible:outline-none",
                    isToday && !isSelected && "text-primary font-bold border border-primary/40",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}

          {Array.from({ length: Math.max(0, 42 - start - total) }).map((_, i) => (
            <div key={`trail-${i}`} aria-hidden="true" className="aspect-square" />
          ))}
        </div>
      </div>

      {/* Today shortcut */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onNavigate(new Date(today.getFullYear(), today.getMonth(), 1));
          onChange(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        }}
        className="mt-3 w-full rounded-md bg-muted/50 py-1.5 text-xs font-medium text-primary hover:bg-muted transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        {messages.today}
      </button>
    </div>
  );
}
