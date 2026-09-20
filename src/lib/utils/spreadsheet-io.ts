import * as XLSX from "xlsx";

/**
 * @file spreadsheet-io.ts - generic, reusable spreadsheet template
 * generation, data export, and header validation. Pairs with
 * `SpreadsheetUpload.tsx` to close the full loop:
 *
 *   1. `downloadSpreadsheetTemplate()` - give the teacher/staff a file
 *      with the correct headers already in place, so they can't
 *      accidentally rename or reorder columns.
 *   2. They fill it in and upload it back through `<SpreadsheetUpload />`.
 *   3. `validateSpreadsheetHeaders()` - before trusting the uploaded rows,
 *      confirm the headers still match what was expected (catches "the
 *      header got renamed/reordered/removed" instead of silently
 *      importing bad data).
 *   4. `exportDataToSpreadsheet()` - the same column config also works in
 *      reverse, for exporting whatever's already in the system.
 *
 * REUSABILITY & TYPE SAFETY: `SpreadsheetColumnDef<T>` is the one config
 * shape used by all three functions, for any data type `T`. `key` is
 * constrained to `Extract<keyof T, string>` - if you rename a field on
 * `T`, TypeScript will flag every column definition still referencing the
 * old key. Define the columns once per data type (students, staff,
 * grades, inventory...) and get template generation + export + header
 * validation for free.
 *
 * @example End-to-end workflow (template -> upload -> validate -> export)
 * ```tsx
 * interface StudentImportRow {
 *   firstName: string;
 *   lastName: string;
 *   admissionNo: string;
 *   dateOfBirth: string; // "YYYY-MM-DD"
 * }
 *
 * const studentColumns: SpreadsheetColumnDef<StudentImportRow>[] = [
 *   { key: "firstName", header: "First Name", required: true, example: "James" },
 *   { key: "lastName", header: "Last Name", required: true, example: "Doe" },
 *   { key: "admissionNo", header: "Admission No", required: true, example: "ADM/2026/001" },
 *   { key: "dateOfBirth", header: "Date of Birth", required: true, example: "2015-03-12", note: "Format: YYYY-MM-DD" },
 * ];
 * // TypeScript error if you typo a key, e.g. { key: "firstname", ... } - "firstname" isn't a key of StudentImportRow.
 *
 * function BulkImportStudentsPanel() {
 *   const [result, setResult] = useState<ParsedSpreadsheet | null>(null);
 *   const [headerError, setHeaderError] = useState<string | null>(null);
 *
 *   return (
 *     <div className="flex flex-col gap-3">
 *       <button
 *         onClick={() => downloadSpreadsheetTemplate({ fileName: "students-template.xlsx", columns: studentColumns })}
 *         className="text-xs font-semibold text-blue-600 hover:underline self-start"
 *       >
 *         Download template
 *       </button>
 *
 *       <SpreadsheetUpload
 *         onExtracted={(parsed) => {
 *           const check = validateSpreadsheetHeaders(parsed.headers, studentColumns);
 *           if (!check.valid) {
 *             setHeaderError(`Missing columns: ${check.missing.join(", ")}. Please use the downloaded template.`);
 *             return;
 *           }
 *           setHeaderError(null);
 *           setResult(parsed);
 *         }}
 *         classNames={{ dropzoneIcon: "bg-blue-100 text-blue-600" }}
 *       />
 *
 *       {headerError && <p className="text-xs text-red-600">{headerError}</p>}
 *
 *       {result && (
 *         <button
 *           onClick={() =>
 *             exportDataToSpreadsheet({
 *               fileName: "students-review.xlsx",
 *               columns: studentColumns,
 *               data: result.rows as unknown as StudentImportRow[],
 *             })
 *           }
 *         >
 *           Export for review
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Shared column definition - one config drives the template, the export,
 * and header validation for a given data shape `T`.
 *
 * `key` is constrained to an actual property name of `T` (not a bare
 * `string`), so renaming a field on `T` surfaces every column definition
 * that still points at the old name as a compile error, instead of
 * failing silently at runtime.
 */
export interface SpreadsheetColumnDef<T = Record<string, unknown>> {
  /** Must be a real key of `T` - used if you map exported rows back to `T` yourself. */
  key: Extract<keyof T, string>;
  /** Column header text - this is what actually appears in the spreadsheet. */
  header: string;
  /** Extracts this column's value from a real data row (used by `exportDataToSpreadsheet`). */
  value?: (item: T) => string | number | boolean | null | undefined;
  /** Sample value shown in the template's example row, so the format is obvious at a glance. */
  example?: string | number;
  /** Marks the column as required - listed as such on the template's instructions sheet. */
  required?: boolean;
  /** Short note about the expected format (e.g. "YYYY-MM-DD", "e.g. +255700000000") - shown on the instructions sheet. */
  note?: string;
}

// Widened to include `boolean` here (not just where `dataRows` is built)
// because this helper is shared with `exportDataToSpreadsheet`, whose rows
// can contain booleans coming from `SpreadsheetColumnDef.value()`.
function autoColumnWidths(rows: (string | number | boolean)[][]): { wch: number }[] {
  const colCount = rows[0]?.length ?? 0;
  const widths: number[] = Array(colCount).fill(8);
  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      if (len > widths[i]) widths[i] = Math.min(len + 2, 40);
    });
  }
  return widths.map((wch) => ({ wch }));
}

