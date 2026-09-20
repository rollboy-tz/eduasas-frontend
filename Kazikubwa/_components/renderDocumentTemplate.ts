import {
  DocumentTemplate,
  DocElement,
  TableElement,
  getPageDimensionsMm,
} from "./document-template.types";

/**
 * @file renderDocumentTemplate.ts - compiles a `DocumentTemplate` (safe
 * JSON) + a real data record into a final, print-ready HTML string. This
 * is the ONLY place raw HTML gets produced - never stored back as the
 * "template", only ever generated on demand for one specific record
 * (one student's report card, one certificate recipient, etc).
 *
 * SECURITY: every value pulled from `data` (or from free-text fields a
 * user typed, like a footer note) is escaped before being placed into
 * HTML. Without this, a value like a student's name containing
 * `<script>` (whether malicious or accidental) would execute wherever
 * this HTML is later rendered (browser preview, PDF export, etc).
 */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Defends against a corrupted/tampered stored color value leaking invalid CSS into the page. */
function safeColor(color: string | undefined, fallback: string): string {
  return color && HEX_COLOR_PATTERN.test(color) ? color : fallback;
}

const FONT_STACKS: Record<"sans" | "serif" | "mono", string> = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'Courier New', Courier, monospace",
};

/** Resolves a single `{{path.to.field}}` token against a data record. Returns "" for missing/null values. */
function resolveToken(path: string, data: Record<string, unknown>): unknown {
  return path
    .trim()
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, data);
}

/**
 * Replaces every `{{token}}` in `template` with the (HTML-escaped) value
 * resolved from `data`. Used for text content and image `src` strings.
 */
function resolveBindings(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = resolveToken(path, data);
    return value === undefined || value === null ? "" : escapeHtml(value);
  });
}

/** Extracts the array a `TableElement.dataBinding` points at, e.g. "{{subjects}}" -> `data.subjects`. */
function resolveArrayBinding(binding: string, data: Record<string, unknown>): Record<string, unknown>[] {
  const path = binding.trim().replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
  const value = resolveToken(path, data);
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function mm(value: number): string {
  return `${value}mm`;
}

function renderElement(el: DocElement, data: Record<string, unknown>): string {
  const positionStyle = `position:absolute; left:${mm(el.x)}; top:${mm(el.y)}; width:${mm(el.width)}; height:${mm(el.height)}; z-index:${el.zIndex};`;

  switch (el.type) {
    case "text": {
      const color = safeColor(el.color, "#1e293b");
      const text = resolveBindings(el.content, data);
      return `<div style="${positionStyle} font-family:${FONT_STACKS[el.fontFamily]}; font-size:${el.fontSize}pt; font-weight:${el.fontWeight}; color:${color}; text-align:${el.align}; white-space:pre-wrap; overflow:hidden;">${text}</div>`;
    }

    case "image": {
      const src = resolveBindings(el.src, data);
      if (!src) return `<div style="${positionStyle}"></div>`;
      return `<img src="${src}" style="${positionStyle} object-fit:${el.fit}; border-radius:${el.borderRadius}mm;" alt="" />`;
    }

    case "rect": {
      const fill = safeColor(el.fill, "#f1f5f9");
      const border = el.borderColor ? `border:${el.borderWidth ?? 1}px solid ${safeColor(el.borderColor, "#cbd5e1")};` : "";
      return `<div style="${positionStyle} background:${fill}; ${border} border-radius:${el.borderRadius ?? 0}mm; box-sizing:border-box;"></div>`;
    }

    case "line": {
      const color = safeColor(el.color, "#94a3b8");
      return `<div style="${positionStyle} background:${color}; height:${el.thickness}px;"></div>`;
    }

    case "table": {
      return renderTable(el, data, positionStyle);
    }

    default:
      return "";
  }
}

function renderTable(el: TableElement, data: Record<string, unknown>, positionStyle: string): string {
  const rows = resolveArrayBinding(el.dataBinding, data);
  const headerColor = safeColor(el.headerColor, "#2563eb");
  const textColor = safeColor(el.textColor, "#1e293b");
  const totalWeight = el.columns.reduce((sum, c) => sum + (c.weight ?? 1), 0) || 1;

  const headerCells = el.columns
    .map((c) => {
      const widthPct = ((c.weight ?? 1) / totalWeight) * 100;
      return `<th style="width:${widthPct}%; text-align:${c.align ?? "left"}; padding:4px 6px; background:${headerColor}; color:#ffffff; font-size:${el.fontSize}pt;">${escapeHtml(c.header)}</th>`;
    })
    .join("");

  const bodyRows = rows
    .map((row) => {
      const cells = el.columns
        .map((c) => `<td style="text-align:${c.align ?? "left"}; padding:4px 6px; border-bottom:1px solid #e2e8f0; color:${textColor}; font-size:${el.fontSize}pt;">${escapeHtml(row[c.field])}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<div style="${positionStyle} overflow:auto;"><table style="width:100%; border-collapse:collapse;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
}

/**
 * Compiles a `DocumentTemplate` + one data record into a complete,
 * standalone HTML document (print-ready, fixed page size). This output
 * is a snapshot for ONE record - never save this string back as "the
 * template"; the `DocumentTemplate` JSON remains the source of truth.
 */
export function renderDocumentTemplate(template: DocumentTemplate, data: Record<string, unknown>): string {
  const { width, height } = getPageDimensionsMm(template.page);
  const background = safeColor(template.background, "#ffffff");
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementsHtml = sortedElements.map((el) => renderElement(el, data)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(template.name)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #f1f5f9; }
  .page {
    position: relative;
    width: ${mm(width)};
    height: ${mm(height)};
    background: ${background};
    overflow: hidden;
  }
  @media print {
    html, body { background: #fff; }
    .page { box-shadow: none; }
  }
  @media screen {
    .page { box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin: 16px auto; }
  }
  table { border-collapse: collapse; }
</style>
</head>
<body>
  <div class="page">
    ${elementsHtml}
  </div>
</body>
</html>`;
}