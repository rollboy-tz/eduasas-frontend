/**
 * time-utils.ts
 * Injini huru ya kushughulikia muda: parsing, formatting, validation.
 * Haina hardcoded lugha - messages zote zinapitishwa kutoka nje.
 */

export interface TimeValue {
  hours: number; // 0-23 (24h internal representation kila wakati)
  minutes: number; // 0-59
  seconds: number; // 0-59
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Inabadilisha input yoyote (Date | string | null) kuwa TimeValue halali.
 * Inasupport: "HH:mm", "HH:mm:ss" (24h), "hh:mm A"/"hh:mm:ss A" (12h), na
 * full ISO datetime (inachukua muda wa MTAA, si UTC - angalia date-utils
 * kwa maelezo kamili ya kwanini hii ni muhimu).
 */
export function toTimeValue(value?: string | Date | null): TimeValue | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return { hours: value.getHours(), minutes: value.getMinutes(), seconds: value.getSeconds() };
  }

  const raw = value.trim();
  if (!raw) return null;

  const match24 = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const h = Number(match24[1]);
    const m = Number(match24[2]);
    const s = match24[3] ? Number(match24[3]) : 0;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) {
      return { hours: h, minutes: m, seconds: s };
    }
  }

  const match12 = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  if (match12) {
    let h = Number(match12[1]) % 12;
    const m = Number(match12[2]);
    const s = match12[3] ? Number(match12[3]) : 0;
    const isPM = /p/i.test(match12[4]);
    if (isPM) h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) {
      return { hours: h, minutes: m, seconds: s };
    }
  }

  // Fallback - ISO datetime kamili au format nyingine yoyote inayoeleweka
  // na JS Date - tunachukua muda wa MTAA (si UTC) kutoka kwenye Date hiyo.
  const fallback = new Date(raw);
  if (!isNaN(fallback.getTime())) {
    return { hours: fallback.getHours(), minutes: fallback.getMinutes(), seconds: fallback.getSeconds() };
  }

  return null;
}

export function combine12h(hour12: number, period: "AM" | "PM"): number {
  const base = hour12 % 12; // 12 -> 0
  return period === "PM" ? base + 12 : base;
}

/** Format kwa tokens: HH, H, hh, h, mm, m, ss, s, A, a. */
export function formatTime(time: TimeValue | null, pattern: string): string {
  if (!time) return "";
  const h24 = time.hours;
  const h12raw = h24 % 12;
  const h12 = h12raw === 0 ? 12 : h12raw;

  const map: Record<string, string> = {
    HH: pad(h24),
    H: String(h24),
    hh: pad(h12),
    h: String(h12),
    mm: pad(time.minutes),
    m: String(time.minutes),
    ss: pad(time.seconds),
    s: String(time.seconds),
    A: h24 < 12 ? "AM" : "PM",
    a: h24 < 12 ? "am" : "pm",
  };

  return pattern.replace(/HH|H|hh|h|mm|m|ss|s|A|a/g, (token) => map[token] ?? token);
}

export type TimeOutputFormat = "24h" | "12h" | string | ((time: TimeValue) => string);

export function resolveOutputValue(
  time: TimeValue | null,
  withSeconds: boolean,
  output: TimeOutputFormat | undefined
): string {
  if (!time) return "";
  if (typeof output === "function") return output(time);

  if (!output || output === "24h") {
    return withSeconds ? `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}` : `${pad(time.hours)}:${pad(time.minutes)}`;
  }
  if (output === "12h") {
    return formatTime(time, withSeconds ? "hh:mm:ss A" : "hh:mm A");
  }
  return formatTime(time, output);
}

/** Sekunde tangu 00:00:00 - kwa comparison rahisi ya min/max. */
export function toComparableSeconds(time: TimeValue | null): number {
  if (!time) return -1;
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

export function isSameTime(a: TimeValue | null, b: TimeValue | null): boolean {
  if (!a || !b) return false;
  return a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds;
}

// ---------------------------------------------------------------------------
// Messages / validation
// ---------------------------------------------------------------------------

export interface TimeInputMessages {
  required: string;
  tooEarly: string;
  tooLate: string;
  now: string;
  done: string;
  clear: string;
}

export const defaultTimeInputMessages: TimeInputMessages = {
  required: "This field is required",
  tooEarly: "Time is before the allowed range",
  tooLate: "Time is after the allowed range",
  now: "Now",
  done: "Done",
  clear: "Clear",
};

export interface ValidateTimeOptions {
  required?: boolean;
  min?: TimeValue | null;
  max?: TimeValue | null;
  validate?: (time: TimeValue | null) => string | undefined | void;
  messages: TimeInputMessages;
}

export function validateTime(time: TimeValue | null, opts: ValidateTimeOptions): string | undefined {
  const { required, min, max, validate, messages } = opts;

  if (!time) {
    if (required) return messages.required;
    return validate ? validate(null) || undefined : undefined;
  }

  const cmp = toComparableSeconds(time);
  if (min && cmp < toComparableSeconds(min)) return messages.tooEarly;
  if (max && cmp > toComparableSeconds(max)) return messages.tooLate;

  if (validate) {
    const customError = validate(time);
    if (customError) return customError;
  }

  return undefined;
}