"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/helper";

/**
 * @file CollapsibleSection.tsx - a small open/close accordion section,
 * used to fold up secondary controls (Position/Advanced fields, Layers,
 * etc.) so panels stay compact instead of showing every field at once.
 */
export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({ title, defaultOpen = false, children, className }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-md border border-slate-100", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        {title}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-slate-100 p-2.5">{children}</div>}
    </div>
  );
}
