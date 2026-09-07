/**
 * DATE MANAGER - EDUASAS SYSTEM (v3.5)
 * Class hii inasimamia muda, tarehe, na dynamic formatting.
 * Inatumia Intl.DateTimeFormat kwa usahihi wa maeneo (Localization & Timezone).
 */

// Uhakiki wa mazingira (Client vs Server)
const USER_TIMEZONE =
  typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "Africa/Dar_es_Salaam";

const USER_LOCALE =
  typeof window !== "undefined" ? navigator.language : "en-GB";

/**
 * Mipangilio ya custom date formatting
 */
export interface DateConfig {
  format?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  showTime?: boolean;
  hour12?: boolean;
  withDay?: boolean;
  monthType?: "short" | "long" | "2-digit";
}

/**
 * Maumbile ya tarehe yanayokubalika kwa ajili ya kuonyesha (Display Formats)
 */
export type DateDisplayFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "DD MMM YYYY"
  | "MMM DD, YYYY"
  | "MMMM YYYY"
  | "YYYY";

/**
 * Structure ya data iliyochanganuliwa kutoka kwenye Tarehe/Timestamp
 */
export interface ExtractedDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  iso: string; // Original ISO String
}

export class DateUtils {
  /**
   * 1. FORMAT RELATIVE TIME
   * Inabadilisha timestamp au tarehe kuwa maelezo ya kirafiki ya muda uliopita (mfano: "5m ago").
   *
   * @param {string | number | Date} date - Tarehe au timestamp inayochakatwa.
   * @returns {string} String ya muda wa kirafiki (e.g., "Just now", "5m ago", "2d ago").
   *
   * @example
   * DateUtils.formatRelative(new Date()); // "Just now"
   * DateUtils.formatRelative(Date.now() - 300000); // "5m ago"
   * DateUtils.formatRelative("2026-01-01"); // "01 Jan"
   */
  static formatRelative(date: string | number | Date): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Unknown time";

