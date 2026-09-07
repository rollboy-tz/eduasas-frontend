/**
 * select-utils.ts
 * Messages na validation logic kwa Select - haina hardcoded lugha,
 * yote yanapitishwa kutoka nje (i18n-ready), sawa na date-input.
 */

export interface SelectMessages {
  required: string;
  noResults: string;
  searchPlaceholder: string;
  clear: string;
}

export const defaultSelectMessages: SelectMessages = {
  required: "This field is required",
  noResults: "No results found",
  searchPlaceholder: "Search...",
  clear: "Clear",
};

export interface ValidateSelectOptions {
  required?: boolean;
  validate?: (hasSelection: boolean) => string | undefined | void;
  messages: SelectMessages;
}

/** Real validation logic - haitegemei UI, inaweza kutumika hata form-level. */
export function validateSelect(hasSelection: boolean, opts: ValidateSelectOptions): string | undefined {
  const { required, validate, messages } = opts;

  if (required && !hasSelection) return messages.required;

  if (validate) {
    const customError = validate(hasSelection);
    if (customError) return customError;
  }

  return undefined;
}