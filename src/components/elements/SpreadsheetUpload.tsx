"use client";

import React, { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/helper";

/**
 * @file SpreadsheetUpload - a generic, reusable drag-and-drop / click-to-
 * browse file input that extracts tabular data from ANY spreadsheet file
 * (CSV, XLSX, XLS) using a single parsing library (SheetJS/`xlsx`, which
 * reads all three formats through one API - no separate CSV parser needed).
 *
 * REUSABILITY: makes NO assumptions about what the data represents. It
 * returns raw `headers` (from the first row) and `rows`
 * (`Record<string, string>[]`) via `onExtracted` - you decide how to map
 * those columns to whatever domain object you need (students, staff,
 * inventory, grades, anything tabular). Pair it with `spreadsheet-io.ts`
 * (`downloadSpreadsheetTemplate` + `validateSpreadsheetHeaders`) for a
 * full "give them a template -> they fill it -> validate what comes back"
 * workflow.
 *
 * CUSTOMIZING THE LOOK: every visual piece (dropzone border/background,
 * icon colors, the "file selected" card, success/error banners, the
 * preview table) can be restyled without editing this file - see
 * `SpreadsheetUploadClassNames` and the theming example below. Nothing is
 * hardcoded to one brand color; the defaults just use a neutral
 * slate/blue palette so it looks reasonable out of the box.
 *
 * REQUIRES: `npm install xlsx` (SheetJS).
 *
 * @example Basic usage
 * ```tsx
 * function BulkImportStudents() {
 *   return (
 *     <SpreadsheetUpload
 *       maxSizeMB={5}
 *       onExtracted={(result) => {
 *         // result.headers: string[]
 *         // result.rows: Record<string, string>[]
 *         saveStudents(result.rows);
 *       }}
 *       onError={(message) => toast.show({ message, type: "error" })}
 *     />
 *   );
 * }
 * ```
 *
 * @example Custom theme (a different brand color, no code changes to this file)
 * ```tsx
 * <SpreadsheetUpload
 *   onExtracted={handleExtracted}
 *   icon={UploadCloud} // swap the default icon if you want
 *   classNames={{
 *     dropzone: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
 *     dropzoneActive: "border-purple-500 bg-purple-50",
 *     dropzoneIcon: "bg-purple-100 text-purple-600",
 *     fileCard: "border-purple-100 bg-purple-50/40",
 *     fileIcon: "bg-purple-100 text-purple-600",
 *     successBanner: "bg-emerald-50 border-emerald-100 text-emerald-700",
 *     errorBanner: "bg-rose-50 border-rose-100 text-rose-700",
 *   }}
 * />
 * ```
 *
 * @example Custom preview rendering (replace the built-in table entirely)
 * ```tsx
 * <SpreadsheetUpload
 *   onExtracted={setResult}
 *   showPreview={false} // turn off the built-in table
 * />
 * {result && <MyOwnPreviewGrid headers={result.headers} rows={result.rows} />}
 * ```
 */

/** Result of successfully parsing a spreadsheet - format-agnostic (CSV/XLSX/XLS all normalize to this shape). */
export interface ParsedSpreadsheet {
  fileName: string;
  /** All sheet names in the workbook (CSV files always have exactly one, named "Sheet1"). */
  sheetNames: string[];
  /** The sheet that produced `rows`/`headers` below. */
  activeSheet: string;
  /** Column names, taken from the first row of the active sheet. */
  headers: string[];
  /** One object per data row, keyed by `headers`. Every value is a string. */
  rows: Record<string, string>[];
}

/**
 * Every stylable region of the component. All optional - unset keys fall
 * back to the default slate/blue look. Each value is appended (via `cn`)
 * to the element's base classes, so you can override colors/borders
 * without needing to know or repeat the base layout classes.
 */
export interface SpreadsheetUploadClassNames {
  /** Outer wrapper around the whole component. */
  root?: string;
  /** The dropzone box in its resting/idle state. */
  dropzone?: string;
  /** Applied to the dropzone in addition to `dropzone` while a file is being dragged over it. */
  dropzoneActive?: string;
  /** The circular icon badge inside the dropzone. */
  dropzoneIcon?: string;
  /** The "file selected" card shown once a file has been picked. */
  fileCard?: string;
  /** The icon badge inside the file card. */
  fileIcon?: string;
  /** The success banner shown after a sheet is parsed. */
  successBanner?: string;
  /** The error banner shown on validation/parse failure. */
  errorBanner?: string;
  /** The `<select>` used to switch sheets in multi-sheet workbooks. */
  sheetSelector?: string;
  /** Wrapper around the built-in preview table. */
  previewTable?: string;
}

export interface SpreadsheetUploadProps {
  /** Called once a sheet has been successfully parsed (fires again if the user switches sheets). */
  onExtracted: (result: ParsedSpreadsheet) => void;
  onError?: (message: string) => void;
  /** File picker accept filter. Default: CSV + Excel. */
  accept?: string;
  /** Max file size in MB before rejecting the upload. Default: 5. */
  maxSizeMB?: number;
  /** Show a small preview table of the first few extracted rows. Default: true. */
  showPreview?: boolean;
  /** How many preview rows to render. Default: 5. */
  previewRowCount?: number;
  /** Icon shown in the dropzone. Default: `UploadCloud` (lucide-react). */
  icon?: LucideIcon;
  /** Per-region style overrides - see `SpreadsheetUploadClassNames`. */
  classNames?: SpreadsheetUploadClassNames;
  className?: string;
}

const DEFAULT_ACCEPT = ".csv,.xlsx,.xls";
const ALLOWED_EXTENSIONS = ["csv", "xlsx", "xls"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

function isAllowedExtension(ext: string): ext is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

type Status = "idle" | "parsing" | "success" | "error";

export function SpreadsheetUpload({
  onExtracted,
  onError,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 5,
  showPreview = true,
  previewRowCount = 5,
  icon: Icon = UploadCloud,
  classNames,
  className,
}: SpreadsheetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedSpreadsheet | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  function reset() {
    setFile(null);
    setStatus("idle");
    setError(null);
    setResult(null);
    setWorkbook(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function fail(message: string) {
    setStatus("error");
    setError(message);
    onError?.(message);
  }

  function extractSheet(wb: XLSX.WorkBook, sheetName: string, fileName: string) {
    const worksheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "", raw: false });

    if (rows.length === 0) {
      fail(`"${sheetName}" has no data rows.`);
      return;
    }

    const headers = Object.keys(rows[0]);
    const parsed: ParsedSpreadsheet = { fileName, sheetNames: wb.SheetNames, activeSheet: sheetName, headers, rows };
    setResult(parsed);
    setStatus("success");
    setError(null);
    onExtracted(parsed);
  }

  function processFile(candidate: File) {
    setError(null);
    const ext = candidate.name.split(".").pop()?.toLowerCase() ?? "";

    if (!isAllowedExtension(ext)) {
      fail(`Unsupported file type ".${ext}". Please upload a CSV or Excel (.xlsx/.xls) file.`);
      return;
    }
    if (candidate.size > maxSizeMB * 1024 * 1024) {
      fail(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    setFile(candidate);
    setStatus("parsing");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer || typeof buffer === "string") throw new Error("Could not read file.");
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
        if (wb.SheetNames.length === 0) throw new Error("This workbook has no sheets.");
        setWorkbook(wb);
        extractSheet(wb, wb.SheetNames[0], candidate.name);
      } catch (err) {
        fail(err instanceof Error ? err.message : "Could not parse this file. Make sure it's a valid spreadsheet.");
      }
    };
    reader.onerror = () => fail("Could not read the selected file.");
    reader.readAsArrayBuffer(candidate);
  }

  function handleSheetChange(sheetName: string) {
    if (!workbook || !file) return;
    extractSheet(workbook, sheetName, file.name);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDropzone = status === "idle" || status === "error";

  return (
    <div className={cn("flex flex-col gap-3", classNames?.root, className)}>
      <AnimatePresence mode="wait" initial={false}>
        {showDropzone ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              isDragging
                ? cn("border-blue-400 bg-blue-50", classNames?.dropzoneActive)
                : cn("border-slate-200 hover:border-blue-300 hover:bg-slate-50", classNames?.dropzone)
            )}
          >
            <motion.div
              animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
              transition={{ duration: 0.15 }}
              className={cn("rounded-full bg-blue-100 p-3", classNames?.dropzoneIcon)}
            >
              <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </motion.div>
            <p className="text-sm font-semibold text-slate-900">Drop a spreadsheet here, or click to browse</p>
            <p className="text-xs text-slate-500">Supports CSV, XLSX, XLS - up to {maxSizeMB}MB</p>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-card"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={cn("flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4", classNames?.fileCard)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("shrink-0 rounded-lg bg-blue-100 p-2", classNames?.fileIcon)}>
                {status === "parsing" ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" aria-hidden="true" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{file?.name}</p>
                <p className="text-xs text-slate-500">
                  {status === "parsing" ? "Reading file..." : file ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Remove file"
              className="shrink-0 rounded-full p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className={cn("flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-700", classNames?.errorBanner)}>
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "success" && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden flex flex-col gap-2"
          >
            <div className={cn("flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2.5 text-xs text-green-700", classNames?.successBanner)}>
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Extracted {result.rows.length} row{result.rows.length === 1 ? "" : "s"} across {result.headers.length} column
              {result.headers.length === 1 ? "" : "s"}.
            </div>

            {result.sheetNames.length > 1 && (
              <label className="flex items-center gap-2 text-xs text-slate-600">
                Sheet:
                <select
                  value={result.activeSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className={cn(
                    "rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    classNames?.sheetSelector
                  )}
                >
                  {result.sheetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {showPreview && (
              <SpreadsheetPreview result={result} rowCount={previewRowCount} className={classNames?.previewTable} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpreadsheetPreview({
  result,
  rowCount,
  className,
}: {
  result: ParsedSpreadsheet;
  rowCount: number;
  className?: string;
}) {
  const previewRows = result.rows.slice(0, rowCount);
  const remaining = result.rows.length - previewRows.length;

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {result.headers.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {previewRows.map((row, i) => (
            <tr key={i}>
              {result.headers.map((h) => (
                <td key={h} className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-[160px] truncate">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {remaining > 0 && (
        <p className="px-3 py-2 text-[11px] text-slate-400 border-t border-slate-100">
          + {remaining} more row{remaining === 1 ? "" : "s"} not shown
        </p>
      )}
    </div>
  );
}