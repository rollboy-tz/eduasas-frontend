/**
 * messages.ts
 * Matini fupi, ya kisasa, na wazi - kwa kila aina ya validation error.
 * Zilizokuwa ndefu/za kiofisi zimefupishwa bila kupoteza uwazi.
 */

export const Messages = {
  required: "This field is required",

  invalidEmail: "Enter a valid email address",
  invalidPhone: "Enter a valid phone number",
  invalidContact: "Enter a valid email or phone number",

  invalidName: "Letters only",
  invalidFullName: "Enter your first and last name",

  invalidURL: "Enter a valid URL",

  invalidPassword: "Use 8+ characters with uppercase, lowercase & a number",
  invalidConfirm: "Passwords don't match",
  enterPassFirst: "Enter a password first",

  invalidNumber: "Enter a valid number",

  invalidId: "Only letters, numbers, - _ / are allowed",

  invalidValue: "This value isn't valid",

  maxValue: (max: number) => `Max ${max} characters`,
  minValue: (min: number) => `Min ${min} characters`,
  invalidLength: (length: number) => `Must be exactly ${length} characters`,
  invalidLengthRange: (min: number, max: number) => `Must be ${min}–${max} characters`,
} as const;

export type EngineMessages = typeof Messages;

/** Override sehemu unayotaka tu - kwa i18n au brand voice yako mwenyewe. */
export function createMessages(overrides?: Partial<EngineMessages>): EngineMessages {
  return { ...Messages, ...overrides };
}