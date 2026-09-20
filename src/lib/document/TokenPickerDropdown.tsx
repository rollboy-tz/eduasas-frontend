"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BindingField } from "./document-template.types";
import { cn } from "@/lib/utils/helper";

/**
 * @file TokenPickerDropdown.tsx - the ONLY sanctioned way tokens get
 * inserted into a template. Lists every binding field available for the
 * template's `kind` (see report-card-bindings.ts for the report-card
 * set) and calls `onInsert("{{path}}")` when one is chosen - the caller
 * decides where that string goes (append, insert at cursor, replace a
 * field entirely).
 */
export interface TokenPickerDropdownProps {
  bindings: BindingField[];
  /** Restrict the list to one binding kind ("text"/"image"/"array"). Omit to show all. */
  filterKind?: BindingField["kind"];
  onInsert: (token: string) => void;
  label?: string;
  className?: string;
}

export function TokenPickerDropdown({ bindings, filterKind, onInsert, label = "Insert token", className }: TokenPickerDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const items = filterKind ? bindings.filter((b) => b.kind === filterKind) : bindings;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((b) => (
            <button
              key={b.path}
              type="button"
              onClick={() => {
                onInsert(`{{${b.path}}}`);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              <span className="truncate">{b.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-slate-400">{`{{${b.path}}}`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}