"use client";

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/helper";
import { SelectMessages, defaultSelectMessages, validateSelect } from "./select-utils";
import { usePopoverPosition } from "./UsePopoverPositions";

export interface SelectClassNames {
  root?: string;
  trigger?: string;
  label?: string;
  popover?: string;
  helperText?: string;
  errorText?: string;
}

export interface SelectProps<T extends Record<string, any>, K extends keyof T = keyof T> {
  id?: string;
  name?: string;
  label?: string;
  /** Chaguo zote zinazoweza kuchaguliwa. */
  options: T[];
  /**
   * Thamani ya sasa - inaeleza RAW value (T[valueKey]), sio object nzima:
   * - single: T[K] | null
   * - multiple: T[K][]
   * Hii ndiyo inayolingana na kile `onChange` inachorudisha - round-trip
   * inafanya kazi bila mkanganyiko (tofauti na toleo la awali).
   */
  value?: T[K] | T[K][] | null;
  /**
   * Inaitwa kila mara uteuzi unapobadilika.
   * - `value`: raw value (au array ya raw values kama multiple) - ndiyo unayopaswa
   *   kuihifadhi kwenye state yako na kuipitisha tena kwenye `value` prop.
   * - `item`: object/objects kamili - kwa urahisi ukihitaji taarifa zaidi bila
   *   kutafuta tena kwenye `options`.
   */
  onChange?: (value: T[K] | T[K][] | null, item: T | T[] | null) => void;
  labelKey: keyof T;
  valueKey: K;
  iconKey?: keyof T;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  /** Onyesha kitufe cha kufuta uteuzi wote. */
  clearable?: boolean;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  /** Validator wako mwenyewe - rudisha ujumbe wa error, au undefined kama sawa. */
  validate?: (hasSelection: boolean) => string | undefined | void;
  /** Badilisha matini yoyote ya component (i18n-ready). */
  messages?: Partial<SelectMessages>;
  /** Formatter ya muhtasari kwenye multiple-select. Default: "3 selected". */
  formatSelectedSummary?: (count: number) => string;
  classNames?: SelectClassNames;
  className?: string;
}

const sizeStyles: Record<NonNullable<SelectProps<any>["size"]>, string> = {
  sm: "h-10 lg: px-2 text-sm",
  md: "h-11 lg:  px-3 text-base",
  lg: "h-12 lg: px-3.5 text-base",
};

