"use client";

import * as Icons from "lucide-react";

/**
 * Inatafuta na kurudisha Component ya ikoni kutoka kwenye maktaba ya `lucide-react`
 * kulingana na jina la ikoni lililotolewa.
 *
 * @param name - Jina la ikoni inayotakiwa (mfano: "Home", "User", "Settings").
 * @returns Component ya ikoni iliyopatikana, au ikoni ya msingi (`Icons.HelpCircle`) ikiwa jina halikupatikana.
 */
export function resolveSidebarIcon(name: string) {
  return (
    (Icons as unknown as Record<string, React.ElementType>)[name] ||
    Icons.HelpCircle
  );
}