    const diff = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Intl.DateTimeFormat(USER_LOCALE, {
      day: "2-digit",
      month: "short",
    }).format(dateObj);
  }

  /**
   * 2. FORMAT DATE PEKEE
   * Inachukua tarehe na kuirudisha katika muundo wa maandishi au namba.
   *
   * @param {string | number | Date} date - Timestamp au tarehe.
   * @param {'text' | 'numeric'} [style='text'] - 'text' (e.g., "09 Mar 2026") au 'numeric' (e.g., "09/03/2026").
   * @returns {string} Tarehe iliyopangiliwa.
   *
   * @example
   * DateUtils.formatDate("2026-03-09"); // "09 Mar 2026"
   * DateUtils.formatDate("2026-03-09", "numeric"); // "09/03/2026"
   */
  static formatDate(
    date: string | number | Date,
    style: "text" | "numeric" = "text"
  ): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";

    return new Intl.DateTimeFormat(USER_LOCALE, {
      timeZone: USER_TIMEZONE,
      day: "2-digit",
      month: style === "text" ? "short" : "2-digit",
      year: "numeric",
    }).format(dateObj);
  }

  /**
   * 3. FORMAT TIME PEKEE
   * Inarudisha muda pekee kutoka kwenye tarehe/timestamp.
   *
   * @param {string | number | Date} date - Tarehe au timestamp.
   * @param {boolean} [showSeconds=false] - Onyesha sekunde (Default: false).
   * @param {boolean} [is12Hour=false] - Tumia mfumo wa masaa 12 (AM/PM) au 24.
   * @returns {string} Muda pekee uliopangiliwa.
   *
   * @example
   * DateUtils.formatTime("2026-03-09T14:30:00Z"); // "17:30" (kulingana na timezone)
   * DateUtils.formatTime(new Date(), true, true); // "02:30:15 PM"
   */
  static formatTime(
    date: string | number | Date,
    showSeconds = false,
    is12Hour = false
  ): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";

    return new Intl.DateTimeFormat(USER_LOCALE, {
      timeZone: USER_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: is12Hour,
    }).format(dateObj);
  }

  /**
   * 4. FORMAT DATE NA TIME KWA PAMOJA
   * Inajumuisha tarehe na muda kwenye string moja.
   *
   * @param {string | number | Date} date - Tarehe au timestamp.
   * @returns {string} Mchanganyiko wa tarehe na muda.
   *
   * @example
   * DateUtils.formatDateTime("2026-03-09T14:30:00Z"); // "09 Mar 2026, 17:30"
   */
  static formatDateTime(date: string | number | Date): string {
    return `${this.formatDate(date, "text")}, ${this.formatTime(date)}`;
  }

  /**
   * 5. CUSTOM DATE FORMATTER
   * Inaruhusu kupanga tarehe kwa kutumia mipangilio (config) tofauti tofauti.
   *
   * @param {string | number | Date} date - Tarehe inayochakatwa.
   * @param {DateConfig} [config={}] - Mipangilio ya muonekano.
   * @returns {string} Tarehe kulingana na config.
   *
   * @example
   * DateUtils.formatCustom("2026-03-09", { format: "YYYY-MM-DD", withDay: true }); // "Mon, 2026-03-09"
   * DateUtils.formatCustom(new Date(), { showTime: true, hour12: true }); // "09 Mar 2026, 02:30 PM"
   */
  static formatCustom(
    date: string | number | Date,
    config: DateConfig = {}
  ): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: config.monthType || "short",
      year: "numeric",
      weekday: config.withDay ? "short" : undefined,
      timeZone: USER_TIMEZONE,
    };

    if (config.showTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = config.hour12 || false;
    }

    const localeMap = {
      "DD/MM/YYYY": "en-GB",
      "MM/DD/YYYY": "en-US",
      "YYYY-MM-DD": "en-CA",
    };
    return new Intl.DateTimeFormat(
      localeMap[config.format || "DD/MM/YYYY"],
      options
    ).format(dateObj);
  }

  /**
   * 6. GET TIME GREETING
   * Inarudisha salamu kulingana na muda wa sasa wa siku.
   *
   * @returns {string} Salamu ("Good morning", "Good afternoon", au "Good evening").
   *
   * @example
   * DateUtils.getGreeting(); // "Good morning" (kama ni saa 4 asubuhi)
   */
  static getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  /**
   * 7. IS DATE EXPIRED
   * Inakagua kama tarehe iliyotolewa imeshapita ukilinganisha na leo (mwanzo wa siku ya leo).
   *
   * @param {string | number | Date} date - Tarehe ya kulinganishwa.
   * @returns {boolean} true kama tarehe imepita, false kama bado.
   *
   * @example
   * DateUtils.isExpired("2020-01-01"); // true
   * DateUtils.isExpired("2030-01-01"); // false
   */
  static isExpired(date: string | number | Date): string | boolean {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  }

  /**
   * 8. FORMAT DATE INPUT DISPLAY
   * Inalainisha string ya tarehe (k.m. kutoka kwenye Database ISO) kwenda kwenye muundo unaoonekana kwenye UI.
   * Inazuia suala la kupishana kwa siku kunakosababishwa na Timezones unaposoma tarehe ya mfumo wa YYYY-MM-DD.
   *
   * @param {string} iso - ISO date string (e.g., "2026-07-31").
   * @param {DateDisplayFormat} [format="DD MMM YYYY"] - Format inayotakiwa kurudishwa.
   * @returns {string} Tarehe iliyopangiliwa kwa ajili ya kuonyesha.
   *
   * @example
   * DateUtils.formatInputDate("2026-07-31"); // "31 Jul 2026"
   * DateUtils.formatInputDate("2026-07-31", "MM/DD/YYYY"); // "07/31/2026"
   */
  static formatInputDate(
    iso: string,
    format: DateDisplayFormat = "DD MMM YYYY"
  ): string {
    if (!iso) return "";

    let dateObj: Date;

    // Kuzuia Timezone Shifting wakati wa kusoma YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [year, month, day] = iso.split("-").map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(iso);
    }

    if (isNaN(dateObj.getTime())) return "Invalid date";

    switch (format) {
      case "YYYY":
        return String(dateObj.getFullYear());

      case "MMMM YYYY":
        return new Intl.DateTimeFormat(USER_LOCALE, {
          month: "long",
          year: "numeric",
          timeZone: USER_TIMEZONE,
        }).format(dateObj);

      case "MM/DD/YYYY":
        return new Intl.DateTimeFormat("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(dateObj);

      case "YYYY-MM-DD":
        return this.toISODate(dateObj);

      case "MMM DD, YYYY":
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }).format(dateObj);

      case "DD/MM/YYYY":
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(dateObj);

      case "DD MMM YYYY":
      default:
        return new Intl.DateTimeFormat(USER_LOCALE, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: USER_TIMEZONE,
        }).format(dateObj);
    }
  }

  /**
   * 9. DATE OBJECT TO ISO DATE STRING
   * Inabadilisha Date Object kuwa string ya ISO Date tu (YYYY-MM-DD).
   *
   * @param {Date} date - Instance ya Date.
   * @returns {string} String katika muundo wa YYYY-MM-DD.
   *
   * @example
   * DateUtils.toISODate(new Date()); // "2026-08-01"
   */
  static toISODate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  /**
   * 10. DATE OBJECT TO ISO MONTH STRING
   * Inabadilisha Date Object kuwa string ya Mwaka na Mwezi (YYYY-MM).
   *
   * @param {Date} date - Instance ya Date.
   * @returns {string} String katika muundo wa YYYY-MM.
   *
   * @example
   * DateUtils.toISOMonth(new Date()); // "2026-08"
   */
  static toISOMonth(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
    ].join("-");
  }

  /**
   * 11. DATE OBJECT TO ISO YEAR STRING
   * Inapata mwaka pekee kama string kutoka kwenye Date Object.
   *
   * @param {Date} date - Instance ya Date.
   * @returns {string} Mwaka pekee (e.g., "2026").
   *
   * @example
   * DateUtils.toISOYear(new Date()); // "2026"
   */
  static toISOYear(date: Date): string {
    return String(date.getFullYear());
  }

  /**
   * 12. EXTRACT DATE PARTS
   * Inavunja-vunja tarehe/timestamp kuwa component ndogo ndogo (Mwaka, Mwezi, Siku, Masaa, Dk, Sek) kwa UTC.
   *
   * @param {string | Date} value - Tarehe au ISO string.
   * @returns {ExtractedDate | null} Object ya vipengele vya tarehe au null kama tarehe si sahihi.
   *
   * @example
   * DateUtils.extract("2026-08-01T14:30:20Z");
   * // Kurudisha:
   * // {
   * //   year: 2026, month: 8, day: 1,
   * //   hour: 14, minute: 30, second: 20,
   * //   date: "2026-08-01", time: "14:30:20",
   * //   iso: "2026-08-01T14:30:20.000Z"
   * // }
   */
  static extract(value: string | Date): ExtractedDate | null {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      date: [
        year,
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-"),
      time: [
        String(hour).padStart(2, "0"),
        String(minute).padStart(2, "0"),
        String(second).padStart(2, "0"),
      ].join(":"),
      iso: date.toISOString(),
    };
  }

  /**
   * BUILD ISO DATE TIME
   * Inachukua string ya tarehe (YYYY-MM-DD) na string ya muda (HH:mm:ss) kisha inaziunganisha na kurudisha ISO String iliyokamilika ya UTC.
   *
   * @param {string} date - Tarehe katika muundo wa "YYYY-MM-DD" (e.g., "2026-08-03").
   * @param {string} [time="00:00:00"] - Muda katika muundo wa "HH:mm:ss" au "HH:mm". Mipangilio ya msingi ni "00:00:00".
   * @returns {string} Fully qualified ISO date string (e.g., "2026-08-03T14:30:00.000Z") au string tupu kama tarehe haikutolewa.
   *
   * @example
   * // Bila kuweka muda (inatumia default "00:00:00"):
   * DateUtils.buildISODateTime("2026-08-03");
   * // Output: "2026-08-03T00:00:00.000Z"
   *
   * @example
   * // Ukiweka tarehe na muda:
   * DateUtils.buildISODateTime("2026-08-03", "14:30:00");
   * // Output: "2026-08-03T14:30:00.000Z"
   */
  static buildISODateTime(
    date: string,
    time: string = "00:00:00"
  ): string {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return new Date(
      `${year}-${month}-${day}T${time}Z`
    ).toISOString();
  }
}