function EduSelect<T extends Record<string, any>, K extends keyof T = keyof T>({
  id,
  name,
  label,
  options,
  value,
  onChange,
  labelKey,
  valueKey,
  iconKey,
  placeholder = "Select option",
  error,
  required,
  disabled,
  searchable = false,
  multiple = false,
  clearable = false,
  helperText,
  size = "md",
  validate,
  messages: messagesProp,
  formatSelectedSummary,
  classNames,
  className,
}: SelectProps<T, K>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const popoverId = `${inputId}-listbox`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const messages: SelectMessages = { ...defaultSelectMessages, ...messagesProp };
  const summary = formatSelectedSummary ?? ((n: number) => `${n} selected`);

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const typeaheadBuffer = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const position = usePopoverPosition(triggerRef, open);

  // ---- controlled selection - derived kutoka `value`, si internal state ---
  // (chanzo cha bug ya awali: internal `selected` state + useEffect sync
  // inaweza kupitwa na wakati/kuwa stale. Hii ni derivation safi kila render.)
  const selectedItems = useMemo<T[]>(() => {
    if (value === undefined || value === null) return [];
    const values = Array.isArray(value) ? value : [value];
    return options.filter((item) => values.includes(item[valueKey]));
  }, [value, options, valueKey]);

  function isSelected(item: T) {
    return selectedItems.some((x) => x[valueKey] === item[valueKey]);
  }

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((item) => String(item[labelKey]).toLowerCase().includes(q));
  }, [options, search, searchable, labelKey]);

  const hasSelection = selectedItems.length > 0;
  const internalError = useMemo(
    () => validateSelect(hasSelection, { required, validate, messages }),
    [hasSelection, required, validate, messages]
  );
  const finalError = error ?? internalError;
  const hasError = Boolean(finalError);

  const displayText =
    selectedItems.length === 0
      ? ""
      : multiple
        ? summary(selectedItems.length)
        : String(selectedItems[0][labelKey]);

  // ---- open/close lifecycle -----------------------------------------------
  function closePopover() {
    setOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    const initialIndex = filtered.findIndex((item) => isSelected(item));
    setHighlightedIndex(filtered.length ? Math.max(0, initialIndex) : -1);
    if (searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !searchable) return;
    setHighlightedIndex(filtered.length ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    itemRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  // ---- outside click --------------------------------------------------
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const popoverEl = document.getElementById(popoverId);
      if (popoverEl?.contains(target)) return;
      setOpen(false);
      setSearch("");
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open, popoverId]);

  // ---- keyboard navigation (arrow/home/end/enter/escape/typeahead) -------
  useEffect(() => {
    if (!open) return;

    function moveHighlight(delta: number) {
      if (filtered.length === 0) return;
      setHighlightedIndex((prev) => {
        if (prev < 0) return delta > 0 ? 0 : filtered.length - 1;
        return (prev + delta + filtered.length) % filtered.length;
      });
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopover();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveHighlight(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveHighlight(-1);
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setHighlightedIndex(filtered.length ? 0 : -1);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setHighlightedIndex(filtered.length ? filtered.length - 1 : -1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        setHighlightedIndex((current) => {
          if (current >= 0 && filtered[current]) choose(filtered[current]);
          return current;
        });
        return;
      }
      // Typeahead - tumika tu wakati searchable ni false, vinginevyo herufi
      // zinapaswa kuingia kwenye search input badala yake.
      if (!searchable && e.key.length === 1 && /\S/.test(e.key)) {
        typeaheadBuffer.current += e.key.toLowerCase();
        if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
        typeaheadTimer.current = setTimeout(() => {
          typeaheadBuffer.current = "";
        }, 500);

        const matchIndex = filtered.findIndex((item) =>
          String(item[labelKey]).toLowerCase().startsWith(typeaheadBuffer.current)
        );
        if (matchIndex >= 0) setHighlightedIndex(matchIndex);
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, searchable, labelKey]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled || open) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  }

  // ---- selection logic --------------------------------------------------
  function choose(item: T) {
    if (multiple) {
      const currentValues = (Array.isArray(value) ? value : []) as T[K][];
      const already = currentValues.includes(item[valueKey]);
      const nextValues = already
        ? currentValues.filter((v) => v !== item[valueKey])
        : [...currentValues, item[valueKey]];
      const nextItems = options.filter((o) => nextValues.includes(o[valueKey]));
      onChange?.(nextValues, nextItems);
      // multiple - popover inabaki wazi kwa uteuzi zaidi
    } else {
      onChange?.(item[valueKey], item);
      closePopover();
    }
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.(multiple ? [] : null, multiple ? [] : null);
  }

  const canRenderPortal = typeof document !== "undefined";

  return (
    <div className={cn("relative flex flex-col w-full gap-1.5 overflow-hidden rounded-md", classNames?.root, className)}>
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

      {name && (
        <input
          type="hidden"
          name={name}
          value={value == null ? "" : Array.isArray(value) ? value.join(",") : String(value)}
        />
      )}

      <div
        className={cn(
          "w-full rounded-t-md overflow-hidden transition-colors",
          disabled && "opacity-60"
        )}
      >
        <div
          ref={triggerRef}
          id={inputId}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          aria-activedescendant={
            open && highlightedIndex >= 0 ? `${popoverId}-option-${highlightedIndex}` : undefined
          }
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
          <span className={cn("flex-1 truncate", displayText ? "text-gray-900" : "text-gray-400")}>
            {displayText || placeholder}
          </span>

          {clearable && hasSelection && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              aria-label={messages.clear}
              className="shrink-0 grid place-items-center p-0 m-0 h-4 w-4 border-0 bg-transparent leading-none text-gray-400 hover:text-gray-700 transition-colors appearance-none"
            >
              <X size={15} />
            </button>
          )}

          <ChevronDown
            size={18}
            className={cn("shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
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
            role="listbox"
            aria-multiselectable={multiple || undefined}
            aria-label={label ?? "Options"}
            style={{
              position: "fixed",
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className={cn(
              "z-[9999] flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
              "animate-[dateinput-pop_0.12s_ease-out]",
              classNames?.popover
            )}
          >
            {searchable && (
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={messages.searchPlaceholder}
                className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            )}

            <div className="overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">{messages.noResults}</div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = iconKey ? (item[iconKey] as LucideIcon | undefined) : undefined;
                  const selected = isSelected(item);

                  return (
                    <button
                      key={String(item[valueKey])}
                      id={`${popoverId}-option-${idx}`}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      role="option"
                      aria-selected={selected}
                      type="button"
                      onClick={() => choose(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors text-gray-700",
                        idx === highlightedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {Icon && <Icon size={16} className="shrink-0 text-gray-400" />}
                        <span className="truncate">{String(item[labelKey])}</span>
                      </span>

                      {multiple ? (
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            selected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                          )}
                        >
                          {selected && <Check size={12} className="text-white" />}
                        </span>
                      ) : (
                        selected && <Check size={16} className="shrink-0 text-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}

      {hasError ? (
        <p id={errorId} role="alert" className={cn("text-sm text-red-600", classNames?.errorText)}>
          {finalError}
        </p>
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

export { EduSelect };