"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle2,
  X,
  LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/helper";
import {
  DateMode,
  DateOutputFormat,
  DateInputMessages,
  defaultDateInputMessages,
  toDate,
  formatDate,
  resolveOutputValue,
  validateDate,
} from "./date-utils";
import { usePopoverPosition } from "./usePopoverPosition";
import { Calendar } from "./Calendar";
import { MonthPicker } from "./MonthPicker";
import { YearPicker } from "./YearPicker";

export interface EduDateInputClassNames {
  root?: string;
  trigger?: string;
  label?: string;
  popover?: string;
  helperText?: string;
  errorText?: string;
}

export interface EduDateInputProps {
  /** id ya HTML - ikikosekana, itazalishwa moja kwa moja (kwa label association). */
  id?: string;
  /** Jina la field - linatumika kwenye hidden input, muhimu kwa forms za kawaida (non-JS submit). */
  name?: string;
  /** Label inayoonekana juu ya field. */
  label?: string;
  /** Thamani ya sasa - inaweza kuwa Date, ISO-ish string, au null/undefined. */
  value?: string | Date | null;
  /**
   * Inaitwa kila mara thamani inapobadilika.
   * - `value`: string iliyo-format kwa mujibu wa `outputFormat`
   * - `date`: Date halisi ya JS (au null ikiwa imefutwa) - kwa uhuru kamili
   */
  onChange: (value: string, date: Date | null) => void;
  /** Aina ya uteuzi. */
  mode?: DateMode;
  /** Format ya kuonyesha kwenye trigger (tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D). */
  displayFormat?: string;
  /**
   * Format ya thamani inayorudishwa kwenye onChange (param ya kwanza):
   * - "iso" (default) -> YYYY-MM-DD / YYYY-MM / YYYY
   * - pattern string   -> mfano "DD/MM/YYYY"
   * - "iso-datetime"        -> Iso string salama dhidi ya time zone
   */
  outputFormat?: DateOutputFormat;
  placeholder?: string;
  /** Kikomo cha chini - Date au ISO-ish string. */
  min?: string | Date;
  /** Kikomo cha juu - Date au ISO-ish string. */
  max?: string | Date;
  /** Error ya nje (mfano kutoka form library) - ikiwepo, inashinda validation ya ndani. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
  helperText?: string;
  clearable?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  /** Validator wako mwenyewe - rudisha ujumbe wa error, au undefined kama sawa. */
  validate?: (date: Date | null) => string | undefined | void;
  /** Badilisha matini yoyote ya component (i18n-ready) - unahitaji tu ku-override unachotaka. */
  messages?: Partial<DateInputMessages>;
  /** Upana wa popover kwa px - default 288 (w-72). */
  popoverWidth?: number;
  /** classNames za kina kwa kila sehemu - kwa customization ya hali ya juu. */
  classNames?: EduDateInputClassNames;
  className?: string;
}

const sizeStyles: Record<NonNullable<EduDateInputProps["size"]>, string> = {
  sm: "h-9 lg:h-8 px-2 text-sm",
  md: "h-10 lg:h-9 px-3 text-base",
  lg: "h-11 lg:h-10 px-3.5",
};

