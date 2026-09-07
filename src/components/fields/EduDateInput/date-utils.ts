/**
 * date-utils.ts
 * Injini huru (framework-agnostic) ya kushughulikia dates: parsing, formatting,
 * validation, na calendar-grid math. Haina hardcoded lugha - matini yote
 * (messages) inapitishwa kutoka nje ili iwe rahisi ku-customize / i18n.
 */

export type DateMode = "date" | "month" | "year";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS_FULL.map((m) => m.slice(0, 3));
const WEEK_DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function pad(value: number, length = 2): string {
  return String(Math.abs(value)).padStart(length, "0");
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  // month: 0-11
  return new Date(year, month + 1, 0).getDate();
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (![year, month, day].every(Number.isInteger)) return false;
  if (month < 0 || month > 11) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

/**
 * Inabadilisha input yoyote (Date | ISO-ish string | null/undefined) kuwa
 * Date halali, au null kama haiwezekani kuparse.
 * Inasupport: "YYYY", "YYYY-MM", "YYYY-MM-DD".
 */
export function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  const raw = value.trim();
  if (!raw) return null;

  // BUG ILIYOREKEBISHWA: kama string ina "T" (full ISO datetime, kwa
  // mfano kutoka .toISOString() - "2026-08-01T21:00:00.000Z"), TULIKUWA
  // tukichukua tarehe iliyoandikwa kwenye string moja kwa moja (UTC date).
  // Tatizo: .toISOString() inabadilisha Date kuwa UTC - kwa Tanzania
  // (UTC+3), saa 00:00 ya tarehe 2 (saa za mtaa) inakuwa 21:00 tarehe 1
  // UTC - "tarehe ya nyuma" ilivyoripotiwa. Sasa tunatumia `new Date(raw)`
  // (inayotambua "Z"/timezone kwa usahihi) kisha tunachukua tarehe ya
  // MTAA (local calendar date) kutoka kwenye Date hiyo - hii inarudisha
  // tarehe sahihi bila kujali ni saa ngapi UTC offset ilihamisha siku.
  if (raw.includes("T")) {
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  const parts = raw.split("-").map(Number);

  if (parts.length >= 1 && parts.length <= 3 && parts.every((p) => Number.isFinite(p))) {
    if (parts.length === 1) return new Date(parts[0], 0, 1);
    if (parts.length === 2) {
      const [y, m] = parts;
      if (m < 1 || m > 12) return null;
      return new Date(y, m - 1, 1);
    }
    const [y, m, d] = parts;
    if (isValidCalendarDate(y, m - 1, d)) return new Date(y, m - 1, d);
  }

  // Fallback - jaribu native Date parsing kwa format nyingine yoyote unayopitisha
  const fallback = new Date(raw);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** String inayolinganishika kila mara kama YYYY-MM-DD, bila kujali mode. */
export function toComparable(date: Date | null): string {
  if (!date) return "";
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Format date kwa "pattern" ya tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D.
 * Mfano: formatDate(d, "DD MMM YYYY") -> "22 Aug 2026"
 */
export function formatDate(date: Date | null, pattern: string): string {
  if (!date) return "";
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: MONTHS_FULL[date.getMonth()],
    MMM: MONTHS_SHORT[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: pad(date.getDate()),
    D: String(date.getDate()),
  };
  return pattern.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D/g, (token) => map[token] ?? token);
}

/**
 * Inatengeneza ISO datetime string SALAMA kwa tarehe-tu (date-only) value -
 * yaani "UTC midnight ya TAREHE HIYO HIYO uliyochagua", si "local midnight
 * iliyobadilishwa kuwa UTC" (ambayo ndiyo chanzo cha bug ya 'siku ya
 * nyuma' - `date.toISOString()` ya kawaida kwenye Date ya local-midnight
 * inahamisha tarehe nyuma kwa timezone yoyote iliyo mbele ya UTC, kama
 * Tanzania UTC+3).
 *
 * Tumia hii (kupitia `outputFormat="iso-datetime"`) badala ya kuandika
 * `date.toISOString()` mwenyewe - hasa kama backend/API yako inahitaji
 * full timestamp string (si "YYYY-MM-DD" tu).
 */
export function toSafeISOString(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

/**
 * Output format inayoweza kupangwa na mtumiaji wa component:
 * - "iso"          -> YYYY-MM-DD / YYYY-MM / YYYY (kutegemea mode) - DEFAULT, salama kabisa
 * - "iso-datetime" -> full ISO datetime string, salama dhidi ya timezone shift (angalia toSafeISOString)
 * - pattern string -> mfano "DD/MM/YYYY"
 * - function       -> full control, unapata Date halisi
 */
export type DateOutputFormat = "iso" | "iso-datetime" | string | ((date: Date) => string);

export function resolveOutputValue(
  date: Date | null,
  mode: DateMode,
  output: DateOutputFormat | undefined
): string {
  if (!date) return "";
  if (typeof output === "function") return output(date);

  if (!output || output === "iso") {
    if (mode === "year") return String(date.getFullYear());
    if (mode === "month") return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    return toComparable(date);
  }

  if (output === "iso-datetime") {
    return toSafeISOString(date);
  }

  return formatDate(date, output);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface DateInputMessages {
  required: string;
  invalid: string;
  tooEarly: string;
  tooLate: string;
  today: string;
  clear: string;
}

export const defaultDateInputMessages: DateInputMessages = {
  required: "This field is required",
  invalid: "Invalid date",
  tooEarly: "Date is before the allowed range",
  tooLate: "Date is after the allowed range",
  today: "Today",
  clear: "Clear",
};

export interface ValidateDateOptions {
  required?: boolean;
  min?: string | Date;
  max?: string | Date;
  /** Validator wako mwenyewe - rudisha string ya error, au undefined kama sawa. */
  validate?: (date: Date | null) => string | undefined | void;
  messages: DateInputMessages;
}

/**
 * Real validation logic - haitegemei UI. Inaweza kutumika hata nje ya
 * component (mfano kwenye form-level submit validation).
 */
export function validateDate(date: Date | null, opts: ValidateDateOptions): string | undefined {
  const { required, min, max, validate, messages } = opts;

  if (!date) {
    if (required) return messages.required;
    return validate ? validate(null) || undefined : undefined;
  }

  const cmp = toComparable(date);
  const minDate = min ? toDate(min) : null;
  const maxDate = max ? toDate(max) : null;

  if (minDate && cmp < toComparable(minDate)) return messages.tooEarly;
  if (maxDate && cmp > toComparable(maxDate)) return messages.tooLate;

  if (validate) {
    const customError = validate(date);
    if (customError) return customError;
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Calendar grid math
// ---------------------------------------------------------------------------

export { MONTHS_FULL, MONTHS_SHORT, WEEK_DAYS_SHORT };

export function getCalendarGrid(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const total = daysInMonth(year, month);

  let start = new Date(year, month, 1).getDay(); // 0 = Sunday
  start = start === 0 ? 6 : start - 1; // wiki inaanza Jumatatu (Monday-first)

  return { year, month, total, start };
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return toComparable(a) === toComparable(b);
}