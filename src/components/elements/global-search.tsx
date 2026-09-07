// components/GlobalSearch.tsx
"use client";

import { useEffect, useRef } from "react";
import { Search, X, User, FileText, Settings, ArrowRight } from "lucide-react";
import { useSearch } from "@/shared/contexts";

export const GlobalSearch = () => {
  const { isSearchOpen, toggleSearch, closeSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Keyboard Shortcuts (Ctrl + K / Cmd + K na ESC)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSearch();
      }

      if (e.key === "Escape" && isSearchOpen) {
        e.preventDefault();
        closeSearch();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleSearch, closeSearch, isSearchOpen]);

  // 2. Focus input ikifunguka
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* BACKGROUND OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={closeSearch}
      />

      {/* SEARCH BOX MODAL */}
      <div className="relative w-full max-w-xl bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10">
        
        {/* INPUT AREA */}
        <div className="flex items-center px-4 border-b border-gray-100 bg-gray-50/50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            placeholder="Tafuta mwanafunzi, mwalimu au moduli..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3.5 text-sm text-gray-800 placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:flex h-5 items-center justify-center rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-gray-400 shadow-2xl">
              ESC
            </kbd>
            <button
              onClick={closeSearch}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RESULTS AREA */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Mapendekezo ya Haraka
          </p>

          <div className="space-y-0.5">
            {[
              { icon: User, label: "Tafuta Mwanafunzi", category: "Wanafunzi" },
              { icon: FileText, label: "Ripoti za Mitihani", category: "Akademia" },
              { icon: Settings, label: "Mipangilio ya Mfumo", category: "System" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-gray-500 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER TIPS */}
        <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Bonyeza <kbd className="font-mono bg-white px-1 border rounded text-[10px]">↵</kbd> kuchagua</span>
          <span className="hidden sm:inline">EduAsas Global Search</span>
        </div>

      </div>
    </div>
  );
};