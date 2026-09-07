"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/helper";
import {
  TimeValue,
  TimeOutputFormat,
  TimeInputMessages,
  defaultTimeInputMessages,
  toTimeValue,
  combine12h,
  formatTime,
  resolveOutputValue,
  validateTime,
  toComparableSeconds,
} from "./time-utils";
import { usePopoverPosition } from "./Usepopoverposition";
import { TimeColumn, TimeColumnItem } from "./TimeColumn";

export interface EduTimeInputClassNames {
  root?: string;
  trigger?: string;
  label?: string;
  popover?: string;
  helperText?: string;
  errorText?: string;
}

export interface EduTimeInputProps {
  id?: string;
  name?: string;
  label?: string;
  /** Thamani ya sasa - Date, string ("HH:mm", "HH:mm:ss", "hh:mm A"), au null. */
  value?: string | Date | null;
  /**
   * `value`: string iliyo-format kwa mujibu wa `outputFormat`.
   * `time`: TimeValue halisi ({hours, minutes, seconds}) - kwa uhuru kamili.
   */
  onChange: (value: string, time: TimeValue | null) => void;
  /** "24h" (default - kawaida East Africa) au "12h" (na AM/PM column). */
  format?: "24h" | "12h";
  /** Onyesha column ya sekunde. Default false - dakika pekee kwa matumizi mengi. */
  withSeconds?: boolean;
  /** Hatua ya dakika - 1, 5, 15, 30 n.k. Default 5. */
  minuteStep?: number;
  /** Format ya kuonyesha kwenye trigger - default inafuata `format`. */
  displayFormat?: string;
  /** Format ya thamani inayorudishwa (param ya kwanza ya onChange). */
  outputFormat?: TimeOutputFormat;
  placeholder?: string;
  min?: string | Date;
  max?: string | Date;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
  helperText?: string;
  clearable?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  validate?: (time: TimeValue | null) => string | undefined | void;
  messages?: Partial<TimeInputMessages>;
  popoverWidth?: number;
  classNames?: EduTimeInputClassNames;
  className?: string;
}

const sizeStyles: Record<NonNullable<EduTimeInputProps["size"]>, string> = {
  sm: "h-9 lg:h-8 px-2 text-sm",
  md: "h-10 lg:h-9 px-3 text-base",
  lg: "h-11 lg:h-10 px-3.5",
};

