"use client";

import React, { useEffect, useRef } from "react";

/**
 * @file ContextMenu.tsx - a minimal right-click menu. Positioned at the
 * click point, closes on outside click, Escape, or after an action fires.
 */
export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}

export interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: position.x, top: position.y }}
      className="z-[10002] min-w-[160px] rounded-md border border-slate-200 bg-white py-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
            item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
