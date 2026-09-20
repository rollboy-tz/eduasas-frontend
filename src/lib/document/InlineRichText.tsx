"use client";

import React, { useEffect, useRef, useState } from "react";
import type { BindingField } from "./document-template.types";
import { cn } from "@/lib/utils/helper";

/**
 * @file InlineRichText.tsx - contentEditable text editor where `{{token}}`
 * segments render as LOCKED, LABELED chips instead of raw text.
 *
 * WHY THIS EXISTS: showing a user raw `{{studentName}}` exposes internal
 * data-model naming (a real weakness - it's an implementation detail, not
 * something an end user needs or should see), and if it's just plain text
 * in a textarea, anyone can accidentally or deliberately mangle it
 * mid-string and silently break the binding. This component fixes both:
 *
 * - Each token renders as `<span contentEditable={false}>Friendly Label</span>`
 *   inside the (contentEditable) container. Browsers treat a
 *   non-editable span nested in an editable one as an ATOMIC unit - you
 *   cannot place a cursor inside it or edit its characters; you can only
 *   select/delete the whole chip (which the user can plainly see they're
 *   doing, unlike quietly corrupting three characters of "{{studentN"}).
 * - Typing "{{" opens an inline suggestion popup right at the caret
 *   (like Notion's "/" menu) listing matching bindings - this is the
 *   ONLY way to insert a token; there's no separate dropdown to hunt for.
 *
 * SERIALIZATION: `content` (the stored string, e.g. "Hello {{studentName}}!")
 * is the source of truth. On mount/whenever `content` changes externally,
 * the DOM is rebuilt from it. On every edit, the DOM is walked back into
 * that same string form (text nodes -> their text, token spans ->
 * "{{path}}") and reported via `onChange`.
 */

export interface InlineRichTextProps {
  content: string;
  bindings: BindingField[];
  /** Restrict suggestions to one binding kind (e.g. "text" for a text element). Omit for all. */
  filterKind?: BindingField["kind"];
  onChange: (content: string) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onBlurExtra?: () => void;
}

const TOKEN_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

function labelFor(path: string, bindings: BindingField[]): string {
  return bindings.find((b) => b.path === path)?.label ?? path;
}

/** Builds the editable DOM (text nodes + locked token spans) from the stored string. */
function buildNodes(content: string, bindings: BindingField[]): (string | { path: string; label: string })[] {
  const parts: (string | { path: string; label: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(content))) {
    if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
    parts.push({ path: match[1], label: labelFor(match[1], bindings) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) parts.push(content.slice(lastIndex));
  return parts;
}

/** Walks the live DOM back into the stored "{{token}}" string form. */
function serializeNode(container: HTMLElement): string {
  let result = "";
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? "";
    } else if (node instanceof HTMLElement && node.dataset.tokenPath) {
      result += `{{${node.dataset.tokenPath}}}`;
    } else if (node instanceof HTMLElement) {
      result += node.textContent ?? "";
    }
  });
  return result;
}

export function InlineRichText({
  content,
  bindings,
  filterKind,
  onChange,
  style,
  className,
  placeholder,
  autoFocus,
  onBlurExtra,
}: InlineRichTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [suggest, setSuggest] = useState<{ query: string; caretRect: DOMRect } | null>(null);
  const suggestItems = bindings.filter((b) => (filterKind ? b.kind === filterKind : true));
  const lastExternalContent = useRef(content);

  // Rebuild DOM only when `content` changes from OUTSIDE this component
  // (e.g. loading a different element) - not on every keystroke, which
  // would fight the browser's own cursor handling mid-edit.
  useEffect(() => {
    if (!ref.current) return;
    if (content === lastExternalContent.current && ref.current.dataset.built === "1") return;
    ref.current.innerHTML = "";
    buildNodes(content, bindings).forEach((part) => {
      if (typeof part === "string") {
        ref.current!.appendChild(document.createTextNode(part));
      } else {
        const chip = document.createElement("span");
        chip.contentEditable = "false";
        chip.dataset.tokenPath = part.path;
        chip.textContent = part.label;
        chip.className = "inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[0.85em] font-medium text-blue-700 mx-0.5 select-none";
        chip.title = "Live data field - insert a different one via {{ or delete this chip";
        ref.current!.appendChild(chip);
      }
    });
    ref.current.dataset.built = "1";
    lastExternalContent.current = content;
  }, [content, bindings]);

  function handleInput() {
    if (!ref.current) return;

    // Detect "{{" typed just before the caret to open the suggestion popup.
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        const beforeCaret = text.slice(0, range.startOffset);
        const openMatch = beforeCaret.match(/\{\{([\w.]*)$/);
        if (openMatch) {
          const caretRect = range.getBoundingClientRect();
          setSuggest({ query: openMatch[1], caretRect });
        } else {
          setSuggest(null);
        }
      }
    }

    const serialized = serializeNode(ref.current);
    lastExternalContent.current = serialized;
    onChange(serialized);
  }

  function insertToken(path: string) {
    if (!ref.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      const beforeCaret = text.slice(0, range.startOffset);
      const openMatch = beforeCaret.match(/\{\{([\w.]*)$/);
      if (openMatch) {
        const openStart = range.startOffset - openMatch[0].length;
        const beforeText = text.slice(0, openStart);
        const afterText = text.slice(range.startOffset);

        const chip = document.createElement("span");
        chip.contentEditable = "false";
        chip.dataset.tokenPath = path;
        chip.textContent = labelFor(path, bindings);
        chip.className = "inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[0.85em] font-medium text-blue-700 mx-0.5 select-none";

        const parent = node.parentNode!;
        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(" " + afterText);
        parent.replaceChild(afterNode, node);
        parent.insertBefore(chip, afterNode);
        parent.insertBefore(beforeNode, chip);

        const newRange = document.createRange();
        newRange.setStart(afterNode, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    setSuggest(null);
    const serialized = serializeNode(ref.current);
    lastExternalContent.current = serialized;
    onChange(serialized);
  }

  const filteredSuggestions = suggest ? suggestItems.filter((b) => b.label.toLowerCase().includes(suggest.query.toLowerCase()) || b.path.toLowerCase().includes(suggest.query.toLowerCase())) : [];

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={() => {
          setSuggest(null);
          onBlurExtra?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSuggest(null);
        }}
        autoFocus={autoFocus}
        data-placeholder={placeholder}
        className={cn(
          "outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400",
          className
        )}
        style={style}
      />

      {suggest && filteredSuggestions.length > 0 && (
        <div
          className="fixed z-[10001] max-h-56 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          style={{ left: suggest.caretRect.left, top: suggest.caretRect.bottom + 4 }}
        >
          {filteredSuggestions.map((b) => (
            <button
              key={b.path}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertToken(b.path);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              <span className="truncate">{b.label}</span>
              <span className="shrink-0 rounded bg-slate-100 px-1 text-[9px] text-slate-400">{b.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}