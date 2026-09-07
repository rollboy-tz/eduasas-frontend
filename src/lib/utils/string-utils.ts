export const capitalize = (str: string): string => {
  if (!str) return "";
  // Ondoa .trim() hapa ili kuzuia kuserereka kwa cursor wakati wa typing
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const cleanSingleName = (str: string): string => {
  if (!str) return "";
  // 1. Ruhusu herufi na (') TU. Ondoa space zote papo hapo.
  const cleaned = str.replace(/[^A-Za-z']/g, ""); 
  
  if (cleaned.length > 0) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }
  return cleaned;
};

export const cleanFullName = (str: string): string => {
  if (!str) return "";
  
  // Ruhusu herufi, (') na space. Zuia double spaces.
  let val = str.replace(/[^A-Za-z'\s]/g, "");
  val = val.replace(/\s\s+/g, " ");
  
  return val.split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

/**
 * cleanEmail: Inazuia space, herufi kubwa, na alama zisizotakiwa kwenye email.
 */
export const cleanEmail = (str: string): string => {
  if (!str) return "";
  // 1. Toa space zote na fanya lowercase papo hapo
  const val = str.toLowerCase().replace(/\s/g, "");
  // 2. Ruhusu herufi, namba, na alama za email tu (@ . _ -)
  return val.replace(/[^a-z0-9@._-]/g, "");
};


export const getEmailSuggestion = (email: string): string | null => {
  const FAMOUS_PROVIDERS = ["gmail.com", "icloud.com", "yahoo.com", "outlook.com", "hotmail.com", "eduasas.co.tz"];
  const TZ_EXTENSIONS = [".co.tz", ".go.tz", ".dev", ".ac.tz", ".org", ".ne.tz", ".net"];
  
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [user, fullDomain] = parts;

  // USI-SUGGEST lolote kama domain bado haina herufi angalau 2
  // Hii inazuia suggestion kutokea mara tu unapoandika @.
  if (fullDomain.length < 2) return null;

  const providerMatch = FAMOUS_PROVIDERS.find(p => p.startsWith(fullDomain) && p !== fullDomain);
  if (providerMatch) return `${user}@${providerMatch}`;

  const lastDotIndex = fullDomain.lastIndexOf(".");
  if (lastDotIndex !== -1) {
      const ext = fullDomain.slice(lastDotIndex);
      const domainName = fullDomain.slice(0, lastDotIndex);
      
      // Lazima kuwe na domain name (mfano 'edusaas') ndipo tu-suggest extension
      if (domainName.length >= 2) {
          const extMatch = TZ_EXTENSIONS.find(e => e.startsWith(ext) && e !== ext);
          if (extMatch) return `${user}@${domainName}${extMatch}`;
      }
  }

  return null;
};

/**
 * Kunakili maandishi kwenye clipboard ya mfumo.
 * @param text - Maandishi yanayotakiwa kunakiliwa
 * @returns Promise<boolean> - True ikifanikiwa, False ikifeli
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    if (import.meta.env.NODE_ENV === "development") {
      console.warn("Clipboard API is unreachable.");
    }
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    if (import.meta.env.NODE_ENV === "development") {
      console.error("Error while copying to clipboard:", error);
    }
    return false;
  }
}