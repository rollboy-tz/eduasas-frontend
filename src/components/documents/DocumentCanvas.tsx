"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/helper";
import type { DocElement, DocumentTemplate } from "./document-template.types";
import { getPageDimensionsMm } from "./document-template.types";
import { resolveToken } from "./renderDocumentTemplate";

/**
 * @file DocumentCanvas.tsx - the interactive editing surface. Renders the
 * page at a fixed millimeter-based size (matching `renderDocumentTemplate`
 * exactly, so what you design here is pixel-identical to the final
 * output), scaled to fit the available width so it stays usable on any
 * device without ever changing the underlying document's real dimensions
 * - this is what keeps the produced document itself (not just the editor
 * chrome) from "breaking" between devices.
 *
 * NOTE ON TOKEN RESOLUTION: this file has its OWN plain-text token
 * resolver (`resolvePlain`/`resolveArrayPlain`) instead of reusing
 * `renderDocumentTemplate`'s HTML-escaping versions. That's intentional:
 * this canvas renders through React (JSX), which already escapes text
 * safely on its own - running the HTML-escaping resolver here too would
 * double-escape characters like `&`. The two resolvers share the same
 * `resolveToken` path-lookup (imported), so there's only one definition
 * of "how a `{{token}}` path is looked up" - just two different endings
 * (HTML-escape vs plain) for two different rendering contexts.
 */

const PX_PER_MM = 96 / 25.4;
const MIN_SIZE_MM = 5;

const FONT_STACKS: Record<"sans" | "serif" | "mono", string> = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'Courier New', Courier, monospace",
};

function resolvePlain(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = resolveToken(path, data);
    return value === undefined || value === null ? "" : String(value);
  });
}

function resolveArrayPlain(binding: string, data: Record<string, unknown>): Record<string, unknown>[] {
  const path = binding.trim().replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
  const value = resolveToken(path, data);
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export interface DocumentCanvasProps {
  template: DocumentTemplate;
  /** Sample/live data used to preview `{{bindings}}` resolved while editing. */
  previewData: Record<string, unknown>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<DocElement>) => void;
  className?: string;
}

export function DocumentCanvas({ template, previewData, selectedId, onSelect, onUpdateElement, className }: DocumentCanvasProps) {
  const { width: pageWidthMm, height: pageHeightMm } = getPageDimensionsMm(template.page);
  const pageWidthPx = pageWidthMm * PX_PER_MM;
  const pageHeightPx = pageHeightMm * PX_PER_MM;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function update() {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 48; // account for padding
      setScale(Math.min(1, Math.max(0.2, available / pageWidthPx)));
    }
    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pageWidthPx]);

  function startDrag(e: React.PointerEvent, el: DocElement) {
    e.stopPropagation();
    onSelect(el.id);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = el.x;
    const startY = el.y;

    function onMove(ev: PointerEvent) {
      const dxMm = (ev.clientX - startClientX) / scale / PX_PER_MM;
      const dyMm = (ev.clientY - startClientY) / scale / PX_PER_MM;
      onUpdateElement(el.id, {
        x: clamp(startX + dxMm, 0, Math.max(0, pageWidthMm - el.width)),
        y: clamp(startY + dyMm, 0, Math.max(0, pageHeightMm - el.height)),
      });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startResize(e: React.PointerEvent, el: DocElement) {
    e.stopPropagation();
    onSelect(el.id);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startWidth = el.width;
    const startHeight = el.height;

    function onMove(ev: PointerEvent) {
      const dxMm = (ev.clientX - startClientX) / scale / PX_PER_MM;
      const dyMm = (ev.clientY - startClientY) / scale / PX_PER_MM;
      onUpdateElement(el.id, {
        width: clamp(startWidth + dxMm, MIN_SIZE_MM, pageWidthMm - el.x),
        height: clamp(startHeight + dyMm, MIN_SIZE_MM, pageHeightMm - el.y),
      });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div ref={containerRef} className={cn("w-full overflow-auto bg-slate-100 rounded-xl border border-slate-200 flex justify-center p-6", className)}>
      <div style={{ width: pageWidthPx * scale, height: pageHeightPx * scale }}>
        <div
          onPointerDown={() => onSelect(null)}
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: template.background,
            position: "relative",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {[...template.elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <ElementView
                key={el.id}
                el={el}
                previewData={previewData}
                isSelected={el.id === selectedId}
                onPointerDownElement={(e) => startDrag(e, el)}
                onPointerDownHandle={(e) => startResize(e, el)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function ElementView({
  el,
  previewData,
  isSelected,
  onPointerDownElement,
  onPointerDownHandle,
}: {
  el: DocElement;
  previewData: Record<string, unknown>;
  isSelected: boolean;
  onPointerDownElement: (e: React.PointerEvent) => void;
  onPointerDownHandle: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      onPointerDown={onPointerDownElement}
      style={{
        position: "absolute",
        left: el.x * PX_PER_MM,
        top: el.y * PX_PER_MM,
        width: el.width * PX_PER_MM,
        height: el.height * PX_PER_MM,
        zIndex: el.zIndex,
        cursor: "move",
        outline: isSelected ? "1px solid #2563eb" : "1px dashed transparent",
      }}
    >
      <ElementContent el={el} previewData={previewData} />
      {isSelected && (
        <div
          onPointerDown={onPointerDownHandle}
          role="presentation"
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -5,
            bottom: -5,
            width: 10,
            height: 10,
            borderRadius: 2,
            background: "#2563eb",
            cursor: "nwse-resize",
          }}
        />
      )}
    </div>
  );
}

function ElementContent({ el, previewData }: { el: DocElement; previewData: Record<string, unknown> }) {
  const baseStyle: React.CSSProperties = { width: "100%", height: "100%", pointerEvents: "none" };

  switch (el.type) {
    case "text":
      return (
        <div
          style={{
            ...baseStyle,
            fontFamily: FONT_STACKS[el.fontFamily],
            fontSize: `${el.fontSize}pt`,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}
        >
          {resolvePlain(el.content, previewData)}
        </div>
      );

    case "image": {
      const src = resolvePlain(el.src, previewData);
      if (!src) {
        return (
          <div style={{ ...baseStyle, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8" }}>
            Image
          </div>
        );
      }
      return <img src={src} alt="" style={{ ...baseStyle, objectFit: el.fit, borderRadius: el.borderRadius }} />;
    }

    case "rect":
      return (
        <div
          style={{
            ...baseStyle,
            background: el.fill,
            border: el.borderColor ? `${el.borderWidth ?? 1}px solid ${el.borderColor}` : undefined,
            borderRadius: el.borderRadius,
            boxSizing: "border-box",
          }}
        />
      );

    case "line":
      return <div style={{ ...baseStyle, height: el.thickness, background: el.color }} />;

    case "table": {
      const rows = resolveArrayPlain(el.dataBinding, previewData);
      return (
        <table style={{ ...baseStyle, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {el.columns.map((c) => (
                <th key={c.field} style={{ background: el.headerColor, color: "#fff", fontSize: el.fontSize, padding: "2px 4px", textAlign: c.align ?? "left" }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {el.columns.map((c) => (
                  <td key={c.field} style={{ fontSize: el.fontSize, color: el.textColor, padding: "2px 4px", borderBottom: "1px solid #e2e8f0", textAlign: c.align ?? "left" }}>
                    {String(row[c.field] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  }
}