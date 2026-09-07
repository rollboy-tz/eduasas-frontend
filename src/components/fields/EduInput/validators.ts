import { Validator, ValidationContext } from "./types";
import { Messages } from "./messages";
import { parseContact } from "@/lib/utils/contact";

export const validators: Record<string, Validator> = {
  required(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    if (!value.trim()) {
      return { valid: false, error: messages.required };
    }

    return { valid: true, error: null };
  },

  email(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;
    const result = parseContact(value, "EMAIL");
    return result.isValid ? { valid: true, error: null } : { valid: false, error: messages.invalidEmail };
  },

  phone(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;
    const result = parseContact(value, "PHONE");
    return result.isValid ? { valid: true, error: null } : { valid: false, error: messages.invalidPhone };
  },

  contact(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;
    const result = parseContact(value);
    return result.isValid ? { valid: true, error: null } : { valid: false, error: messages.invalidContact };
  },

  number(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    if (!value.trim()) {
      return { valid: false, error: messages.invalidNumber };
    }

    return !isNaN(Number(value))
      ? { valid: true, error: null }
      : { valid: false, error: messages.invalidNumber };
  },

  /**
   * ID number - format check ya ziada (defensive). Kwa kawaida normalizer
   * tayari inafuta character isiyoruhusiwa unapoandika, lakini hii inakinga
   * pia dhidi ya value iliyowekwa programmatically (mfano `setValue()`,
   * paste ya haraka kabla ya normalizer kufanya kazi, au data kutoka API).
   */
  id(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    if (!value.trim()) {
      return { valid: false, error: messages.invalidId };
    }

    return /^[A-Za-z0-9\-_/]+$/.test(value)
      ? { valid: true, error: null }
      : { valid: false, error: messages.invalidId };
  },

  url(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    if (!value.trim()) {
      return { valid: false, error: messages.invalidURL };
    }

    try {
      // BUG ILIYOREKEBISHWA: `value.startsWith("http")` ilikuwa inakubali
      // hata "httpxyz" (si scheme halali) kama "tayari ina http". Sasa
      // tunahitaji hasa "http://" au "https://" mwanzoni.
      const hasScheme = /^https?:\/\//i.test(value);
      const url = hasScheme ? value : `https://${value}`;
      new URL(url);
      return { valid: true, error: null };
    } catch {
      return { valid: false, error: messages.invalidURL };
    }
  },

  name(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;
    const regex = /^[A-Za-zÀ-ÿ'-]+$/;
    return regex.test(value) ? { valid: true, error: null } : { valid: false, error: messages.invalidName };
  },

  fullName(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;
    const regex = /^[A-Za-zÀ-ÿ'-]+(?: [A-Za-zÀ-ÿ'-]+)+$/;
    return regex.test(value)
      ? { valid: true, error: null }
      : { valid: false, error: messages.invalidFullName };
  },

  password(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      return { valid: false, error: messages.invalidPassword };
    }

    return { valid: true, error: null };
  },

  confirm(value: string, context?: ValidationContext) {
    const messages = context?.messages ?? Messages;

    if (!context?.password) {
      return { valid: false, error: messages.enterPassFirst };
    }

    return value === context.password
      ? { valid: true, error: null }
      : { valid: false, error: messages.invalidConfirm };
  },
};

/**
 * Length validator - NDIYO KWANZA INAUNGANISHWA KWENYE ENGINE.
 * `Messages.minValue`/`maxValue`/`invalidLength`/`invalidLengthRange` na
 * `EngineOptions.minValue`/`maxValue` zilikuwepo tayari, lakini hakuna
 * validator iliyokuwa ikiziita - length haikuwahi kuthibitishwa licha ya
 * kuonekana kama feature iliyopo.
 */
export function validateLength(
  value: string,
  min: number | undefined,
  max: number | undefined,
  context?: ValidationContext
) {
  const messages = context?.messages ?? Messages;

  if (!value || (min === undefined && max === undefined)) {
    return { valid: true, error: null };
  }

  if (min !== undefined && max !== undefined && min === max && value.length !== min) {
    return { valid: false, error: messages.invalidLength(min) };
  }
  if (min !== undefined && value.length < min) {
    return { valid: false, error: messages.minValue(min) };
  }
  if (max !== undefined && value.length > max) {
    return { valid: false, error: messages.maxValue(max) };
  }

  return { valid: true, error: null };
}