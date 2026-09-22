import type { DocumentTemplate } from "./document-template.types";
import { renderDocumentTemplate } from "./renderDocumentTemplate";

/**
 * @file print-and-export.ts - the "print right now" path, separate from
 * "save to database" (`onSave` in `DocumentEditorPage`). Both work off
 * the same in-memory `DocumentTemplate` at any point while editing -
 * neither requires the other to happen first.
 */

/**
 * Renders `template` against `data`, opens it in a new browser tab, and
 * triggers the print dialog once the content has loaded. The new window
 * is what actually gets printed - nothing in the current page is
 * affected, and closing the print dialog leaves the preview tab open so
 * the user can print again or save as PDF from the browser's own dialog.
 */
export function printDocumentTemplate(template: DocumentTemplate, data: Record<string, unknown>): void {
  const html = renderDocumentTemplate(template, data);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    // Popup blocked - fall back to a same-tab navigation the user can print from manually.
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * Triggers a browser download of the rendered HTML as a standalone
 * `.html` file (e.g. for emailing a single report card, or archiving one
 * outside the system). This is a rendered SNAPSHOT for one data record -
 * see document-template.types.ts for why the `DocumentTemplate` JSON,
 * not this file, is what should be persisted as "the template".
 */
export function downloadRenderedHtml(template: DocumentTemplate, data: Record<string, unknown>, fileName?: string): void {
  const html = renderDocumentTemplate(template, data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? `${template.name || "document"}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
