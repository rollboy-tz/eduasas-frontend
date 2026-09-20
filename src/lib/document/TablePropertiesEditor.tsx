"use client";

import React from "react";
import { Plus, Minus, ArrowRightToLine, ArrowDownToLine } from "lucide-react";
import type { TableElement, TableCell, BindingField } from "./document-template.types";
import { TokenPickerDropdown } from "./TokenPickerDropdown";
import { cn } from "@/lib/utils/helper";

/**
 * @file TablePropertiesEditor.tsx - dedicated table controls: switch
 * between "data-bound" (rows come from an array field per record - used
 * for report cards) and "static" (rows are hand-typed and stored in the
 * template - used for fixed reference tables, fee schedules, etc), add/
 * remove rows and columns, per-column and per-cell text alignment,
 * column-width and row-height resizing, and adjacent-cell merging.
 *
 * MERGE SCOPE: "merge right" and "merge down" combine a cell with its
 * immediate neighbor only. A true Excel/Word-style merge (drag-select an
 * arbitrary rectangular range, then merge) needs a full grid-selection
 * model and is intentionally deferred - see README.md.
 */
export interface TablePropertiesEditorProps {
  element: TableElement;
  bindings: BindingField[];
  onUpdate: (patch: Partial<TableElement>) => void;
}

