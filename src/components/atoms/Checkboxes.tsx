"use client";

import React, { useId } from "react";
import { Check } from "lucide-react";

/**
 * Basic Checkbox Props for simple boolean state management.
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  /** The current checked state of the checkbox. */
  checked: boolean;
  /** Callback triggered when the checked state changes, passing the new boolean value directly. */
  onCheckedChange: (checked: boolean) => void;
  /** Optional label text displayed next to the checkbox. */
  label?: string;
  /** Optional secondary description text displayed below the label. */
  description?: string;
  /** Applies error styling to the checkbox border and background. */
  error?: boolean;
}

/**
 * Advanced Checkbox Props designed for extracting and managing primitive keys/IDs 
 * directly from raw backend datasets without requiring pre-existing boolean flags.
 */
export interface SmartCheckboxProps<TValue extends string | number = string> {
  /** The unique key or ID value associated with this specific item from the backend. */
  value: TValue;
  /** An array containing all currently selected keys/IDs. */
  selectedValues: TValue[];
  /** Callback triggered on toggle, returning an updated array containing or omitting the value. */
  onSelectionChange: (updatedValues: TValue[]) => void;
  /** Optional label text displayed next to the checkbox. */
  label?: string;
  /** Optional secondary description text displayed below the label. */
  description?: string;
  /** Applies error styling to the checkbox border and background. */
  error?: boolean;
  /** Disables the checkbox interaction. */
  disabled?: boolean;
  /** Additional CSS class names for custom layout styling. */
  className?: string;
}

/**
 * A standard, high-performance Checkbox component utilizing boolean states directly.
 * 
 * @example
 * // Example 1: Simple Toggle Switch
 * const [isActive, setIsActive] = useState(false);
 * <Checkbox 
 *   label="Enable Notifications" 
 *   checked={isActive} 
 *   onCheckedChange={setIsActive} 
 * />
 * 
 * @example
 * // Example 2: Form Agreement Checkbox with Description
 * const [agreed, setAgreed] = useState(false);
 * <Checkbox 
 *   label="Terms and Conditions" 
 *   description="Accepting this allows system administration updates."
 *   checked={agreed} 
 *   onCheckedChange={setAgreed} 
 * />
 * 
 * @example
 * // Example 3: Error Validation State
 * const [isValidated, setIsValidated] = useState(false);
 * <Checkbox 
 *   label="Confirm Action" 
 *   error={true}
 *   checked={isValidated} 
 *   onCheckedChange={setIsValidated} 
 * />
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error = false, className = "", disabled = false, checked, onCheckedChange, ...props }, ref) => {
    const id = useId();

    return (
      <label 
        htmlFor={id}
        className={`group relative flex items-start gap-3 select-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          disabled={disabled}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
          {...props}
        />

        <div 
          className={`mt-0.5 h-5 w-5 shrink-0 rounded border transition-all duration-200 flex items-center justify-center shadow-xs ${
            error 
              ? "border-red-500 bg-red-50 peer-checked:bg-red-600 peer-checked:border-red-600" 
              : "border-slate-300 bg-white group-hover:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
          } peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600/20 peer-focus-visible:ring-offset-2`}
        >
          <Check 
            size={13} 
            strokeWidth={3}
            className={`text-white transition-transform duration-200 ${
              checked ? "scale-100" : "scale-0"
            }`} 
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col text-sm lg:text-base">
            {label && (
              <span className="text-slate-800 group-hover:text-slate-950 transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-slate-500 mt-0.5 font-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

/**
 * An advanced data-driven Checkbox component built for backend integration. 
 * It automatically calculates its check status by checking if its specific `value` (key/ID) 
 * exists within a parent collection array, and spits out an updated array of IDs on click.
 * 
 * @template TValue - The primitive type of the identifier (string or number).
 * 
 * @example
 * // Example 1: Extracting User IDs from Backend Data List
 * const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
 * const backendUsers = [{ id: "usr_1", name: "Juma" }, { id: "usr_2", name: "Aisha" }];
 * 
 * {backendUsers.map(user => (
 *   <SmartCheckbox 
 *     key={user.id}
 *     value={user.id}
 *     label={user.name}
 *     selectedValues={selectedUserIds}
 *     onSelectionChange={setSelectedUserIds}
 *   />
 * ))}
 * 
 * @example
 * // Example 2: Managing Permission Codes Selection Array
 * const [permissions, setPermissions] = useState<number[]>([]);
 * 
 * <SmartCheckbox 
 *   value={101}
 *   label="Delete Privilege"
 *   description="Grants authorization to delete records."
 *   selectedValues={permissions}
 *   onSelectionChange={setPermissions}
 * />
 * 
 * @example
 * // Example 3: Bulk School ID Selection with Error Border Integration
 * const [trashSchoolIds, setTrashSchoolIds] = useState<string[]>([]);
 * 
 * <SmartCheckbox 
 *   value="sch_tz_99"
 *   label="EduAsas High School"
 *   error={true}
 *   selectedValues={trashSchoolIds}
 *   onSelectionChange={setTrashSchoolIds}
 * />
 */
export function SmartCheckbox<TValue extends string | number = string>({
  value,
  selectedValues,
  onSelectionChange,
  label,
  description,
  error = false,
  disabled = false,
  className = "",
}: SmartCheckboxProps<TValue>) {
  const id = useId();
  const isChecked = selectedValues.includes(value);

  const handleToggle = () => {
    if (disabled) return;

    if (isChecked) {
      // Remove value from array if it was already selected
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      // Append value to array if it wasn't selected
      onSelectionChange([...selectedValues, value]);
    }
  };

  return (
    <label 
      htmlFor={id}
      className={`group relative flex items-start gap-3 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        checked={isChecked}
        onChange={handleToggle}
        className="peer sr-only"
      />

      <div 
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-lg border transition-all duration-200 flex items-center justify-center shadow-xs ${
          error 
            ? "border-red-500 bg-red-50 peer-checked:bg-red-600 peer-checked:border-red-600" 
            : "border-slate-300 bg-white group-hover:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
        } peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600/20 peer-focus-visible:ring-offset-2`}
      >
        <Check 
          size={13} 
          strokeWidth={3}
          className={`text-white transition-transform duration-200 ${
            isChecked ? "scale-100" : "scale-0"
          }`} 
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-xs leading-tight">
          {label && (
            <span className="font-semibold text-slate-800 group-hover:text-slate-950 transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-slate-500 mt-0.5 font-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}