export function EduTimeInput({
  id,
  name,
  label,
  value,
  onChange,
  format = "24h",
  withSeconds = false,
  minuteStep = 5,
  displayFormat,
  outputFormat = "24h",
  placeholder = "Select time",
  min,
  max,
  error,
  required,
  disabled,
  //showSuccess,
  successMessage,
  helperText,
  clearable = true,
  icon: Icon,
  size = "md",
  validate,
  messages: messagesProp,
  popoverWidth = format === "12h" ? (withSeconds ? 300 : 240) : withSeconds ? 260 : 180,
  classNames,
  className,
}: EduTimeInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const popoverId = `${inputId}-popover`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const messages: TimeInputMessages = { ...defaultTimeInputMessages, ...messagesProp };
  const resolvedDisplayFormat =
    displayFormat ?? (format === "12h" ? (withSeconds ? "hh:mm:ss A" : "hh:mm A") : withSeconds ? "HH:mm:ss" : "HH:mm");

  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const time = useMemo(() => toTimeValue(value), [value]);
  const minTime = useMemo(() => toTimeValue(min), [min]);
  const maxTime = useMemo(() => toTimeValue(max), [max]);

  // Draft ndani ya popover - inaruhusu mtumiaji kuchagua Saa kisha Dakika
  // bila kila click kufunga popover papo hapo (tofauti na Calendar ambapo
  // siku moja pekee ndiyo tarehe kamili).
  const [draft, setDraft] = useState<TimeValue>(
    time ?? { hours: format === "12h" ? 12 : 9, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (open) {
      setDraft(time ?? { hours: format === "12h" ? 12 : 9, minutes: 0, seconds: 0 });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const position = usePopoverPosition(triggerRef, open, popoverWidth);

  const internalError = useMemo(
    () => validateTime(time, { required, min: minTime, max: maxTime, validate, messages }),
    [time, required, minTime, maxTime, validate, messages]
  );
  const finalError = error ?? internalError;
  const hasError = Boolean(finalError);

  const displayValue = time ? formatTime(time, resolvedDisplayFormat) : "";

  function closePopover() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function commit(next: TimeValue) {
    setDraft(next);
    const outValue = resolveOutputValue(next, withSeconds, outputFormat);
    onChange(outValue, next);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("", null);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const popoverEl = document.getElementById(popoverId);
      if (popoverEl?.contains(target)) return;
      closePopover();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopover();
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popoverId]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  // ---- disabled-slot logic kwa min/max (approximation ya kimantiki) ------
  function isHourDisabled(h24: number) {
    const hourStart = h24 * 3600;
    const hourEnd = hourStart + 3599;
    if (minTime && hourEnd < toComparableSeconds(minTime)) return true;
    if (maxTime && hourStart > toComparableSeconds(maxTime)) return true;
    return false;
  }
  function isMinuteDisabled(h24: number, m: number) {
    if (minTime && h24 === minTime.hours && m < minTime.minutes) return true;
    if (maxTime && h24 === maxTime.hours && m > maxTime.minutes) return true;
    return false;
  }
  function isSecondDisabled(h24: number, m: number, s: number) {
    if (minTime && h24 === minTime.hours && m === minTime.minutes && s < minTime.seconds) return true;
    if (maxTime && h24 === maxTime.hours && m === maxTime.minutes && s > maxTime.seconds) return true;
    return false;
  }

  // ---- columns data ---------------------------------------------------
  const hourItems: TimeColumnItem[] = useMemo(() => {
    if (format === "12h") {
      return Array.from({ length: 12 }, (_, i) => i + 1).map((h12) => {
        const period: "AM" | "PM" = draft.hours < 12 ? "AM" : "PM";
        const h24 = combine12h(h12, period);
        return { value: h12, label: String(h12).padStart(2, "0"), disabled: isHourDisabled(h24) };
      });
    }
    return Array.from({ length: 24 }, (_, h) => ({ value: h, label: String(h).padStart(2, "0"), disabled: isHourDisabled(h) }));
  }, [format, draft.hours, minTime, maxTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const minuteItems: TimeColumnItem[] = useMemo(() => {
    const values: number[] = [];
    for (let m = 0; m < 60; m += minuteStep) values.push(m);
    if (!values.includes(draft.minutes)) values.push(draft.minutes);
    values.sort((a, b) => a - b);
    return values.map((m) => ({ value: m, label: String(m).padStart(2, "0"), disabled: isMinuteDisabled(draft.hours, m) }));
  }, [minuteStep, draft.hours, draft.minutes, minTime, maxTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const secondItems: TimeColumnItem[] = useMemo(() => {
    return Array.from({ length: 60 }, (_, s) => ({
      value: s,
      label: String(s).padStart(2, "0"),
      disabled: isSecondDisabled(draft.hours, draft.minutes, s),
    }));
  }, [draft.hours, draft.minutes, minTime, maxTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const periodItems: TimeColumnItem[] = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  const currentPeriod: "AM" | "PM" = draft.hours < 12 ? "AM" : "PM";
  const currentHour12 = draft.hours % 12 === 0 ? 12 : draft.hours % 12;

  function selectHour(v: number | string) {
    const h = Number(v);
    const h24 = format === "12h" ? combine12h(h, currentPeriod) : h;
    commit({ ...draft, hours: h24 });
  }
  function selectMinute(v: number | string) {
    commit({ ...draft, minutes: Number(v) });
  }
  function selectSecond(v: number | string) {
    commit({ ...draft, seconds: Number(v) });
  }
  function selectPeriod(v: number | string) {
    const period = v as "AM" | "PM";
    commit({ ...draft, hours: combine12h(currentHour12, period) });
  }

  const canRenderPortal = typeof document !== "undefined";

  return (
    <div className={cn("relative flex flex-col w-full rounded-md overflow-hidden gap-1.5", classNames?.root, className)}>
      {label && (
        <label htmlFor={inputId} className={cn("text-sm font-medium text-gray-900", classNames?.label)}>
          {label}
          {required && (
            <span className="text-red-600 ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {name && <input type="hidden" name={name} value={resolveOutputValue(time, withSeconds, outputFormat)} />}

      <div
        className={cn(
          "w-full transition-colors",
          disabled && "opacity-60 hover:bg-gray-50"
        )}
      >
        <div
          ref={triggerRef}
          id={inputId}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex items-center gap-2 w-full cursor-pointer",
            "focus-visible:outline-none",
            disabled && "cursor-not-allowed",
            sizeStyles[size],
            classNames?.trigger
          )}
        >
          {Icon ? (
            <Icon size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          ) : (
            <Clock size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          )}

          <span className={cn("flex-1 truncate", displayValue ? "text-gray-900" : "text-gray-400")}>
            {displayValue || placeholder}
          </span>

          {clearable && displayValue && !disabled && (
            <button
              type="button"
              onClick={clearValue}
              aria-label={messages.clear}
              className="shrink-0 grid place-items-center p-0 m-0 h-4 w-4 border-0 bg-transparent leading-none text-gray-400 hover:text-gray-700 transition-colors appearance-none"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="relative h-[2px] overflow-hidden">
          <div className={cn("absolute inset-0", hasError ? "bg-red-300" : "bg-primary-300")} />
          <div
            className={cn(
              "absolute left-1/2 top-0 h-full -translate-x-1/2 transition-[width] duration-200 ease-out",
              hasError ? "bg-red-500" : "bg-blue-600"
            )}
            style={{ width: open || focused ? "100%" : "0%" }}
          />
        </div>
      </div>

      {canRenderPortal &&
        open &&
        position &&
        createPortal(
          <div
            id={popoverId}
            role="dialog"
            aria-label={label ?? "Time picker"}
            style={{
              position: "fixed",
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className={cn(
              "z-[999] flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
              "animate-[dateinput-pop_0.12s_ease-out]",
              classNames?.popover
            )}
          >
            <div className="relative flex divide-x divide-gray-100 px-1">
              <TimeColumn items={hourItems} selected={format === "12h" ? currentHour12 : draft.hours} onSelect={selectHour} ariaLabel="Hour" disabled={disabled} />
              <TimeColumn items={minuteItems} selected={draft.minutes} onSelect={selectMinute} ariaLabel="Minute" disabled={disabled} />
              {withSeconds && (
                <TimeColumn items={secondItems} selected={draft.seconds} onSelect={selectSecond} ariaLabel="Second" disabled={disabled} />
              )}
              {format === "12h" && (
                <TimeColumn items={periodItems} selected={currentPeriod} onSelect={selectPeriod} ariaLabel="AM/PM" disabled={disabled} />
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  commit({ hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() });
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
              >
                {messages.now}
              </button>

              <button
                type="button"
                onClick={closePopover}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-md"
              >
                {messages.done}
              </button>
            </div>
          </div>,
          document.body
        )}

      {hasError ? (
        <p id={errorId} role="alert" className={cn("text-sm text-red-600", classNames?.errorText)}>
          {finalError}
        </p>
      ) : successMessage && displayValue && !hasError ? (
        <p className="text-sm text-green-600">{successMessage}</p>
      ) : helperText ? (
        <p id={helperId} className={cn("text-sm text-gray-500", classNames?.helperText)}>
          {helperText}
        </p>
      ) : null}

      {/* @ts-ignore: styled-jsx props */}
      <style jsx global>{`
        @keyframes dateinput-pop {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}