"use client";

import { useEffect, useRef } from "react";
import { Search, X, User, FileText, Settings, ArrowRight } from "lucide-react";
import { useSearch } from "@/shared/contexts";

export const GlobalSearch = () => {
  const { isSearchOpen, toggleSearch, closeSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts (Ctrl + K / Cmd + K and ESC)
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

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={closeSearch}
      />

      {/* Search Box Modal */}
      <div className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 text-card-foreground">
        
        {/* Input Area */}
        <div className="flex items-center px-4 border-b border-border bg-muted/20">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            placeholder="Search students, staff, classes, or modules..."
            className="flex-1 bg-transparent border-none focus:outline-none px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:flex h-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={closeSearch}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg sm:hidden"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Quick Suggestions
          </p>

          <div className="space-y-0.5">
            {[
              { icon: User, label: "Search Student Directory", category: "Students" },
              { icon: FileText, label: "Exam Results & Reports", category: "Academics" },
              { icon: Settings, label: "System Preferences", category: "Settings" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-muted text-muted-foreground rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 group-hover:text-foreground transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Tips */}
        <div className="px-4 py-2.5 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Press <kbd className="font-mono bg-muted px-1.5 py-0.5 border border-border rounded text-[10px]">↵</kbd> to select</span>
          <span className="hidden sm:inline font-medium">EduAsas Enterprise Search</span>
        </div>

      </div>
    </div>
  );
};

export default GlobalSearch;
