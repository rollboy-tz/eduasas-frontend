import { capitalize } from "@/lib/utils";
import { normalizeEmail, normalizePhone, isPhoneLike } from "./contacts-normalizers";

export const normalizers = {
  email(value: string) {
    return normalizeEmail(value);
  },

  phone(value: string) {
    return normalizePhone(value);
  },

  contact(value: string) {
    if (!value) return "";
    return isPhoneLike(value) ? normalizePhone(value) : normalizeEmail(value);
  },

  name(value: string) {
    const sanitized = capitalize(value.trim());
    return sanitized.replace(/[^a-zA-Z\u00C0-\u00FF' -]/g, "");
  },

  fullname(value: string) {
    return (
      value
        // Ruhusu herufi (pamoja na accents), nafasi, na apostrophe/hyphen pekee
        .replace(/[^a-zA-Z\u00C0-\u00FF' -]/g, "")
        // Ondoa nafasi zilizojirudia
        .replace(/\s+/g, " ")
        // Title Case
        .split(" ")
        .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
        .join(" ")
    );
  },

  text(value: string) {
    // Ondoa characters hatari za XSS/injection: < > * ^ | \ { } [ ]
    let sanitized = value.replace(/[<>*^|\\{}[\]]/g, "");
    // Ondoa tab na space zilizojirudia (Enter \n inabaki - si "space" hii)
    sanitized = sanitized.replace(/[ \t]+/g, " ");
    return sanitized;
  },

  password(value: string) {
    if (!value) return "";
    return value.trim();
  },

  confirm(value: string) {
    if (!value) return "";
    return value.trim();
  },

  number(value: string) {
    if (!value) return "";

    let normalized = value.replace(/[^0-9.-]/g, "");

    if (normalized.includes("-")) {
      normalized = "-" + normalized.replace(/-/g, "").slice(0);
    }

    const parts = normalized.split(".");
    if (parts.length > 2) {
      normalized = parts[0] + "." + parts.slice(1).join("");
    }

    return normalized;
  },

  url(value: string) {
    if (!value) return "";
    return value
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9:/?#[\]@!$&'()*+,;=._~-]/g, "");
  },

  /**
   * ID number - namba za usajili, NIDA, vitambulisho n.k. Inaruhusu herufi,
   * namba, na "-", "_", "/" (alama za kawaida kwenye ID formats mbalimbali).
   * Space haziruhusiwi kwa makusudi - IDs kawaida hazina nafasi.
   */
  id(value: string) {
    if (!value) return "";
    return value.replace(/[^A-Za-z0-9\-_/]/g, "");
  },
};