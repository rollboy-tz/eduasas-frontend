export const normalizeEmail = (value: string) => {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, "");
};

export const normalizePhone = (value: string) => {
  if (!value) return "";

  let normalized = value.replace(/[^0-9+]/g, "");

  if (normalized.includes("+")) {
    normalized = "+" + normalized.slice(1).replace(/\+/g, "");
  }

  return normalized;
};

export const isPhoneLike = (value: string) => {
  const firstChar = value.trim().charAt(0);
  return firstChar === "+" || /^[0-9]$/.test(firstChar);
};