// ---------------------------------------------------------------------------
// 1. Template generation
// ---------------------------------------------------------------------------

export interface DownloadTemplateOptions<T> {
  columns: SpreadsheetColumnDef<T>[];
  /** Download filename, e.g. "students-template.xlsx". Default: "template.xlsx". */
  fileName?: string;
  /** Sheet name for the data tab. Default: "Data". */
  sheetName?: string;
  /** Include one example row under the headers so the expected format is obvious. Default: true. */
  includeExampleRow?: boolean;
  /** Add a second "Instructions" sheet listing each column, whether it's required, and its note. Default: true. */
  includeInstructions?: boolean;
}

/**
 * Generates and downloads a blank (or example-filled) spreadsheet with the
 * exact headers `columns` expects, in the exact order. Hand this to
 * whoever needs to fill in bulk data so they can't accidentally rename a
 * header, reorder columns, or add stray ones - the file you give them IS
 * the contract `validateSpreadsheetHeaders` checks against later.
 *
 * @example
 * ```ts
 * downloadSpreadsheetTemplate({
 *   fileName: "staff-template.xlsx",
 *   columns: staffColumns,
 *   includeExampleRow: true,
 * });
 * ```
 */
export function downloadSpreadsheetTemplate<T>({
  columns,
  fileName = "template.xlsx",
  sheetName = "Data",
  includeExampleRow = true,
  includeInstructions = true,
}: DownloadTemplateOptions<T>): void {
  const headerRow = columns.map((c) => c.header);
  const dataRows: (string | number)[][] = [headerRow];

  if (includeExampleRow) {
    dataRows.push(columns.map((c) => c.example ?? ""));
  }

  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
  dataSheet["!cols"] = autoColumnWidths(dataRows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, dataSheet, sheetName);

  if (includeInstructions) {
    const instructionRows: (string | number)[][] = [
      ["Column", "Required", "Notes"],
      ...columns.map((c) => [c.header, c.required ? "Yes" : "No", c.note ?? ""]),
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionRows);
    instructionsSheet["!cols"] = autoColumnWidths(instructionRows);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
  }

  XLSX.writeFile(workbook, fileName);
}

// ---------------------------------------------------------------------------
// 2. Header validation - closes the loop after the file comes back
// ---------------------------------------------------------------------------

export interface HeaderValidationResult {
  valid: boolean;
  /** Expected headers that are missing from the uploaded file. */
  missing: string[];
  /** Headers present in the uploaded file that weren't expected (renamed/extra columns, wrong template, etc.). */
  unexpected: string[];
}

/**
 * Compares the headers actually found in an uploaded file (from
 * `ParsedSpreadsheet.headers`) against the headers a set of
 * `SpreadsheetColumnDef`s expects. Call this right after
 * `<SpreadsheetUpload onExtracted={...} />` fires, before trusting the
 * rows.
 *
 * @example
 * ```ts
 * const check = validateSpreadsheetHeaders(parsed.headers, studentColumns);
 * if (!check.valid) {
 *   console.warn("Missing:", check.missing, "Unexpected:", check.unexpected);
 * }
 * ```
 */
export function validateSpreadsheetHeaders(
  uploadedHeaders: string[],
  columns: SpreadsheetColumnDef<any>[]
): HeaderValidationResult {
  const expected = columns.map((c) => c.header);
  const missing = expected.filter((h) => !uploadedHeaders.includes(h));
  const unexpected = uploadedHeaders.filter((h) => !expected.includes(h));
  return { valid: missing.length === 0, missing, unexpected };
}

// ---------------------------------------------------------------------------
// 3. Data export
// ---------------------------------------------------------------------------

export interface ExportDataOptions<T> {
  data: T[];
  columns: SpreadsheetColumnDef<T>[];
  /** Download filename. Default: "export.xlsx" (or "export.csv" for CSV format). */
  fileName?: string;
  sheetName?: string;
  /** "xlsx" (default) or "csv". */
  format?: "xlsx" | "csv";
}

/**
 * Exports real data to a downloadable spreadsheet using the SAME column
 * config that generated the import template (or any column config) -
 * headers stay identical between what you handed out and what you export
 * back out.
 *
 * @example
 * ```ts
 * exportDataToSpreadsheet({
 *   fileName: "students-2026.xlsx",
 *   columns: studentColumns,
 *   data: allStudents,
 * });
 * ```
 */
export function exportDataToSpreadsheet<T>({
  data,
  columns,
  fileName,
  sheetName = "Data",
  format = "xlsx",
}: ExportDataOptions<T>): void {
  const headerRow = columns.map((c) => c.header);
  // (string | number | boolean)[][] - matches SpreadsheetColumnDef.value()'s
  // return type; a plain (string | number)[][] annotation was rejecting
  // legitimate boolean cell values (e.g. a "verified" or "active" column).
  const rows: (string | number | boolean)[][] = [
    headerRow,
    ...data.map((item) => columns.map((c) => (c.value ? c.value(item) ?? "" : ""))),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = autoColumnWidths(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

  const resolvedFileName = fileName ?? (format === "csv" ? "export.csv" : "export.xlsx");
  XLSX.writeFile(workbook, resolvedFileName, format === "csv" ? { bookType: "csv" } : undefined);
}