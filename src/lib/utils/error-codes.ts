// src/constants/error-groups.ts

export const ERROR_GROUPS = {
  // Kundi la kufuta session na kurudi login
  SESSION_TERMINATE: [
    "SESSION_MALFORMED", 
    "SESSION_NOT_FOUND", 
    "SESSION_EXPIRED",
    "AUTH_REQUIRED"
  ],

  // Kundi la kubaki kwenye page lakini kuzuia action (View Only)
  ACCESS_RESTRICTED: [
    "PERMISSION_DENIED",
    "ROLE_MISMATCH",
    "VIEW_ONLY_MODE"
  ],

  // Kundi la kumuhamisha shule/portal
  CONTEXT_ERROR: [
    "SCHOOL_NOT_FOUND",
    "CONTEXT_MISMATCH"
  ]
} as const;