"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/helper";
import type { DocElement, DocumentTemplate, TextElement } from "./document-template.types";
import { getPageDimensionsMm } from "./document-template.types";
import { resolveToken } from "./renderDocumentTemplate";
import { ElementQuickToolbar } from "./ElementQuickToolbar";

/**
 * @file DocumentCanvas.tsx (v2) - the interactive editing surface.
 *
 * NEW IN THIS PASS:
 * - Rotation: a handle above the selection; drag to rotate, snaps near
 *   0/45/90/135/180/225/270/315deg (within ~4deg) so exact 45deg turns
 *   are easy to hit without fighting the mouse.
 * - Smart alignment guides: while dragging, the element's edges/center
 *   are compared against other elements' edges/centers and the page
 *   center; a dashed guide line appears and the element snaps when
 *   within ~2mm. This is a genuinely working (not fake) version of
 *   Illustrator/Photoshop-style snapping, scoped to edge/center
 *   alignment - it does NOT do spacing-equalization guides ("these 3
 *   objects are evenly spaced") the way some pro tools do.
 * - Rulers (top + left, mm marks) and a print-margin guide overlay -
 *   both purely visual, toggleable, never affect rendered output.
 * - Double-click a text element to edit it inline via a plain
 *   `<textarea>` overlay (not `contentEditable` - more reliable, but
 *   means a `{{token}}` inside the text is just plain characters like
 *   any other and CAN be edited/deleted like any text once you're in
 *   edit mode. The "don't type tokens by hand" rule is a workflow
 *   convention enforced by only exposing token insertion through
 *   `TokenPickerDropdown`, not a hard technical lock on the text field.
 *   A true "locked token chip" would need a full rich-text engine
 *   (e.g. Slate/Tiptap) - noted as a follow-up in README.md.
 */

const PX_PER_MM = 96 / 25.4;
const MIN_SIZE_MM = 5;
const SNAP_THRESHOLD_MM = 2;
const ROTATE_SNAP_DEG = 4;

const FONT_STACKS: Record<"sans" | "serif" | "mono", string> = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'Courier New', Courier, monospace",
};

function resolvePlain(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
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

function fillCss(fill: DocElement extends { type: "shape" } ? never : never): string {
  return ""; // placeholder, real shape fill handled inline below (kept simple)
}

interface Guides {
  vertical: number[]; // mm, page-relative x positions
  horizontal: number[]; // mm, page-relative y positions
}

export interface DocumentCanvasProps {
  template: DocumentTemplate;
  previewData: Record<string, unknown>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<DocElement>) => void;
  showRulers?: boolean;
  showMargins?: boolean;
  className?: string;
}

