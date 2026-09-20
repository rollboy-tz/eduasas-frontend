"use client";

import { 
  DocElement, 
  DocElementType, 
  DocumentCanvas, 
  DocumentTemplate, 
  createElement, 
  TextElement, 
  TableElement
} from "@/lib/document";
import { REPORT_CARD_BINDINGS } from "@/lib/document/report-card-bindings";
import { TablePropertiesEditor } from "@/lib/document/TablePropertiesEditor";
import { useState } from "react";

export default function EditorPage() {
  const [template, setTemplate] = useState<DocumentTemplate>({
    id: "template-1",
    name: "New Document Template",
    kind: "report-card",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    page: {
      size: "A4",
      orientation: "portrait",
    },
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
    background: "#ffffff",
    elements: [
      {
        id: "el-1",
        type: "text",
        x: 20,
        y: 20,
        width: 100,
        height: 15,
        zIndex: 1,
        content: "Hello, {{student.name}}!",
        fontFamily: "sans",
        fontSize: 14,
        bold: false,
        italic: false,
        underline: false,
        color: "#1e293b",
        align: "left",
        lineHeight: 1.2,
        listStyle: "none",
        rotation: 0,
      },
    ]
  });

  const previewData = {
    student: {
      name: "Rashid Hamisi",
    },
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedElement = template.elements.find((el) => el.id === selectedId);

  // 1. Kitendakazi cha kuongeza Element mpya kulingana na aina yake (text, image, rect, line, table)
  const handleAddElement = (type: DocElementType) => {
    // Tunapata zIndex kubwa kuliko zote zilizopo ili mpya ikae juu kabisa
    const maxZIndex = template.elements.length > 0 
      ? Math.max(...template.elements.map(e => e.zIndex)) 
      : 0;

    // Tunatumia createElement helper iliyopo kwenye types zako
    // Tunaiweka kwa 50mm, 50mm kutoka juu-kushoto kama sehemu ya kuanzia
    const newEl = createElement(type, 30, 30, maxZIndex + 1);

    setTemplate((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      elements: [...prev.elements, newEl],
    }));

    // Chagua hiyo element mpya mara moja ili iweze kuharirika kwenye properties panel
    setSelectedId(newEl.id);
  };

  const handleUpdateElement = (id: string, patch: Partial<DocElement>) => {
    setTemplate((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      elements: prev.elements.map((el) => 
        el.id === id ? ({ ...el, ...patch } as DocElement) : el
      ),
    }));
  };

  return (
    <main className="p-2 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Document Editor Canvas</h1>
        
        {/* TOOLBAR YA KUONGEZA ELEMENTS */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 px-2">Ongeza:</span>
          <button 
            onClick={() => handleAddElement("text")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            + Text
          </button>
          <button 
            onClick={() => handleAddElement("image")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            + Image
          </button>
          <button 
            onClick={() => handleAddElement("shape")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            + Rect
          </button>
          <button 
            onClick={() => handleAddElement("line")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            + Line
          </button>
          <button 
            onClick={() => handleAddElement("table")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            + Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Canvas Upande wa Kushoto */}
        <div className="lg:col-span-2">
          <DocumentCanvas
            template={template}
            showRulers={false}
            showMargins={false}
            previewData={previewData}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateElement={handleUpdateElement}
            className="h-[650px]"
          />
        </div>

        {/* Properties Panel Upande wa Kulia */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-800 border-b pb-2">
            Properties Inspector
          </h2>

          {selectedElement ? (
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Element Type</label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedElement.type.toUpperCase()} 
                  className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-slate-700 uppercase"
                />
              </div>

              {/* Badilisha content kama ni text */}
              {selectedElement.type === "text" && (
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Text Content / Tokens</label>
                  <textarea
                    rows={3}
                    value={(selectedElement as TextElement).content}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-blue-600"
                  />
                </div>
              )}

              {/* Edit kama ni table */}
              {selectedElement.type === "table" && (
                <div>
                  <TablePropertiesEditor 
                    element={selectedElement as TableElement}
                    onUpdate={(patch) => handleUpdateElement(selectedElement.id, patch)}
                    bindings={REPORT_CARD_BINDINGS}
                  />
                </div>
              )}

              {/* Vipimo vya X na Y */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">X (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Y (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5"
                  />
                </div>
              </div>

              {/* Vipimo vya Width na Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => handleUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5"
                  />
                </div>
              </div>
              

            </div>
          ) : (
            <div className="text-slate-400 text-center py-12">
              Bofya element yoyote kwenye karatasi au ongeza mpya kutoka kwenye vitufe vya juu.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}