import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Inasaidia kuchanganya Tailwind classes kwa usahihi.
 * Muhimu kwa ajili ya dynamic styling (kama switch ya Dark/Light mode).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format namba ya simu kuwa standard ya TZ (+255)
 */
export function formatTZPhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `+255${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith("255")) {
    return `+${cleaned}`;
  }
  return `+255${cleaned}`;
}


const USER_KEY = "eduasas_current_user_key";

export const getUserKey = (): string | null => {

  if (typeof window === 'undefined') {
    return null;
  }

  // 1. Jaribu kupata iliyopo
  let userKey = localStorage.getItem(USER_KEY);
  
  // 2. Kama haipo (au user mpya), itengeneze papo hapo
  if (!userKey) {
    userKey = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_KEY, userKey);
  }
  
  return userKey;
};

export const resetuserKey = () => {
  localStorage.removeItem(USER_KEY);
  // Ikifutwa, ikihitajika tena itajizalisha yenyewe
};