export function TablePropertiesEditor({ element, bindings, onUpdate }: TablePropertiesEditorProps) {
  const rows = element.staticRows ?? [];
  const rowHeights = element.rowHeightsMm ?? [];

  function addColumn() {
    const columns = [...element.columns, { header: `Col ${element.columns.length + 1}`, field: `col${element.columns.length + 1}`, weight: 1 }];
    const staticRows = rows.map((r) => [...r, { text: "" } as TableCell]);
    onUpdate({ columns, staticRows });
  }

  function removeColumn(index: number) {
    if (element.columns.length <= 1) return;
    onUpdate({
      columns: element.columns.filter((_, i) => i !== index),
      staticRows: rows.map((r) => r.filter((_, i) => i !== index)),
    });
  }

  function addRow() {
    const newRow: TableCell[] = element.columns.map(() => ({ text: "" }));
    onUpdate({ staticRows: [...rows, newRow], rowHeightsMm: [...rowHeights, 10] });
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onUpdate({ staticRows: rows.filter((_, i) => i !== index), rowHeightsMm: rowHeights.filter((_, i) => i !== index) });
  }

  function updateCell(r: number, c: number, patch: Partial<TableCell>) {
    const next = rows.map((row) => [...row]);
    next[r][c] = { ...next[r][c], ...patch };
    onUpdate({ staticRows: next });
  }

  function mergeRight(r: number, c: number) {
    const next = rows.map((row) => [...row]);
    const cell = next[r][c];
    const rightCell = next[r][c + 1];
    if (!rightCell || rightCell.merged) return;
    next[r][c] = { ...cell, colSpan: (cell.colSpan ?? 1) + (rightCell.colSpan ?? 1) };
    next[r][c + 1] = { ...rightCell, merged: true };
    onUpdate({ staticRows: next });
  }

  function mergeDown(r: number, c: number) {
    if (r + 1 >= rows.length) return;
    const next = rows.map((row) => [...row]);
    const cell = next[r][c];
    const belowCell = next[r + 1][c];
    if (!belowCell || belowCell.merged) return;
    next[r][c] = { ...cell, rowSpan: (cell.rowSpan ?? 1) + (belowCell.rowSpan ?? 1) };
    next[r + 1][c] = { ...belowCell, merged: true };
    onUpdate({ staticRows: next });
  }

  function resizeColumnWeight(index: number, weight: number) {
    onUpdate({ columns: element.columns.map((c, i) => (i === index ? { ...c, weight: Math.max(0.2, weight) } : c)) });
  }

  function resizeRowHeight(index: number, height: number) {
    onUpdate({ rowHeightsMm: rowHeights.map((h, i) => (i === index ? Math.max(4, height) : h)) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <ModeButton active={element.mode === "data-bound"} onClick={() => onUpdate({ mode: "data-bound" })}>
          Data-bound
        </ModeButton>
        <ModeButton active={element.mode === "static"} onClick={() => onUpdate({ mode: "static" })}>
          Static
        </ModeButton>
      </div>

      {element.mode === "data-bound" ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Bound to</label>
          <div className="flex items-center gap-2">
            <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{element.dataBinding || "(none)"}</code>
            <TokenPickerDropdown bindings={bindings} filterKind="array" onInsert={(token) => onUpdate({ dataBinding: token })} label="Change" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Rows ({rows.length})</span>
          <div className="flex gap-1">
            <IconButton onClick={addRow} label="Add row">
              <Plus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton onClick={() => removeRow(rows.length - 1)} label="Remove last row">
              <Minus className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Columns ({element.columns.length})</span>
        <div className="flex gap-1">
          <IconButton onClick={addColumn} label="Add column">
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton onClick={() => removeColumn(element.columns.length - 1)} label="Remove last column">
            <Minus className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {element.columns.map((col, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={col.header}
              onChange={(e) => onUpdate({ columns: element.columns.map((c, ci) => (ci === i ? { ...c, header: e.target.value } : c)) })}
              className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
              placeholder="Header"
            />
            <select
              value={col.align ?? "left"}
              onChange={(e) => onUpdate({ columns: element.columns.map((c, ci) => (ci === i ? { ...c, align: e.target.value as "left" | "center" | "right" } : c)) })}
              className="rounded border border-slate-200 px-1 py-1 text-xs"
              title="Column alignment"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <input
              type="number"
              min={0.2}
              step={0.5}
              value={col.weight}
              onChange={(e) => resizeColumnWeight(i, Number(e.target.value))}
              className="w-14 rounded border border-slate-200 px-1 py-1 text-xs"
              title="Relative column width"
            />
          </div>
        ))}
      </div>

      {element.mode === "static" && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-600">Cells</span>
          {rows.map((row, r) => (
            <div key={r} className="flex flex-col gap-1.5 rounded-md border border-slate-100 p-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Row {r + 1}</span>
                <input
                  type="number"
                  min={4}
                  value={rowHeights[r] ?? 10}
                  onChange={(e) => resizeRowHeight(r, Number(e.target.value))}
                  className="w-14 rounded border border-slate-200 px-1 py-0.5 text-[10px]"
                  title="Row height (mm)"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {row.map((cell, c) =>
                  cell.merged ? null : (
                    <div key={c} className="flex items-center gap-1">
                      <input
                        value={cell.text}
                        onChange={(e) => updateCell(r, c, { text: e.target.value })}
                        className="w-24 rounded border border-slate-200 px-1.5 py-1 text-xs"
                        placeholder={`R${r + 1}C${c + 1}`}
                      />
                      <select
                        value={cell.align ?? "left"}
                        onChange={(e) => updateCell(r, c, { align: e.target.value as "left" | "center" | "right" })}
                        className="rounded border border-slate-200 text-[10px]"
                        title="Cell alignment"
                      >
                        <option value="left">L</option>
                        <option value="center">C</option>
                        <option value="right">R</option>
                      </select>
                      {c < row.length - 1 && !row[c + 1]?.merged && (
                        <IconButton onClick={() => mergeRight(r, c)} label="Merge right">
                          <ArrowRightToLine className="h-3 w-3" />
                        </IconButton>
                      )}
                      {r < rows.length - 1 && !rows[r + 1]?.[c]?.merged && (
                        <IconButton onClick={() => mergeDown(r, c)} label="Merge down">
                          <ArrowDownToLine className="h-3 w-3" />
                        </IconButton>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-slate-400">
            Merge combines a cell with its immediate right/below neighbor only - not an arbitrary rectangular range.
          </p>
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50">
      {children}
    </button>
  );
}