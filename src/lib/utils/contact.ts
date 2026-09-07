import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { z } from 'zod';

// Define types za modes
export type ValidationMode = 'AUTO' | 'EMAIL' | 'PHONE';

export const parseContact = (
  input: string, 
  mode: ValidationMode = 'AUTO', 
  defaultCountry: CountryCode = 'TZ'
) => {
  const cleanInput = input.trim();
  const emailSchema = z.string().email();

  // 1. Logica ya Email
  const isEmail = emailSchema.safeParse(cleanInput).success;
  
  // 2. Logica ya Phone
  const phoneNumber = parsePhoneNumberFromString(cleanInput, { defaultCountry });
  const isPhone = phoneNumber?.isValid() ?? false;

  // --- KAMA MODE NI EMAIL ---
  if (mode === 'EMAIL') {
    return {
      type: 'EMAIL',
      value: isEmail ? cleanInput.toLowerCase() : cleanInput,
      isValid: isEmail,
    };
  }

  // --- KAMA MODE NI PHONE ---
  if (mode === 'PHONE') {
    return {
      type: 'PHONE',
      value: isPhone ? phoneNumber!.format('E.164') : cleanInput,
      isValid: isPhone,
    };
  }

  // --- KAMA MODE NI AUTO (DEFAULT) ---
  if (isEmail) {
    return { type: 'EMAIL', value: cleanInput.toLowerCase(), isValid: true };
  }
  if (isPhone) {
    return { type: 'PHONE', value: phoneNumber!.format('E.164'), isValid: true };
  }

  return { type: 'UNKNOWN', value: cleanInput, isValid: false };
};