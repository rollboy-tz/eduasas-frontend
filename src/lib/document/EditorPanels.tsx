"use client";

import React, { useRef } from "react";
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Minus as LineIcon,
  Table as TableIcon,
  Trash2,
  Copy,
  ArrowUpToLine,
  ArrowDownToLine,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/helper";
import type { DocElement, DocElementType, ShapeKind, BindingField } from "./document-template.types";
import { TokenPickerDropdown } from "./TokenPickerDropdown";
import { TablePropertiesEditor } from "./TablePropertiesEditor";

/**
 * @file EditorPanels.tsx - Toolbox (add elements), PropertiesPanel (edit
 * the selected element - dispatches per element type, table delegates to
 * `TablePropertiesEditor`), and LayersPanel (list/reorder/duplicate/
 * delete). Kept in one file since they're small and always used together.
 */

const INPUT_CLASS = "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

// ---------------------------------------------------------------------------
// Toolbox
// ---------------------------------------------------------------------------

export interface ToolboxProps {
  onAdd: (type: DocElementType, shape?: ShapeKind) => void;
  className?: string;
}

export function Toolbox({ onAdd, className }: ToolboxProps) {
  const items: { label: string; icon: React.ReactNode; onClick: () => void }[] = [
    { label: "Text", icon: <Type className="h-4 w-4" />, onClick: () => onAdd("text") },
    { label: "Image", icon: <ImageIcon className="h-4 w-4" />, onClick: () => onAdd("image") },
    { label: "Rectangle", icon: <Square className="h-4 w-4" />, onClick: () => onAdd("shape", "rectangle") },
    { label: "Ellipse", icon: <Circle className="h-4 w-4" />, onClick: () => onAdd("shape", "ellipse") },
    { label: "Triangle", icon: <Triangle className="h-4 w-4" />, onClick: () => onAdd("shape", "triangle") },
    { label: "Line", icon: <LineIcon className="h-4 w-4" />, onClick: () => onAdd("line") },
    { label: "Table", icon: <TableIcon className="h-4 w-4" />, onClick: () => onAdd("table") },
  ];

  return (
    <div className={cn("grid grid-cols-3 lg:grid-cols-2 gap-2", className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white py-3 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Properties Panel
// ---------------------------------------------------------------------------

export interface PropertiesPanelProps {
  element: DocElement | null;
  bindings: BindingField[];
  onUpdate: (patch: Partial<DocElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  className?: string;
}

export function PropertiesPanel({ element, bindings, onUpdate, onDelete, onDuplicate, onBringToFront, onSendToBack, className }: PropertiesPanelProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);

  if (!element) {
    return <div className={cn("text-xs text-slate-400 p-3", className)}>Select an element to edit its properties.</div>;
  }

  function insertTokenAtCursor(token: string) {
    if (element!.type !== "text") return;
    const el = contentRef.current;
    const current = (element as any).content as string;
    if (!el) {
      onUpdate({ content: current + token } as Partial<DocElement>);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    onUpdate({ content: next } as Partial<DocElement>);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{element.type}</span>
        <div className="flex gap-1">
          <IconBtn label="Duplicate" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Bring to front" onClick={onBringToFront}>
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Send to back" onClick={onSendToBack}>
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Delete" onClick={onDelete} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>

      <PositionFields element={element} onUpdate={onUpdate} />

      {element.type === "text" && (
        <>
          <Field label="Content">
            <textarea
              ref={contentRef}
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value } as Partial<DocElement>)}
              rows={3}
              className={cn(INPUT_CLASS, "resize-none")}
            />
            <TokenPickerDropdown bindings={bindings} filterKind="text" onInsert={insertTokenAtCursor} className="mt-1.5" />
          </Field>

          <Field label="Font">
            <div className="flex gap-1.5">
              <select value={element.fontFamily} onChange={(e) => onUpdate({ fontFamily: e.target.value as any } as Partial<DocElement>)} className={INPUT_CLASS}>
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
              <input
                type="number"
                min={6}
                max={72}
                value={element.fontSize}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) } as Partial<DocElement>)}
                className={cn(INPUT_CLASS, "w-16")}
              />
            </div>
          </Field>

          <Field label="Color">
            <input type="color" value={element.color} onChange={(e) => onUpdate({ color: e.target.value } as Partial<DocElement>)} className="h-8 w-14 rounded border border-slate-200" />
          </Field>

          <Field label="Line height">
            <input
              type="number"
              min={0.8}
              max={3}
              step={0.1}
              value={element.lineHeight}
              onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) } as Partial<DocElement>)}
              className={cn(INPUT_CLASS, "w-20")}
            />
          </Field>
        </>
      )}

      {element.type === "image" && (
        <>
          <Field label="Source">
            <div className="flex items-center gap-1.5">
              <input value={element.src} onChange={(e) => onUpdate({ src: e.target.value } as Partial<DocElement>)} className={INPUT_CLASS} placeholder="https:// or {{token}}" />
              <ImageUploadButton onUpload={(dataUrl) => onUpdate({ src: dataUrl } as Partial<DocElement>)} />
            </div>
            <TokenPickerDropdown bindings={bindings} filterKind="image" onInsert={(token) => onUpdate({ src: token } as Partial<DocElement>)} className="mt-1.5" />
          </Field>
          <Field label="Fit">
            <select value={element.fit} onChange={(e) => onUpdate({ fit: e.target.value as any } as Partial<DocElement>)} className={INPUT_CLASS}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </Field>
          <Field label="Corner radius (mm)">
            <input
              type="number"
              min={0}
              value={element.borderRadius}
              onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) } as Partial<DocElement>)}
              className={cn(INPUT_CLASS, "w-20")}
            />
          </Field>
        </>
      )}

      {element.type === "shape" && (
        <>
          <Field label="Fill">
            <FillEditor fill={element.fill} onChange={(fill) => onUpdate({ fill } as Partial<DocElement>)} />
          </Field>
          {element.shape !== "triangle" && (
            <>
              <Field label="Border">
                <div className="flex items-center gap-1.5">
                  <input type="color" value={element.borderColor ?? "#cbd5e1"} onChange={(e) => onUpdate({ borderColor: e.target.value } as Partial<DocElement>)} className="h-8 w-10 rounded border border-slate-200" />
                  <input
                    type="number"
                    min={0}
                    value={element.borderWidth ?? 0}
                    onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) } as Partial<DocElement>)}
                    className={cn(INPUT_CLASS, "w-16")}
                    title="Border width (px)"
                  />
                </div>
              </Field>
              {element.shape === "rectangle" && (
                <Field label="Corner radius (mm)">
                  <input
                    type="number"
                    min={0}
                    value={element.borderRadius ?? 0}
                    onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) } as Partial<DocElement>)}
                    className={cn(INPUT_CLASS, "w-20")}
                  />
                </Field>
              )}
            </>
          )}
        </>
      )}

      {element.type === "line" && (
        <>
          <Field label="Color">
            <input type="color" value={element.color} onChange={(e) => onUpdate({ color: e.target.value } as Partial<DocElement>)} className="h-8 w-14 rounded border border-slate-200" />
          </Field>
          <Field label="Thickness (px)">
            <input type="number" min={1} value={element.thickness} onChange={(e) => onUpdate({ thickness: Number(e.target.value) } as Partial<DocElement>)} className={cn(INPUT_CLASS, "w-20")} />
          </Field>
          <Field label="Length / width (mm)">
            <input type="number" min={1} value={element.width} onChange={(e) => onUpdate({ width: Number(e.target.value) } as Partial<DocElement>)} className={cn(INPUT_CLASS, "w-20")} />
          </Field>
          <Field label="Style">
            <div className="flex gap-1.5">
              {(["solid", "dashed", "dotted"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdate({ style: s } as Partial<DocElement>)}
                  className={cn("rounded-md border px-2.5 py-1 text-xs capitalize transition-colors", element.style === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {element.type === "table" && <TablePropertiesEditor element={element} bindings={bindings} onUpdate={(patch) => onUpdate(patch as Partial<DocElement>)} />}
    </div>
  );
}

function PositionFields({ element, onUpdate }: { element: DocElement; onUpdate: (patch: Partial<DocElement>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberField label="X (mm)" value={element.x} onChange={(v) => onUpdate({ x: v })} />
      <NumberField label="Y (mm)" value={element.y} onChange={(v) => onUpdate({ y: v })} />
      <NumberField label="Width (mm)" value={element.width} onChange={(v) => onUpdate({ width: v })} />
      <NumberField label="Height (mm)" value={element.height} onChange={(v) => onUpdate({ height: v })} />
      <NumberField label="Rotation (deg)" value={element.rotation} onChange={(v) => onUpdate({ rotation: ((v % 360) + 360) % 360 })} className="col-span-2" />
    </div>
  );
}

function FillEditor({ fill, onChange }: { fill: import("./document-template.types").FillPaint; onChange: (fill: import("./document-template.types").FillPaint) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ kind: "solid", color: fill.kind === "solid" ? fill.color : "#e2e8f0" })}
          className={cn("flex-1 rounded-md border px-2.5 py-1 text-xs transition-colors", fill.kind === "solid" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
        >
          Solid
        </button>
        <button
          type="button"
          onClick={() => onChange(fill.kind === "gradient" ? fill : { kind: "gradient", from: "#2563eb", to: "#60a5fa", angle: 90 })}
          className={cn("flex-1 rounded-md border px-2.5 py-1 text-xs transition-colors", fill.kind === "gradient" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
        >
          Gradient
        </button>
      </div>

      {fill.kind === "solid" ? (
        <input type="color" value={fill.color} onChange={(e) => onChange({ kind: "solid", color: e.target.value })} className="h-8 w-14 rounded border border-slate-200" />
      ) : (
        <div className="flex items-center gap-1.5">
          <input type="color" value={fill.from} onChange={(e) => onChange({ ...fill, from: e.target.value })} className="h-8 w-10 rounded border border-slate-200" title="From" />
          <input type="color" value={fill.to} onChange={(e) => onChange({ ...fill, to: e.target.value })} className="h-8 w-10 rounded border border-slate-200" title="To" />
          <input
            type="number"
            min={0}
            max={360}
            value={fill.angle}
            onChange={(e) => onChange({ ...fill, angle: Number(e.target.value) })}
            className={cn(INPUT_CLASS, "w-16")}
            title="Angle (deg)"
          />
        </div>
      )}
    </div>
  );
}

function ImageUploadButton({ onUpload }: { onUpload: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Upload image"
        className="shrink-0 grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
      >
        <Upload className="h-3.5 w-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") onUpload(reader.result);
          };
          reader.readAsDataURL(file);
        }}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, className }: { label: string; value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] text-slate-400">{label}</span>
      <input type="number" value={Math.round(value * 10) / 10} onChange={(e) => onChange(Number(e.target.value))} className={INPUT_CLASS} />
    </label>
  );
}

function IconBtn({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", danger ? "text-red-500 hover:bg-red-50" : "text-slate-500 hover:bg-slate-100")}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Layers Panel
// ---------------------------------------------------------------------------

export interface LayersPanelProps {
  elements: DocElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const TYPE_LABEL: Record<DocElementType, string> = {
  text: "Text",
  image: "Image",
  shape: "Shape",
  line: "Line",
  table: "Table",
};

export function LayersPanel({ elements, selectedId, onSelect, onMoveUp, onMoveDown, onDelete, className }: LayersPanelProps) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  if (sorted.length === 0) {
    return <div className={cn("text-xs text-slate-400 p-3", className)}>No elements yet - add one from the toolbox.</div>;
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {sorted.map((el) => (
        <div
          key={el.id}
          onClick={() => onSelect(el.id)}
          className={cn(
            "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer transition-colors",
            el.id === selectedId ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <span className="truncate">
            {TYPE_LABEL[el.type]}
            {el.type === "text" ? ` - ${el.content.slice(0, 16)}` : ""}
          </span>
          <div className="flex shrink-0 gap-0.5">
            <IconBtn label="Move up" onClick={() => onMoveUp(el.id)}>
              <ChevronUp className="h-3 w-3" />
            </IconBtn>
            <IconBtn label="Move down" onClick={() => onMoveDown(el.id)}>
              <ChevronDown className="h-3 w-3" />
            </IconBtn>
            <IconBtn label="Delete" onClick={() => onDelete(el.id)} danger>
              <Trash2 className="h-3 w-3" />
            </IconBtn>
          </div>
        </div>
      ))}
    </div>
  );
}