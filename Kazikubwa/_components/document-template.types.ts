/**
 * @file document-template.types.ts - the core, storable data model for
 * the document editor ("mini Canva"). This JSON structure IS the
 * template - never raw HTML. Raw HTML is only ever a derived, throwaway
 * RENDER of this structure against one specific data record (see
 * `renderDocumentTemplate.ts`).
 *
 * WHY THIS MATTERS (the data-safety requirement):
 * - Reusability: the same `DocumentTemplate` renders correctly for every
 *   student/record, because element content uses `{{binding}}` tokens
 *   instead of baked-in values.
 * - Safety: this is pure data (numbers, strings, arrays) - no markup, no
 *   scripts. It's safe to store in a database as JSON/JSONB and safe to
 *   load back into the editor, unlike storing arbitrary HTML (which could
 *   carry an injected `<script>` from a compromised/malicious save).
 * - Stability across devices: every element has a fixed position/size in
 *   millimeters relative to a fixed page size (A4/Letter) - the rendered
 *   output is pixel-identical regardless of the viewer's screen, exactly
 *   like a real document/PDF layout (this is what keeps "reports hazivunjiki").
 */

export type DocElementType = "text" | "image" | "rect" | "line" | "table";

interface DocElementBase {
  id: string;
  type: DocElementType;
  /** Position in millimeters from the top-left of the page. */
  x: number;
  y: number;
  /** Size in millimeters. */
  width: number;
  height: number;
  /** Paint order - higher draws on top. */
  zIndex: number;
}

export interface TextElement extends DocElementBase {
  type: "text";
  /**
   * Static text, OR a template containing `{{path.to.field}}` tokens that
   * get substituted with real values when rendered against a data record
   * (e.g. "{{studentName}}", "Term {{term}} - {{year}}").
   */
  content: string;
  fontFamily: "sans" | "serif" | "mono";
  /** Points. */
  fontSize: number;
  fontWeight: "normal" | "bold";
  /** Hex color, e.g. "#1e293b". */
  color: string;
  align: "left" | "center" | "right";
}

export interface ImageElement extends DocElementBase {
  type: "image";
  /** A URL, or a `{{binding}}` token resolved from the data record (e.g. "{{logoUrl}}", "{{studentPhotoUrl}}"). */
  src: string;
  fit: "cover" | "contain";
  borderRadius: number;
}

export interface RectElement extends DocElementBase {
  type: "rect";
  fill: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface LineElement extends DocElementBase {
  type: "line";
  color: string;
  thickness: number;
}

export interface TableColumnDef {
  header: string;
  /** Field name read off each item of the bound array (e.g. "subject", "score"). */
  field: string;
  align?: "left" | "center" | "right";
  /** Relative width weight - columns share the table width proportionally. Default 1. */
  weight?: number;
}

export interface TableElement extends DocElementBase {
  type: "table";
  /** A `{{binding}}` token pointing at an ARRAY field in the data record (e.g. "{{subjects}}"). */
  dataBinding: string;
  columns: TableColumnDef[];
  headerColor: string;
  textColor: string;
  fontSize: number;
}

export type DocElement = TextElement | ImageElement | RectElement | LineElement | TableElement;

/** What kind of document this template is for - determines which binding tokens are offered in the editor. */
export type DocumentKind = "report-card" | "certificate" | "letter" | "custom";

export interface DocumentTemplate {
  id: string;
  name: string;
  kind: DocumentKind;
  page: {
    size: "A4" | "Letter";
    orientation: "portrait" | "landscape";
  };
  /** Page background - hex color. */
  background: string;
  elements: DocElement[];
  createdAt: string;
  updatedAt: string;
}

/** Physical page dimensions in millimeters, per size + orientation. */
export const PAGE_DIMENSIONS_MM: Record<DocumentTemplate["page"]["size"], { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

export function getPageDimensionsMm(page: DocumentTemplate["page"]): { width: number; height: number } {
  const base = PAGE_DIMENSIONS_MM[page.size];
  return page.orientation === "landscape" ? { width: base.height, height: base.width } : base;
}

/** A binding field the editor can offer for a given `DocumentKind`, with a human label for the UI. */
export interface BindingField {
  /** The `{{token}}` path, without braces (e.g. "studentName", "subjects"). */
  path: string;
  label: string;
  /** "array" bindings are only valid for `TableElement.dataBinding`; others are for text/image content. */
  kind: "text" | "image" | "array";
}

function makeId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Creates a new element of the given type with sensible defaults, positioned at (x, y). */
export function createElement(type: DocElementType, x: number, y: number, zIndex: number): DocElement {
  const base = { id: makeId(), x, y, zIndex };
  switch (type) {
    case "text":
      return { ...base, type, width: 80, height: 12, content: "Text", fontFamily: "sans", fontSize: 12, fontWeight: "normal", color: "#1e293b", align: "left" };
    case "image":
      return { ...base, type, width: 30, height: 30, src: "", fit: "cover", borderRadius: 0 };
    case "rect":
      return { ...base, type, width: 60, height: 20, fill: "#f1f5f9", borderColor: "#cbd5e1", borderWidth: 1, borderRadius: 2 };
    case "line":
      return { ...base, type, width: 80, height: 1, color: "#94a3b8", thickness: 1 };
    case "table":
      return {
        ...base,
        type,
        width: 170,
        height: 60,
        dataBinding: "{{subjects}}",
        columns: [
          { header: "Subject", field: "subject", weight: 2 },
          { header: "Score", field: "score", align: "center" },
          { header: "Grade", field: "grade", align: "center" },
        ],
        headerColor: "#2563eb",
        textColor: "#1e293b",
        fontSize: 10,
      };
  }
}

/** Creates a fresh, empty template of the given kind. */
export function createBlankTemplate(name: string, kind: DocumentKind): DocumentTemplate {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    name,
    kind,
    page: { size: "A4", orientation: "portrait" },
    background: "#ffffff",
    elements: [],
    createdAt: now,
    updatedAt: now,
  };
}