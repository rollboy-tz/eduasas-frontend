import {
  DocumentTemplate,
  DocElement,
  TableElement,
  FillPaint,
  ListStyle,
  getPageDimensionsMm,
} from "./document-template.types";

/**
 * @file renderDocumentTemplate.ts (v2) - compiles a `DocumentTemplate`
 * (safe JSON) + a real data record into a final, print-ready HTML string.
 * Mirrors every visual feature added to the editor (rotation, gradients,
 * shapes, text decoration/lists, line styles, static/data-bound tables
 * with merged cells) so what's designed is exactly what's produced.
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

function safeColor(color: string | undefined, fallback: string): string {
  return color && HEX_COLOR_PATTERN.test(color) ? color : fallback;
}

function safeFill(fill: FillPaint, fallback: string): string {
  if (fill.kind === "solid") return safeColor(fill.color, fallback);
  const from = safeColor(fill.from, fallback);
  const to = safeColor(fill.to, fallback);
  const angle = Number.isFinite(fill.angle) ? fill.angle : 90;
  return `linear-gradient(${angle}deg, ${from}, ${to})`;
}

const FONT_STACKS: Record<"sans" | "serif" | "mono", string> = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'Courier New', Courier, monospace",
};

export function resolveToken(path: string, data: Record<string, unknown>): unknown {
  return path
    .trim()
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, data);
}

function resolveBindings(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = resolveToken(path, data);
    return value === undefined || value === null ? "" : escapeHtml(value);
  });
}

export function resolveArrayBinding(binding: string, data: Record<string, unknown>): Record<string, unknown>[] {
  const path = binding.trim().replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
  const value = resolveToken(path, data);
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function mm(value: number): string {
  return `${value}mm`;
}

function listStyleCss(listStyle: ListStyle): string {
  switch (listStyle) {
    case "bullet":
      return "disc";
    case "numeric":
      return "decimal";
    case "alpha":
      return "lower-alpha";
    default:
      return "none";
  }
}

function renderElement(el: DocElement, data: Record<string, unknown>): string {
  const rotate = el.rotation ? ` rotate(${el.rotation}deg)` : "";
  const positionStyle = `position:absolute; left:${mm(el.x)}; top:${mm(el.y)}; width:${mm(el.width)}; height:${mm(el.height)}; z-index:${el.zIndex}; transform:${rotate || "none"};`;

  switch (el.type) {
    case "text": {
      const color = safeColor(el.color, "#1e293b");
      const text = resolveBindings(el.content, data);
      const decoration = el.underline ? "underline" : "none";
      const lines = text.split("\n");
      const isList = el.listStyle !== "none";
      const inner = isList
        ? `<ul style="list-style-type:${listStyleCss(el.listStyle)}; padding-left:1.2em; margin:0;">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`
        : text;

      return `<div style="${positionStyle} font-family:${FONT_STACKS[el.fontFamily]}; font-size:${el.fontSize}pt; font-weight:${el.bold ? "bold" : "normal"}; font-style:${el.italic ? "italic" : "normal"}; text-decoration:${decoration}; color:${color}; text-align:${el.align}; line-height:${el.lineHeight}; white-space:${isList ? "normal" : "pre-wrap"}; overflow:hidden;">${inner}</div>`;
    }

    case "image": {
      const src = resolveBindings(el.src, data);
      if (!src) return `<div style="${positionStyle}"></div>`;
      return `<img src="${src}" style="${positionStyle} object-fit:${el.fit}; border-radius:${el.borderRadius}mm;" alt="" />`;
    }

    case "shape": {
      const fill = safeFill(el.fill, "#f1f5f9");
      const border = el.borderColor ? `border:${el.borderWidth ?? 1}px solid ${safeColor(el.borderColor, "#cbd5e1")};` : "";

      if (el.shape === "triangle") {
        return `<div style="${positionStyle} width:0; height:0; border-left:${mm(el.width / 2)} solid transparent; border-right:${mm(el.width / 2)} solid transparent; border-bottom:${mm(el.height)} solid ${el.fill.kind === "solid" ? fill : safeColor(el.fill.from, "#f1f5f9")};"></div>`;
      }

      const radius = el.shape === "ellipse" ? "50%" : `${el.borderRadius ?? 0}mm`;
      return `<div style="${positionStyle} background:${fill}; ${border} border-radius:${radius}; box-sizing:border-box;"></div>`;
    }

    case "line": {
      const color = safeColor(el.color, "#94a3b8");
      const borderStyle = el.style === "solid" ? "" : `border-top:${el.thickness}px ${el.style} ${color}; background:none;`;
      return `<div style="${positionStyle} ${borderStyle || `background:${color}; height:${el.thickness}px;`}"></div>`;
    }

    case "table":
      return renderTable(el, data, positionStyle);

    default:
      return "";
  }
}

function renderTable(el: TableElement, data: Record<string, unknown>, positionStyle: string): string {
  const headerColor = safeColor(el.headerColor, "#2563eb");
  const textColor = safeColor(el.textColor, "#1e293b");
  const borderColor = safeColor(el.borderColor, "#e2e8f0");
  const totalWeight = el.columns.reduce((sum, c) => sum + (c.weight ?? 1), 0) || 1;

  const headerCells = el.columns
    .map((c) => {
      const widthPct = ((c.weight ?? 1) / totalWeight) * 100;
      return `<th style="width:${widthPct}%; text-align:${c.align ?? "left"}; padding:4px 6px; background:${headerColor}; color:#ffffff; font-size:${el.fontSize}pt;">${escapeHtml(c.header)}</th>`;
    })
    .join("");

  let bodyRows: string;

  if (el.mode === "static" && el.staticRows) {
    bodyRows = el.staticRows
      .map((row) =>
        `<tr>${row
          .filter((cell) => !cell.merged)
          .map(
            (cell) =>
              `<td ${cell.colSpan && cell.colSpan > 1 ? `colspan="${cell.colSpan}"` : ""} ${cell.rowSpan && cell.rowSpan > 1 ? `rowspan="${cell.rowSpan}"` : ""} style="text-align:${cell.align ?? "left"}; padding:4px 6px; border-bottom:1px solid ${borderColor}; color:${textColor}; font-size:${el.fontSize}pt;">${escapeHtml(cell.text)}</td>`
          )
          .join("")}</tr>`
      )
      .join("");
  } else {
    const rows = el.dataBinding ? resolveArrayBinding(el.dataBinding, data) : [];
    bodyRows = rows
      .map((row) => {
        const cells = el.columns
          .map((c) => `<td style="text-align:${c.align ?? "left"}; padding:4px 6px; border-bottom:1px solid ${borderColor}; color:${textColor}; font-size:${el.fontSize}pt;">${escapeHtml(row[c.field])}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
  }

  return `<div style="${positionStyle} overflow:auto;"><table style="width:100%; border-collapse:collapse;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
}

/**
 * Compiles a `DocumentTemplate` + one data record into a complete,
 * standalone HTML document. This output is a snapshot for ONE record -
 * never save this string back as "the template"; the `DocumentTemplate`
 * JSON remains the source of truth. Print margins are NOT applied here
 * as clipping (they're an editor-only visual guide) - actual print
 * margins are controlled by the browser's print dialog / PDF engine when
 * this HTML is printed or exported.
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
  @page { size: ${template.page.size} ${template.page.orientation}; margin: 0; }
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