function EduDateInput({
  id,
  name,
  label,
  value,
  onChange,
  mode = "date",
  displayFormat,
  outputFormat = "iso",
  placeholder = "Select date",
  min,
  max,
  error,
  required,
  disabled,
  showSuccess,
  successMessage,
  helperText,
  clearable = true,
  icon: Icon,
  size = "md",
  validate,
  messages: messagesProp,
  popoverWidth = 288,
  classNames,
  className,
}: EduDateInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const popoverId = `${inputId}-popover`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const messages: DateInputMessages = { ...defaultDateInputMessages, ...messagesProp };

  // BUG ILIYOREKEBISHWA: `displayFormat` ilikuwa na default fasta
  // ("DD MMM YYYY") bila kujali `mode` - hivyo hata mode="year" ilionyesha
  // "01 Jan 2026" badala ya "2026" tu, na mode="month" ilionyesha siku
  // pia. Sasa default inafuata mode, isipokuwa uipitishe wewe mwenyewe.
  const resolvedDisplayFormat =
    displayFormat ?? (mode === "year" ? "YYYY" : mode === "month" ? "MMMM YYYY" : "DD MMM YYYY");

  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const date = useMemo(() => toDate(value), [value]);
  const minDate = useMemo(() => toDate(min), [min]);
  const maxDate = useMemo(() => toDate(max), [max]);

  const [viewDate, setViewDate] = useState<Date>(date ?? new Date());
  const [yearView, setYearView] = useState<number>((date ?? new Date()).getFullYear());

  useEffect(() => {
    if (date) {
      setViewDate(date);
      setYearView(date.getFullYear());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const position = usePopoverPosition(triggerRef, open, popoverWidth);

  const internalError = useMemo(
    () => validateDate(date, { required, min: minDate ?? undefined, max: maxDate ?? undefined, validate, messages }),
    [date, required, minDate, maxDate, validate, messages]
  );
  const finalError = error ?? internalError;
  const hasError = Boolean(finalError);

  const displayValue = date ? formatDate(date, resolvedDisplayFormat) : "";

  // ---- outside click + escape -------------------------------------------
  useEffect(() => {
    if (!open) return;

    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const popoverEl = document.getElementById(popoverId);
      if (popoverEl?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, popoverId]);

  /**
   * Funga popover na URUDISHE focus kwenye trigger.
   *
   * Bila hii: unapobofya siku/mwezi/mwaka ndani ya popover, kitufe hicho
   * (ambacho ndicho kilikuwa na DOM focus) kinaondolewa kwenye DOM popover
   * inapofungwa - hivyo focus "inapotea" kabisa (inarudi document.body).
   * Trigger inajikuta bila `focused=true`, underline inarudi kwenye hali ya
   * kupumzika, na inaonekana kama "underline imetoweka baada ya kuchagua
   * value" - kumbe ni focus tu iliyopotea, si tatizo la value.
   *
   * requestAnimationFrame inasubiri DOM ya popover kuondolewa kwanza kabla
   * ya kurudisha focus, ili kitendo kiwe sahihi na kisimame vizuri.
   */
  function closePopover() {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function commit(nextDate: Date) {
    const outValue = resolveOutputValue(nextDate, mode, outputFormat);
    onChange(outValue, nextDate);
    if (mode === "date") closePopover();
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("", null);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function renderPicker() {
    if (mode === "date") {
      return (
        <Calendar
          value={date}
          viewDate={viewDate}
          onChange={commit}
          onNavigate={setViewDate}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          messages={messages}
        />
      );
    }
    if (mode === "month") {
      return (
        <MonthPicker
          value={date}
          viewYear={viewDate.getFullYear()}
          onChange={(d) => {
            commit(d);
            closePopover();
          }}
          onYearChange={(year) => setViewDate(new Date(year, viewDate.getMonth(), 1))}
          min={minDate}
          max={maxDate}
          disabled={disabled}
        />
      );
    }
    return (
      <YearPicker
        value={date}
        viewYear={yearView}
        onChange={(d) => {
          commit(d);
          closePopover();
        }}
        onNavigate={setYearView}
        min={minDate}
        max={maxDate}
        disabled={disabled}
      />
    );
  }

  const canRenderPortal = typeof document !== "undefined";

  return (
    <div className={cn("relative flex flex-col rounded-md overflow-hidden w-full gap-1.5", classNames?.root, className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn("text-sm font-medium text-gray-900", classNames?.label)}
        >
          {label}
          {required && (
            <span className="text-red-600 ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Hidden input - inasaidia native <form> submit bila JS state ya nje */}
      {name && <input type="hidden" name={name} value={resolveOutputValue(date, mode, outputFormat)} />}

      {/* Windows11-style: box tambarare + underline inayopanuka kwenye focus, badala ya border pande zote */}
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
            <CalendarDays size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
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

          {showSuccess && displayValue && !hasError && (
            <CheckCircle2 size={17} className="shrink-0 text-green-600" aria-hidden="true" />
          )}
        </div>

        {/* Underline - mstari wa msingi (rest state, umepakwa rangi kutegemea error)
            + bar inayopanuka toka katikati (active state - inategemea focus/open TU,
            si error, ili isibadilike ghafla value inapobadilika) */}
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
            aria-modal="false"
            aria-label={label ?? "Date picker"}
            style={{
              position: "fixed",
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className={cn(
              "z-[9999] overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-lg",
              "animate-[dateinput-pop_0.12s_ease-out]",
              classNames?.popover
            )}
          >
            {renderPicker()}
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

export  { EduDateInput };