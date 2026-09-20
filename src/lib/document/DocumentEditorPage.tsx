
"use client";

import React, { useCallback, useState } from "react";
import { Save, Printer, Eye, EyeOff, Ruler as RulerIcon, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import type { DocElement, DocElementType, DocumentTemplate, ShapeKind } from "./document-template.types";
import { createElement, createBlankTemplate } from "./document-template.types";
import { DocumentCanvas } from "./DocumentCanvas";
import { Toolbox, PropertiesPanel, LayersPanel } from "./EditorPanels";
import { REPORT_CARD_BINDINGS, REPORT_CARD_SAMPLE_DATA } from "./report-card-bindings";
import { renderDocumentTemplate } from "./renderDocumentTemplate";
//import { printDocumentTemplate } from "./print-and-export";

/**
 * @file DocumentEditorPage.tsx - the top-level editor: toolbar (name,
 * page size/orientation, rulers/margins toggles, Preview/Print/Save),
 * Toolbox + Layers on the left, canvas in the center, Properties on the
 * right. Fully responsive: on `lg+` all three columns sit side by side;
 * below that it collapses into a tab switcher (Canvas / Elements /
 * Properties) so nothing gets cramped on a phone.
 *
 * SAVE vs PRINT (kept genuinely separate, as requested):
 * - `onSave(template)` - you decide what happens with the `DocumentTemplate`
 *   JSON (persist to a database, local draft, etc). This is the reusable
 *   artifact.
 * - "Print" button - calls `printDocumentTemplate` (see print-and-export.ts),
 *   which renders the CURRENT template against `previewData` and opens
 *   the browser print dialog immediately, without requiring a save first.
 * Both paths work off the same in-memory `template` state, so either can
 * be used at any point while editing.
 */

export interface DocumentEditorPageProps {
  initialTemplate?: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void | Promise<void>;
  /** Data used to preview/print `{{bindings}}` against. Defaults to the report-card sample data. */
  previewData?: Record<string, unknown>;
  className?: string;
}

type MobileTab = "canvas" | "elements" | "properties";

function newId(): string {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function DocumentEditorPage({ initialTemplate, onSave, previewData, className }: DocumentEditorPageProps) {
  const [template, setTemplate] = useState<DocumentTemplate>(initialTemplate ?? createBlankTemplate("Untitled template", "report-card"));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRulers, setShowRulers] = useState(true);
  const [showMargins, setShowMargins] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");

  // Only "report-card" has a real binding set wired up in this pass (see
  // report-card-bindings.ts) - other kinds fall back to an empty list
  // rather than pretending bindings exist. Add a matching *-bindings.ts
  // file per kind as those features are built out.
  const bindings = template.kind === "report-card" ? REPORT_CARD_BINDINGS : [];
  const data = previewData ?? REPORT_CARD_SAMPLE_DATA;
  const selectedElement = template.elements.find((e) => e.id === selectedId) ?? null;

  const patchTemplate = useCallback((patch: Partial<DocumentTemplate>) => {
    setTemplate((t) => ({ ...t, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const updateElement = useCallback((id: string, patch: Partial<DocElement>) => {
    setTemplate((t) => ({
      ...t,
      elements: t.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as DocElement) : el)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  function addElement(type: DocElementType, shape?: ShapeKind) {
    const zIndex = Math.max(0, ...template.elements.map((e) => e.zIndex)) + 1;
    const el = createElement(type, 20, 20, zIndex, shape);
    patchTemplate({ elements: [...template.elements, el] });
    setSelectedId(el.id);
    setMobileTab("properties");
  }

  function deleteElement(id: string) {
    patchTemplate({ elements: template.elements.filter((e) => e.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateElement(id: string) {
    const el = template.elements.find((e) => e.id === id);
    if (!el) return;
    const zIndex = Math.max(0, ...template.elements.map((e) => e.zIndex)) + 1;
    const copy: DocElement = { ...el, id: newId(), x: el.x + 5, y: el.y + 5, zIndex };
    patchTemplate({ elements: [...template.elements, copy] });
    setSelectedId(copy.id);
  }

  function bringToFront(id: string) {
    const maxZ = Math.max(0, ...template.elements.map((e) => e.zIndex));
    updateElement(id, { zIndex: maxZ + 1 });
  }

  function sendToBack(id: string) {
    const minZ = Math.min(0, ...template.elements.map((e) => e.zIndex));
    updateElement(id, { zIndex: minZ - 1 });
  }

  function moveLayer(id: string, direction: "up" | "down") {
    const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((e) => e.id === id);
    const swapIndex = direction === "up" ? index + 1 : index - 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swapIndex];
    patchTemplate({
      elements: template.elements.map((e) => {
        if (e.id === a.id) return { ...e, zIndex: b.zIndex };
        if (e.id === b.id) return { ...e, zIndex: a.zIndex };
        return e;
      }),
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(template);
    } finally {
      setIsSaving(false);
    }
  }

  function handlePrint() {
    console.log(template, data)
    // printDocumentTemplate(template, data);
  }

  const previewHtml = previewMode ? renderDocumentTemplate(template, data) : null;

  return (
    <div className={cn("flex h-full min-h-[640px] flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden", className)}>
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 sm:px-4">
        <input
          value={template.name}
          onChange={(e) => patchTemplate({ name: e.target.value })}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          placeholder="Template name"
        />

        <select
          value={template.page.size}
          onChange={(e) => patchTemplate({ page: { ...template.page, size: e.target.value as "A4" | "Letter" } })}
          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>

        <select
          value={template.page.orientation}
          onChange={(e) => patchTemplate({ page: { ...template.page, orientation: e.target.value as "portrait" | "landscape" } })}
          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>

        <TopBarToggle active={showRulers} onClick={() => setShowRulers((v) => !v)} label="Toggle rulers">
          <RulerIcon className="h-3.5 w-3.5" />
        </TopBarToggle>
        <TopBarToggle active={showMargins} onClick={() => setShowMargins((v) => !v)} label="Toggle margin guide">
          <LayoutTemplate className="h-3.5 w-3.5" />
        </TopBarToggle>
        <TopBarToggle active={previewMode} onClick={() => setPreviewMode((v) => !v)} label={previewMode ? "Back to editing" : "Preview rendered output"}>
          {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </TopBarToggle>

        <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <Printer className="h-3.5 w-3.5" /> Print
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border-b border-slate-200">
        {(["canvas", "elements", "properties"] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-semibold capitalize transition-colors border-b-2",
              mobileTab === tab ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className={cn("w-full lg:w-64 shrink-0 lg:border-r border-slate-200 overflow-y-auto p-3 flex-col gap-5", mobileTab === "elements" ? "flex" : "hidden lg:flex")}>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Add element</h3>
            <Toolbox onAdd={addElement} />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Layers</h3>
            <LayersPanel
              elements={template.elements}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setMobileTab("properties");
              }}
              onMoveUp={(id) => moveLayer(id, "up")}
              onMoveDown={(id) => moveLayer(id, "down")}
              onDelete={deleteElement}
            />
          </div>
        </div>

        <div className={cn("flex-1 min-w-0 min-h-0 overflow-auto p-3 sm:p-4", mobileTab === "canvas" ? "block" : "hidden lg:block")}>
          {previewMode && previewHtml ? (
            <iframe title="Template preview" srcDoc={previewHtml} className="h-full min-h-[500px] w-full rounded-xl border border-slate-200 bg-white" />
          ) : (
            <DocumentCanvas
              template={template}
              previewData={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={updateElement}
              showRulers={showRulers}
              showMargins={showMargins}
              className="h-full"
            />
          )}
        </div>

        <div className={cn("w-full lg:w-72 shrink-0 lg:border-l border-slate-200 overflow-y-auto p-3", mobileTab === "properties" ? "block" : "hidden lg:block")}>
          <PropertiesPanel
            element={selectedElement}
            bindings={bindings}
            onUpdate={(patch) => selectedElement && updateElement(selectedElement.id, patch)}
            onDelete={() => selectedElement && deleteElement(selectedElement.id)}
            onDuplicate={() => selectedElement && duplicateElement(selectedElement.id)}
            onBringToFront={() => selectedElement && bringToFront(selectedElement.id)}
            onSendToBack={() => selectedElement && sendToBack(selectedElement.id)}
          />
        </div>
      </div>
    </div>
  );
}

function TopBarToggle({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border transition-colors",
        active ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}