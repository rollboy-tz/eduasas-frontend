/**
 * @file document-template.types.ts (v2) - expanded data model supporting
 * rotation, gradients, text decoration/lists, line styles, shapes
 * (rectangle/ellipse/triangle), and a two-mode table (data-bound for
 * reports, static for hand-typed content with row/column add-remove,
 * simple adjacent-cell merge, and per-cell alignment).
 *
 * Still pure JSON - no markup, no executable code - for the same reasons
 * as v1 (see README.md): reusable across records, safe to store, and
 * renders pixel-identically everywhere because every element has a fixed
 * mm-based position/size on a fixed page.
 */

export type DocElementType = "text" | "image" | "shape" | "line" | "table";

interface DocElementBase {
  id: string;
  type: DocElementType;
  /** Position in millimeters from the top-left of the page. */
  x: number;
  y: number;
  /** Size in millimeters. */
  width: number;
  height: number;
  /** Degrees, 0-360. */
  rotation: number;
  /** Paint order - higher draws on top. */
  zIndex: number;
}

export type FillPaint =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number };

export type ListStyle = "none" | "bullet" | "numeric" | "alpha";

export interface TextElement extends DocElementBase {
  type: "text";
  /**
   * Static text, OR a template containing `{{path.to.field}}` tokens
   * substituted at render time. Tokens are only ever inserted via the
   * token picker dropdown in the editor - never typed by hand on the
   * canvas (see `TokenPickerDropdown.tsx` and the README's "inline
   * editing" note for why this is a UI convention, not a hard technical
   * lock, given this editor uses a plain-text field rather than a rich
   * "chip"-based text engine).
   */
  content: string;
  fontFamily: "sans" | "serif" | "mono";
  /** Points. */
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** Hex color. */
  color: string;
  align: "left" | "center" | "right" | "justify";
  /** Multiplier, e.g. 1.4. */
  lineHeight: number;
  listStyle: ListStyle;
}

export interface ImageElement extends DocElementBase {
  type: "image";
  /** A URL, a data: URL (from direct upload), or a `{{binding}}` token. */
  src: string;
  fit: "cover" | "contain";
  borderRadius: number;
}

export type ShapeKind = "rectangle" | "ellipse" | "triangle";

export interface ShapeElement extends DocElementBase {
  type: "shape";
  shape: ShapeKind;
  fill: FillPaint;
  borderColor?: string;
  borderWidth?: number;
  /** Rectangle only. */
  borderRadius?: number;
}

export interface LineElement extends DocElementBase {
  type: "line";
  color: string;
  thickness: number;
  style: "solid" | "dashed" | "dotted";
}

export interface TableCell {
  text: string;
  align?: "left" | "center" | "right";
  /** Simple adjacent-cell merge: how many columns to the right this cell absorbs. Default 1. */
  colSpan?: number;
  /** Simple adjacent-cell merge: how many rows below this cell absorbs. Default 1. */
  rowSpan?: number;
  /** True on cells covered by another cell's span - not rendered/edited directly. */
  merged?: boolean;
}

export interface TableColumnDef {
  header: string;
  /** Field name read off each array item in "data-bound" mode. Unused in "static" mode. */
  field: string;
  align?: "left" | "center" | "right";
  /** Relative width weight - columns share the table width proportionally. */
  weight: number;
}

export interface TableElement extends DocElementBase {
  type: "table";
  /**
   * "data-bound": rows come from an array field at render time (report
   * cards, anything per-record). "static": rows are hand-typed in the
   * editor and stored directly in the template (fee schedules, fixed
   * reference tables, anything not tied to a data record).
   */
  mode: "data-bound" | "static";
  /** data-bound mode only - a `{{array}}` token. */
  dataBinding?: string;
  columns: TableColumnDef[];
  /** static mode only - `staticRows[r][c]`. */
  staticRows?: TableCell[][];
  /** static mode only - one entry per row, in millimeters. */
  rowHeightsMm?: number[];
  headerColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
}

export type DocElement = TextElement | ImageElement | ShapeElement | LineElement | TableElement;

export type DocumentKind = "report-card" | "certificate" | "letter" | "custom";

export interface PrintMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  kind: DocumentKind;
  page: {
    size: "A4" | "Letter";
    orientation: "portrait" | "landscape";
  };
  /** Print-safe margin guide (visual only in the editor - doesn't clip content). */
  margins: PrintMargins;
  background: string;
  elements: DocElement[];
  createdAt: string;
  updatedAt: string;
}

export const PAGE_DIMENSIONS_MM: Record<DocumentTemplate["page"]["size"], { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

export function getPageDimensionsMm(page: DocumentTemplate["page"]): { width: number; height: number } {
  const base = PAGE_DIMENSIONS_MM[page.size];
  return page.orientation === "landscape" ? { width: base.height, height: base.width } : base;
}

export interface BindingField {
  path: string;
  label: string;
  kind: "text" | "image" | "array";
}

function makeId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultStaticRows(rows: number, cols: number): TableCell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ text: "" })));
}

export function createElement(type: DocElementType, x: number, y: number, zIndex: number, variant?: ShapeKind): DocElement {
  const base = { id: makeId(), x, y, zIndex, rotation: 0 };
  switch (type) {
    case "text":
      return {
        ...base,
        type,
        width: 80,
        height: 12,
        content: "Text",
        fontFamily: "sans",
        fontSize: 12,
        bold: false,
        italic: false,
        underline: false,
        color: "#1e293b",
        align: "left",
        lineHeight: 1.3,
        listStyle: "none",
      };
    case "image":
      return { ...base, type, width: 30, height: 30, src: "", fit: "cover", borderRadius: 0 };
    case "shape":
      return {
        ...base,
        type,
        shape: variant ?? "rectangle",
        width: 60,
        height: 40,
        fill: { kind: "solid", color: "#e2e8f0" },
        borderColor: "#cbd5e1",
        borderWidth: 1,
        borderRadius: variant === "rectangle" ? 2 : 0,
      };
    case "line":
      return { ...base, type, width: 80, height: 1, color: "#94a3b8", thickness: 1, style: "solid" };
    case "table":
      return {
        ...base,
        type,
        width: 170,
        height: 60,
        mode: "data-bound",
        dataBinding: "{{subjects}}",
        columns: [
          { header: "Subject", field: "subject", weight: 2 },
          { header: "Score", field: "score", align: "center", weight: 1 },
          { header: "Grade", field: "grade", align: "center", weight: 1 },
        ],
        staticRows: defaultStaticRows(3, 3),
        rowHeightsMm: [10, 10, 10],
        headerColor: "#2563eb",
        textColor: "#1e293b",
        borderColor: "#e2e8f0",
        fontSize: 10,
      };
  }
}

export function createBlankTemplate(name: string, kind: DocumentKind): DocumentTemplate {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    name,
    kind,
    page: { size: "A4", orientation: "portrait" },
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    background: "#ffffff",
    elements: [],
    createdAt: now,
    updatedAt: now,
  };
}