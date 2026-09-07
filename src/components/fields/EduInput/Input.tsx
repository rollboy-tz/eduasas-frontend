"use client";

import React, { useId, useMemo } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, X, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/helper";
import { useInputEngine } from "./useInputEngine";
import { InputType } from "./types";
import { EngineMessages } from "./messages";

export interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  className?: string;
  /** Password ya kulinganisha - kwa type "confirm". */
  password?: string;
  placeholder?: string;
  helperText?: string;
  transform?: "uppercase" | "lowercase" | "capitalize" | "none";
  restrict?: "numbers" | "letters" | "alphanumeric" | "none";
  /** Error ya nje (mfano kutoka form library) - ikiwepo, inashinda validation ya ndani. */
  error?: string;
  successMessage?: string;
  value?: string;
  type?: InputType;
  required?: boolean;
  /** Idadi ya juu ya herufi (validation + counter). */
  maxValue?: number;
  minValue?: number;
  showValueCount?: boolean;
  showActionBtn?: boolean;
  /** Onyesha alama ya success/error kiotomatiki kutegemea validation halisi. */
  showStateIcon?: boolean;
  /** Onyesha kitufe cha kufuta. */
  clearable?: boolean;
  actionClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  /** Badilisha matini yoyote ya validation (i18n-ready). */
  messages?: Partial<EngineMessages>;
  onChange?: (value: string) => void;
  onError?: (error: string | null) => void;
}

const sizeStyles: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-9 lg:h-8 px-2 text-sm",
  md: "h-10 lg:h-9 px-3 text-base",
  lg: "h-11 lg:h-10 px-3.5",
};

export const Input = ({
  id,
  name,
  label,
  className,
  password,
  placeholder,
  helperText,
  value,
  onChange,
  onError,
  type = "text",
  transform,
  restrict,
  disabled,
  showValueCount,
  successMessage,
  showActionBtn,
  showStateIcon,
  clearable = true,
  maxValue,
  minValue,
  required,
  icon: Icon,
  error,
  size = "md",
  messages,
  actionClick,
}: InputProps) => {
  const [passHidden, setPassHidden] = React.useState(true);

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const countId = `${inputId}-count`;

  const isPassword = type === "password" || type === "confirm";

  const input = useInputEngine({
    value,
    password,
    type,
    required,
    transform,
    restrict,
    maxValue,
    minValue,
    messages,
    onChange,
    onError,
  });

  const htmlType = isPassword ? (passHidden ? "password" : "text") : type === "email" ? "email" : type === "url" ? "url" : "text";

  const errorMsg = error || input.error;
  const hasError = Boolean(errorMsg);

  /**
   * BUG ILIYOREKEBISHWA: awali `inputState` ilikuwa prop ya mkono ambayo
   * kama haikupitishwa, `inputState === "error"` ilikuwa `false`, na
   * component ilianguka kwenye TAWI LA "success" MOJA KWA MOJA - alama ya
   * kijani (CheckCircle2) ilionekana hata kwenye field TUPU isiyoguswa
   * bado. Sasa status inatokana na validation halisi ya engine - haihitaji
   * prop ya ziada ya kutunza mwenyewe, na haiwezi kutofautiana na ukweli.
   */
  const status: "error" | "success" | "idle" = !input.touched
    ? "idle"
    : hasError
      ? "error"
      : input.value
        ? "success"
        : "idle";

  const describedBy = useMemo(
    () =>
      [hasError ? errorId : null, helperText ? helperId : null, showValueCount ? countId : null]
        .filter(Boolean)
        .join(" ") || undefined,
    [hasError, helperText, showValueCount, errorId, helperId, countId]
  );

  function clearValue() {
    input.setValue("");
    onChange?.("");
  }

  return (
    <div className={cn("flex flex-col w-full gap-1.5", disabled && "cursor-not-allowed opacity-60")}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-900">
          {label}
          {required && (
            <span className="text-red-600 ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {name && <input type="hidden" name={name} value={input.value} />}

      {/* Windows11-style: box tambarare + underline - uniform na family nzima */}
      <div
        className={cn(
          "w-full rounded-md overflow-hidden transition-colors",
          disabled && "opacity-60 hover:bg-gray-50",
          className
        )}
      >
        <div className={cn("flex items-center gap-2 w-full", sizeStyles[size])}>
          {Icon && <Icon size={16} className="shrink-0 text-gray-400" aria-hidden="true" />}

          <input
            id={inputId}
            {...input.bind()}
            value={input.value}
            disabled={disabled}
            type={htmlType}
            placeholder={placeholder}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            className={cn(
              "peer flex-1 min-w-0 bg-transparent outline-none border-0 p-0",
              "text-gray-900 placeholder:text-gray-400",
              disabled && "cursor-not-allowed text-gray-400"
            )}
          />

          {clearable && input.value && !disabled && !isPassword && (
            <button
              type="button"
              onClick={clearValue}
              aria-label="Clear"
              className="shrink-0 grid place-items-center p-0 m-0 h-4 w-4 border-0 bg-transparent leading-none text-gray-400 hover:text-gray-700 transition-colors appearance-none"
            >
              <X size={15} />
            </button>
          )}

          {isPassword && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPassHidden((v) => !v)}
              aria-label={passHidden ? "Show password" : "Hide password"}
              aria-pressed={!passHidden}
              className="shrink-0 grid place-items-center p-0 m-0 h-4 w-4 border-0 bg-transparent leading-none text-gray-400 hover:text-gray-700 transition-colors appearance-none"
            >
              {passHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          )}

          {!isPassword && showStateIcon && status !== "idle" && (
            <span className="shrink-0" aria-hidden="true">
              {status === "error" ? (
                <AlertCircle size={16} className="text-red-500" />
              ) : (
                <CheckCircle2 size={16} className="text-green-600" />
              )}
            </span>
          )}

          {showActionBtn && (
            <button
              type="button"
              onClick={actionClick}
              disabled={disabled}
              aria-label="Submit"
              className="shrink-0 grid place-items-center p-0 m-0 h-5 w-5 border-0 bg-transparent leading-none text-blue-600 hover:text-blue-700 transition-colors appearance-none"
            >
              <ArrowRight size={16} />
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
            style={{ width: input.focused ? "100%" : "0%" }}
          />
        </div>
      </div>

      <div className="flex items-start justify-between text-[10px] gap-2">
        <div className="flex-1">
          {input.touched && errorMsg ? (
            <p id={errorId} role="alert" className=" text-red-600">
              {errorMsg}
            </p>
          ) : successMessage && !errorMsg && input.value ? (
            <p className="text- text-green-600">{successMessage}</p>
          ) : helperText ? (
            <p id={helperId} className="text-sm text-gray-500">
              {helperText}
            </p>
          ) : null}
        </div>

        {showValueCount && maxValue && (
          <span
            id={countId}
            className={cn(
              "shrink-0 text-xs tabular-nums",
              input.value.length > maxValue ? "text-red-600" : "text-gray-400"
            )}
          >
            {input.value.length}/{maxValue}
          </span>
        )}
      </div>
    </div>
  );
};

/** Alias ya backward-compat - kama ulikuwa unaita `EduModernInputV2` mahali kadhaa. */
export const EduInput = Input;