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
  password?: string;
  placeholder?: string;
  helperText?: string;
  transform?: "uppercase" | "lowercase" | "capitalize" | "none";
  restrict?: "numbers" | "letters" | "alphanumeric" | "none";
  error?: string;
  successMessage?: string;
  value?: string;
  type?: InputType;
  required?: boolean;
  maxValue?: number;
  minValue?: number;
  showValueCount?: boolean;
  showActionBtn?: boolean;
  showStateIcon?: boolean;
  clearable?: boolean;
  actionClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  messages?: Partial<EngineMessages>;
  onChange?: (value: string) => void;
  onError?: (error: string | null) => void;
}

const sizeStyles: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-9 px-2 text-sm",
  md: "h-10 px-3 text-base sm:text-sm",
  lg: "h-11 px-3.5 text-base sm:text-sm",
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
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="text-destructive ms-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {name && <input type="hidden" name={name} value={input.value} />}

      {/* Flat container with dynamic underline indicator */}
      <div
        className={cn(
          "w-full rounded-lg overflow-hidden transition-colors bg-muted/20 hover:bg-muted/40",
          disabled && "opacity-60 hover:bg-muted/20",
          className
        )}
      >
        <div className={cn("flex items-center gap-2 w-full", sizeStyles[size])}>
          {Icon && <Icon size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />}

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
              "text-foreground placeholder:text-muted-foreground",
              disabled && "cursor-not-allowed text-muted-foreground"
            )}
          />

          {clearable && input.value && !disabled && !isPassword && (
            <button
              type="button"
              onClick={clearValue}
              aria-label="Clear input"
              className="shrink-0 grid place-items-center p-0 m-0 h-5 w-5 border-0 bg-transparent leading-none text-muted-foreground hover:text-foreground transition-colors appearance-none cursor-pointer"
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
              className="shrink-0 grid place-items-center p-0 m-0 h-5 w-5 border-0 bg-transparent leading-none text-muted-foreground hover:text-foreground transition-colors appearance-none cursor-pointer"
            >
              {passHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          )}

          {!isPassword && showStateIcon && status !== "idle" && (
            <span className="shrink-0" aria-hidden="true">
              {status === "error" ? (
                <AlertCircle size={16} className="text-destructive" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
            </span>
          )}

          {showActionBtn && (
            <button
              type="button"
              onClick={actionClick}
              disabled={disabled}
              aria-label="Submit"
              className="shrink-0 grid place-items-center p-0 m-0 h-5 w-5 border-0 bg-transparent leading-none text-primary hover:text-primary/80 transition-colors appearance-none cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="relative h-[2px] overflow-hidden">
          <div className={cn("absolute inset-0", hasError ? "bg-destructive/30" : "bg-border")} />
          <div
            className={cn(
              "absolute left-1/2 top-0 h-full -translate-x-1/2 transition-[width] duration-200 ease-out",
              hasError ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: input.focused ? "100%" : "0%" }}
          />
        </div>
      </div>

      <div className="flex items-start justify-between text-[11px] gap-2">
        <div className="flex-1">
          {input.touched && errorMsg ? (
            <p id={errorId} role="alert" className="text-destructive">
              {errorMsg}
            </p>
          ) : successMessage && !errorMsg && input.value ? (
            <p className="text-emerald-500">{successMessage}</p>
          ) : helperText ? (
            <p id={helperId} className="text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </div>

        {showValueCount && maxValue && (
          <span
            id={countId}
            className={cn(
              "shrink-0 tabular-nums",
              input.value.length > maxValue ? "text-destructive font-semibold" : "text-muted-foreground"
            )}
          >
            {input.value.length}/{maxValue}
          </span>
        )}
      </div>
    </div>
  );
};

export const EduInput = Input;
export default Input;
