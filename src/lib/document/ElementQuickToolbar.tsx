"use client";

import React from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered } from "lucide-react";
import type { TextElement } from "./document-template.types";
import { cn } from "@/lib/utils/helper";

/**
 * @file ElementQuickToolbar.tsx - a small floating toolbar that appears
 * above a selected text element, Word/Docs-style: bold, italic,
 * underline, alignment, list style. Formatting applies to the WHOLE text
 * block (not a mid-string selection) - elements store plain strings, not
 * a rich-text document model, so "bold this one word" isn't possible in
 * this pass (see README.md).
 */
export interface ElementQuickToolbarProps {
  element: TextElement;
  onUpdate: (patch: Partial<TextElement>) => void;
  pagePosition: { left: number; top: number };
}

export function ElementQuickToolbar({ element, onUpdate, pagePosition }: ElementQuickToolbarProps) {
  return (
    <div
      className="absolute z-[10000] flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      style={{ left: pagePosition.left, top: Math.max(0, pagePosition.top - 44) }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ToolbarButton active={element.bold} label="Bold" onClick={() => onUpdate({ bold: !element.bold })}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.italic} label="Italic" onClick={() => onUpdate({ italic: !element.italic })}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.underline} label="Underline" onClick={() => onUpdate({ underline: !element.underline })}>
        <Underline className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton active={element.align === "left"} label="Align left" onClick={() => onUpdate({ align: "left" })}>
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.align === "center"} label="Align center" onClick={() => onUpdate({ align: "center" })}>
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.align === "right"} label="Align right" onClick={() => onUpdate({ align: "right" })}>
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.align === "justify"} label="Justify" onClick={() => onUpdate({ align: "justify" })}>
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton active={element.listStyle === "bullet"} label="Bullet list" onClick={() => onUpdate({ listStyle: element.listStyle === "bullet" ? "none" : "bullet" })}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton active={element.listStyle === "numeric"} label="Numbered list" onClick={() => onUpdate({ listStyle: element.listStyle === "numeric" ? "none" : "numeric" })}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={element.listStyle === "alpha"}
        label="Alphabetical list"
        onClick={() => onUpdate({ listStyle: element.listStyle === "alpha" ? "none" : "alpha" })}
      >
        <span className="w-3.5 text-center text-[10px] font-bold">a.</span>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ active, label, onClick, children }: { active?: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", active ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-slate-200" />;
}