export function DocumentCanvas({
  template,
  previewData,
  selectedId,
  onSelect,
  onUpdateElement,
  showRulers = true,
  showMargins = true,
  className,
}: DocumentCanvasProps) {
  const { width: pageWidthMm, height: pageHeightMm } = getPageDimensionsMm(template.page);
  const pageWidthPx = pageWidthMm * PX_PER_MM;
  const pageHeightPx = pageHeightMm * PX_PER_MM;

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [guides, setGuides] = useState<Guides>({ vertical: [], horizontal: [] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const rulerSize = showRulers ? 20 : 0;

  useLayoutEffect(() => {
    function update() {
      if (!containerRef.current) return;
      const available = containerRef.current.clientWidth - 48 - rulerSize;
      setScale(Math.min(1, Math.max(0.2, available / pageWidthPx)));
    }
    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageWidthPx, rulerSize]);

  const selectedElement = template.elements.find((e) => e.id === selectedId) ?? null;

  function snapAgainstOthers(dragged: DocElement, proposedX: number, proposedY: number) {
    const others = template.elements.filter((e) => e.id !== dragged.id);
    const candidatesX = [0, pageWidthMm / 2, pageWidthMm, ...others.flatMap((o) => [o.x, o.x + o.width / 2, o.x + o.width])];
    const candidatesY = [0, pageHeightMm / 2, pageHeightMm, ...others.flatMap((o) => [o.y, o.y + o.height / 2, o.y + o.height])];

    const edgesX = [proposedX, proposedX + dragged.width / 2, proposedX + dragged.width];
    const edgesY = [proposedY, proposedY + dragged.height / 2, proposedY + dragged.height];

    let snappedX = proposedX;
    let guideX: number | null = null;
    for (const edge of edgesX) {
      const hit = candidatesX.find((c) => Math.abs(edge - c) < SNAP_THRESHOLD_MM);
      if (hit !== undefined) {
        snappedX = proposedX + (hit - edge);
        guideX = hit;
        break;
      }
    }

    let snappedY = proposedY;
    let guideY: number | null = null;
    for (const edge of edgesY) {
      const hit = candidatesY.find((c) => Math.abs(edge - c) < SNAP_THRESHOLD_MM);
      if (hit !== undefined) {
        snappedY = proposedY + (hit - edge);
        guideY = hit;
        break;
      }
    }

    setGuides({ vertical: guideX !== null ? [guideX] : [], horizontal: guideY !== null ? [guideY] : [] });
    return { x: snappedX, y: snappedY };
  }

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
      const rawX = clamp(startX + dxMm, 0, Math.max(0, pageWidthMm - el.width));
      const rawY = clamp(startY + dyMm, 0, Math.max(0, pageHeightMm - el.height));
      const snapped = ev.shiftKey ? { x: rawX, y: rawY } : snapAgainstOthers(el, rawX, rawY);
      onUpdateElement(el.id, { x: snapped.x, y: snapped.y });
    }
    function onUp() {
      setGuides({ vertical: [], horizontal: [] });
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

  function startRotate(e: React.PointerEvent, el: DocElement) {
    e.stopPropagation();
    onSelect(el.id);
    const pageRect = pageRef.current?.getBoundingClientRect();
    if (!pageRect) return;
    const centerX = pageRect.left + (el.x + el.width / 2) * PX_PER_MM * scale;
    const centerY = pageRect.top + (el.y + el.height / 2) * PX_PER_MM * scale;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;
      const snapPoints = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      const snapped = snapPoints.find((s) => Math.abs(angle - s) < ROTATE_SNAP_DEG);
      onUpdateElement(el.id, { rotation: Math.round((snapped !== undefined ? snapped : angle) % 360) });
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
      <div className="relative" style={{ width: pageWidthPx * scale + rulerSize, height: pageHeightPx * scale + rulerSize }}>
        {showRulers && <Ruler orientation="horizontal" lengthMm={pageWidthMm} scale={scale} offset={rulerSize} />}
        {showRulers && <Ruler orientation="vertical" lengthMm={pageHeightMm} scale={scale} offset={rulerSize} />}

        <div style={{ position: "absolute", left: rulerSize, top: rulerSize, width: pageWidthPx * scale, height: pageHeightPx * scale }}>
          <div
            ref={pageRef}
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
            {showMargins && (
              <div
                style={{
                  position: "absolute",
                  left: template.margins.left * PX_PER_MM,
                  top: template.margins.top * PX_PER_MM,
                  right: template.margins.right * PX_PER_MM,
                  bottom: template.margins.bottom * PX_PER_MM,
                  border: "1px dashed #94a3b8",
                  pointerEvents: "none",
                  zIndex: 9998,
                }}
              />
            )}

            {guides.vertical.map((g, i) => (
              <div key={`v-${i}`} style={{ position: "absolute", left: g * PX_PER_MM, top: 0, bottom: 0, width: 1, background: "#ec4899", zIndex: 9999, pointerEvents: "none" }} />
            ))}
            {guides.horizontal.map((g, i) => (
              <div key={`h-${i}`} style={{ position: "absolute", top: g * PX_PER_MM, left: 0, right: 0, height: 1, background: "#ec4899", zIndex: 9999, pointerEvents: "none" }} />
            ))}

            {[...template.elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => (
                <ElementView
                  key={el.id}
                  el={el}
                  previewData={previewData}
                  isSelected={el.id === selectedId}
                  isEditing={el.id === editingId}
                  onPointerDownElement={(e) => startDrag(e, el)}
                  onPointerDownHandle={(e) => startResize(e, el)}
                  onPointerDownRotate={(e) => startRotate(e, el)}
                  onDoubleClick={() => el.type === "text" && setEditingId(el.id)}
                  onStopEditing={() => setEditingId(null)}
                  onUpdateElement={onUpdateElement}
                />
              ))}
          </div>
        </div>

        {selectedElement?.type === "text" && (
          <ElementQuickToolbar
            element={selectedElement as TextElement}
            onUpdate={(patch) => onUpdateElement(selectedElement.id, patch)}
            pagePosition={{
              left: rulerSize + selectedElement.x * PX_PER_MM * scale,
              top: rulerSize + selectedElement.y * PX_PER_MM * scale,
            }}
          />
        )}
      </div>
    </div>
  );
}

function Ruler({ orientation, lengthMm, scale, offset }: { orientation: "horizontal" | "vertical"; lengthMm: number; scale: number; offset: number }) {
  const marks = [];
  for (let m = 0; m <= lengthMm; m += 10) {
    marks.push(m);
  }
  const isH = orientation === "horizontal";
  return (
    <div
      style={{
        position: "absolute",
        left: isH ? offset : 0,
        top: isH ? 0 : offset,
        width: isH ? lengthMm * PX_PER_MM * scale : offset,
        height: isH ? offset : lengthMm * PX_PER_MM * scale,
        background: "#f8fafc",
        borderRight: isH ? undefined : "1px solid #e2e8f0",
        borderBottom: isH ? "1px solid #e2e8f0" : undefined,
      }}
    >
      {marks.map((m) => (
        <div
          key={m}
          style={{
            position: "absolute",
            left: isH ? m * PX_PER_MM * scale : 0,
            top: isH ? 0 : m * PX_PER_MM * scale,
            fontSize: 8,
            color: "#94a3b8",
            lineHeight: 1,
            padding: 2,
            borderLeft: isH ? "1px solid #cbd5e1" : undefined,
            borderTop: isH ? undefined : "1px solid #cbd5e1",
            width: isH ? undefined : offset,
          }}
        >
          {m}
        </div>
      ))}
    </div>
  );
}

interface ElementViewProps {
  el: DocElement;
  previewData: Record<string, unknown>;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDownElement: (e: React.PointerEvent) => void;
  onPointerDownHandle: (e: React.PointerEvent) => void;
  onPointerDownRotate: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  onStopEditing: () => void;
  onUpdateElement: (id: string, patch: Partial<DocElement>) => void;
}

function ElementView({
  el,
  previewData,
  isSelected,
  isEditing,
  onPointerDownElement,
  onPointerDownHandle,
  onPointerDownRotate,
  onDoubleClick,
  onStopEditing,
  onUpdateElement,
}: ElementViewProps) {
  return (
    <div
      onPointerDown={isEditing ? undefined : onPointerDownElement}
      onDoubleClick={onDoubleClick}
      style={{
        position: "absolute",
        left: el.x * PX_PER_MM,
        top: el.y * PX_PER_MM,
        width: el.width * PX_PER_MM,
        height: el.height * PX_PER_MM,
        zIndex: el.zIndex,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        cursor: isEditing ? "text" : "move",
        outline: isSelected ? "1px solid #2563eb" : "1px dashed transparent",
      }}
    >
      {isEditing && el.type === "text" ? (
        <textarea
          autoFocus
          defaultValue={el.content}
          onBlur={(e) => {
            onUpdateElement(el.id, { content: e.target.value });
            onStopEditing();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onStopEditing();
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: FONT_STACKS[el.fontFamily],
            fontSize: `${el.fontSize}pt`,
            fontWeight: el.bold ? "bold" : "normal",
            fontStyle: el.italic ? "italic" : "normal",
            textDecoration: el.underline ? "underline" : "none",
            color: el.color,
            textAlign: el.align === "justify" ? "left" : el.align,
            lineHeight: el.lineHeight,
          }}
        />
      ) : (
        <ElementContent el={el} previewData={previewData} />
      )}

      {isSelected && !isEditing && (
        <>
          <div
            onPointerDown={onPointerDownRotate}
            role="presentation"
            aria-hidden="true"
            title="Drag to rotate"
            style={{
              position: "absolute",
              left: "50%",
              top: -22,
              width: 10,
              height: 10,
              marginLeft: -5,
              borderRadius: "50%",
              background: "#2563eb",
              cursor: "grab",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -14,
              width: 1,
              height: 12,
              marginLeft: 0,
              background: "#2563eb",
            }}
          />
          <div
            onPointerDown={onPointerDownHandle}
            role="presentation"
            aria-hidden="true"
            title="Drag to resize"
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
        </>
      )}
    </div>
  );
}

function ElementContent({ el, previewData }: { el: DocElement; previewData: Record<string, unknown> }) {
  const baseStyle: React.CSSProperties = { width: "100%", height: "100%", pointerEvents: "none" };

  switch (el.type) {
    case "text": {
      const text = resolvePlain(el.content, previewData);
      const isList = el.listStyle !== "none";
      const style: React.CSSProperties = {
        ...baseStyle,
        fontFamily: FONT_STACKS[el.fontFamily],
        fontSize: `${el.fontSize}pt`,
        fontWeight: el.bold ? "bold" : "normal",
        fontStyle: el.italic ? "italic" : "normal",
        textDecoration: el.underline ? "underline" : "none",
        color: el.color,
        textAlign: el.align === "justify" ? "left" : el.align,
        lineHeight: el.lineHeight,
        whiteSpace: isList ? "normal" : "pre-wrap",
        overflow: "hidden",
      };
      if (!isList) return <div style={style}>{text}</div>;
      const listStyleType = el.listStyle === "bullet" ? "disc" : el.listStyle === "numeric" ? "decimal" : "lower-alpha";
      return (
        <ul style={{ ...style, listStyleType, paddingLeft: "1.2em" }}>
          {text.split("\n").map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      );
    }

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

    case "shape": {
      const background = el.fill.kind === "solid" ? el.fill.color : `linear-gradient(${el.fill.angle}deg, ${el.fill.from}, ${el.fill.to})`;
      if (el.shape === "triangle") {
        return (
          <div
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `${el.width * PX_PER_MM / 2}px solid transparent`,
              borderRight: `${el.width * PX_PER_MM / 2}px solid transparent`,
              borderBottom: `${el.height * PX_PER_MM}px solid ${el.fill.kind === "solid" ? el.fill.color : el.fill.from}`,
            }}
          />
        );
      }
      return (
        <div
          style={{
            ...baseStyle,
            background,
            border: el.borderColor ? `${el.borderWidth ?? 1}px solid ${el.borderColor}` : undefined,
            borderRadius: el.shape === "ellipse" ? "50%" : el.borderRadius,
            boxSizing: "border-box",
          }}
        />
      );
    }

    case "line": {
      const borderCss = el.style === "solid" ? {} : { borderTop: `${el.thickness}px ${el.style} ${el.color}` };
      return <div style={{ ...baseStyle, height: el.thickness, background: el.style === "solid" ? el.color : "transparent", ...borderCss }} />;
    }

    case "table": {
      const totalWeight = el.columns.reduce((s, c) => s + (c.weight ?? 1), 0) || 1;
      const headerCells = el.columns.map((c) => (
        <th
          key={c.field}
          style={{ width: `${((c.weight ?? 1) / totalWeight) * 100}%`, background: el.headerColor, color: "#fff", fontSize: el.fontSize, padding: "2px 4px", textAlign: c.align ?? "left" }}
        >
          {c.header}
        </th>
      ));

      let bodyRows: React.ReactNode;
      if (el.mode === "static" && el.staticRows) {
        bodyRows = el.staticRows.map((row, ri) => (
          <tr key={ri}>
            {row
              .filter((cell) => !cell.merged)
              .map((cell, ci) => (
                <td
                  key={ci}
                  colSpan={cell.colSpan && cell.colSpan > 1 ? cell.colSpan : undefined}
                  rowSpan={cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : undefined}
                  style={{ fontSize: el.fontSize, color: el.textColor, padding: "2px 4px", borderBottom: `1px solid ${el.borderColor}`, textAlign: cell.align ?? "left" }}
                >
                  {cell.text}
                </td>
              ))}
          </tr>
        ));
      } else {
        const rows = el.dataBinding ? resolveArrayPlain(el.dataBinding, previewData) : [];
        bodyRows = rows.map((row, i) => (
          <tr key={i}>
            {el.columns.map((c) => (
              <td key={c.field} style={{ fontSize: el.fontSize, color: el.textColor, padding: "2px 4px", borderBottom: `1px solid ${el.borderColor}`, textAlign: c.align ?? "left" }}>
                {String(row[c.field] ?? "")}
              </td>
            ))}
          </tr>
        ));
      }

      return (
        <table style={{ ...baseStyle, borderCollapse: "collapse" }}>
          <thead>
            <tr>{headerCells}</tr>
          </thead>
          <tbody>{bodyRows}</tbody>
        </table>
      );
    }
  }
}