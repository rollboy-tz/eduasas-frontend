"use client";

import React, { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils/helper";
import { useAppStore } from "@/lib/store";
import { CollectionHelper } from "@/lib/utils";

/**
 * Usanidi wa safu (Column Configuration) ya `SmartResponsiveList`.
 * @template T Aina ya data inayowekwa kwenye list au table.
 */
export interface ResponsiveListColumn<T> {
  /** Jina la safu linalotokea kwenye header ya table */
  header: string;

  /** ClassName za Tailwind kwa ajili ya kuseti upana na mtindo wa column kwenye Desktop */
  className?: string;

  /** Ikiwa `true`, data hii itakuwa Kichwa Kikuu cha Kadi kwenye mobile (Mobile Card Header) */
  isPrimary?: boolean;

  /** Ikiwa `true`, data hii itawekwa pembeni mwa Kichwa Kikuu kwenye mobile (k.m. Status Badge) */
  isSecondary?: boolean;

  /** Ikiwa `true`, itachukuliwa kama kitufe cha vitendo (Action Button) kulia juu mwa kadi */
  isAction?: boolean;

  /** 
   * Inafafanua jinsi safu inavyoonekana kwenye mwonekano wa simu:
   * - `summary`: Itaonekana mara moja (Default).
   * - `expanded`: Itafichwa mpaka mtumiaji abonyeze "View details".
   */
  mobileMode?: "summary" | "expanded";

  /** ClassName za Tailwind kwa ajili ya value ya data kwenye kadi ya mobile */
  dataCellClasses?: string;

  /** ClassName za Tailwind kwa ajili ya lebo (header) kwenye kadi ya mobile */
  headerCellClasses?: string;

  /** ClassName za Tailwind kwa ajili ya mstari mzima wa data (Card Row) */
  cardRowClasses?: string;

  /** 
   * Function inayorejesha React element kwa ajili ya kutoa data ya seli.
   * @param item Object ya data husika.
   * @param index Nambari ya nafasi ya data kwenye mfululizo.
   */
  render: (item: T, index: number) => React.ReactNode;
}

/**
 * Props za component ya `SmartResponsiveList`.
 * @template T Aina ya data kwenye mfululizo.
 */
export interface SmartResponsiveListProps<T> {
  /** Mfululizo wa data (Data Array) */
  data: T[];

  /** Usanidi wa safu (Columns Array) */
  columns: ResponsiveListColumn<T>[];

  /** Ufunguo wa kipekee kwa kila safu (`"id"` au function) */
  rowKey: keyof T | ((item: T, index: number) => string);

  /** Hali ya upakiaji wa data (Loading State) */
  isLoading?: boolean;

  /** Tendo linalotokea mtumiaji akibonyeza safu au kadi */
  onRowClick?: (item: T) => void;

  // --- SELECTION PROPS (CHECKBOX SUPPORT) ---
  /** Set au Array ya vitu vilivyochaguliwa (Keys) */
  selectedKeys?: Set<string> | string[];

  /** Function inayotokea pindi uteuzi wa item mmoja ukibadilika */
  onSelectionChange?: (selectedKeys: Set<string>) => void;

  /** Ongeza checkbox ya kuchagua vyote (Select All) kwenye Header */
  enableSelection?: boolean;

  // --- STYLING & CUSTOMIZATION PROPS ---
  /** ClassName kuu ya wrapper container */
  className?: string;

  /** ClassName za ziada kwa ajili ya mwili wa table (Table Body) */
  bodyClassName?: string;

  /** ClassName za ziada kwa ajili ya kila safu (Table Row) kwenye Desktop */
  rowClassName?: string;

  /** ClassName za ziada kwa ajili ya kadi za mobile */
  cardClassName?: string;

  /** ClassName za ziada kwa ajili ya header ya kadi kwenye mobile */
  cardHeaderClassName?: string;

  /** ClassName za ziada kwa ajili ya kila mstari wa data kwenye kadi */
  cardRowsClassName?: string;

  /** ClassName za ziada kwa ajili ya Header iliyoganda (Sticky Header) */
  stickyHeaderClassName?: string;

  /** Ikiwa `true`, italazimisha mwonekano wa Kadi (Mobile View) bila kujali ukubwa wa skrini */
  disAbleTable?: boolean;

  /** Custom Component ya kuonyesha iwapo hakuna data iliyopatikana */
  EmptyState?: React.ReactNode;
}

/**
 * Component ya kisasa inayobadilika kiotomatiki kati ya Enterprise Data Table (Desktop) 
 * na Interactive Cards (Mobile) ikiwa na usaidizi wa Selection (Checkboxes).
 */
export function SmartResponsiveList<T>({
  data = [],
  columns,
  rowKey,
  isLoading = false,
  onRowClick,
  selectedKeys,
  onSelectionChange,
  enableSelection = false,
  disAbleTable,
  bodyClassName,
  rowClassName,
  stickyHeaderClassName,
  className,
  EmptyState,
  cardClassName,
  cardHeaderClassName,
  cardRowsClassName,
}: SmartResponsiveListProps<T>) {
  const isMobileView = useAppStore((state) => state.isMobileView);
  const isMobile = disAbleTable ?? isMobileView;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Geuza selectedKeys kuwa Set kwa ajili ya O(1) performance lookup
  const selectedSet = useMemo(() => {
    if (!selectedKeys) return new Set<string>();
    return selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys);
  }, [selectedKeys]);

  const getKey = useCallback(
    (item: T, index: number): string => {
      return typeof rowKey === "function"
        ? rowKey(item, index)
        : String(item[rowKey]);
    },
    [rowKey]
  );

  // Handle Selection Toggle kwa ajili ya item mmoja
  const handleSelectRow = useCallback(
    (key: string, e?: React.MouseEvent | React.ChangeEvent) => {
      e?.stopPropagation();
      if (!onSelectionChange) return;

      const updated = new Set(selectedSet);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      onSelectionChange(updated);
    },
    [selectedSet, onSelectionChange]
  );

  // Handle Select All
  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectionChange) return;
      if (e.target.checked) {
        const allKeys = new Set(data.map((item, i) => getKey(item, i)));
        onSelectionChange(allKeys);
      } else {
        onSelectionChange(new Set());
      }
    },
    [data, getKey, onSelectionChange]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isAllSelected = data.length > 0 && selectedSet.size === data.length;
  const isSomeSelected = selectedSet.size > 0 && !isAllSelected;

  // ---------------------------------------------------------------------------
  // 1. LOADING SKELETON STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading content..."
        className={cn(
          "bg-card border-border/60 w-full overflow-hidden rounded-xl border shadow-xs",
          className
        )}
      >
        <div className="divide-border/40 divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              {enableSelection && (
                <div className="bg-muted/60 h-4 w-4 animate-pulse rounded" />
              )}
              {columns.map((col, j) => (
                <div
                  key={j}
                  className={cn(
                    "bg-muted/60 h-4 animate-pulse rounded-sm",
                    col.className || "flex-1"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. EMPTY STATE
  // ---------------------------------------------------------------------------
  if (!data || data.length === 0) {
    return (
      <>{EmptyState || <DefaultEmptyState className={className} />}</>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. MOBILE CARD VIEW
  // ---------------------------------------------------------------------------
  if (isMobile) {
    return (
      <div className={cn("flex flex-col gap-3", className)} role="list">
        {data.map((item, index) => {
          const id = getKey(item, index);
          const isSelected = selectedSet.has(id);
          const isExpanded = expanded[id];

          const primaryCol = columns.find((c) => c.isPrimary);
          const secondaryCol = columns.find((c) => c.isSecondary);
          const actionCol = columns.find((c) => c.isAction);
          const hasExpandedFields = columns.some((c) => c.mobileMode === "expanded");

          return (
            <div
              key={id}
              role="listitem"
              onClick={() => onRowClick?.(item)}
              className={cn(
                "bg-card border-border/80 relative rounded-xl border p-4 shadow-2xs transition-all duration-200",
                onRowClick && "active:scale-[0.99] cursor-pointer",
                isSelected && "border-primary/50 bg-primary/30",
                cardClassName
              )}
            >
              {/* Top Row: Checkbox + Primary Title + Secondary Badge + Action */}
              <div
                className={cn(
                  "flex items-center justify-between gap-2.5 pb-2.5 border-b border-border/40",
                  cardHeaderClassName
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {enableSelection && (
                    <CustomCheckbox
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(id, e)}
                      ariaLabel={`Select item ${id}`}
                    />
                  )}
                  <div className="font-semibold text-foreground text-base truncate">
                    {primaryCol ? primaryCol.render(item, index) : `Item #${index + 1}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {secondaryCol?.render(item, index)}
                  {actionCol?.render(item, index)}
                </div>
              </div>

              {/* Card Body Data Rows */}
              <div className="pt-2.5 space-y-2">
                {columns
                  .filter((c) => {
                    if (c.isPrimary || c.isSecondary || c.isAction) return false;
                    return isExpanded ? true : c.mobileMode !== "expanded";
                  })
                  .map((col, i, filteredArray) => (
                    <div
                      key={i}
                      className={cn(
                        "flex justify-between items-center py-1 text-xs sm:text-sm",
                        !CollectionHelper.isLast(filteredArray, i) && "border-b border-border/30 pb-2",
                        cardRowsClassName,
                        col.cardRowClasses
                      )}
                    >
                      <span className={cn("text-muted-foreground font-medium", col.headerCellClasses)}>
                        {col.header}
                      </span>
                      <div className={cn("font-medium text-foreground text-right min-w-0 truncate ml-2", col.dataCellClasses)}>
                        {col.render(item, index)}
                      </div>
                    </div>
                  ))}
              </div>

              {/* View More / View Less Toggle */}
              {hasExpandedFields && (
                <div className="mt-3 pt-2 border-t border-border/40 flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(id);
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-full px-3.5 py-1 transition-colors"
                  >
                    {isExpanded ? "Show Less" : "View More Details"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. DESKTOP TABLE VIEW
  // ---------------------------------------------------------------------------
  return (
    <div
      className={cn(
        "bg-card border-border/70 w-full overflow-hidden rounded-xl border shadow-2xs transition-all",
        className
      )}
    >
      <div className="w-full overflow-x-auto">
        <div role="table" className="w-full min-w-full divide-y divide-border/60">
          {/* Table Header */}
          <div
            role="rowgroup"
            className={cn(
              "bg-white sticky top-0 z-20 flex items-center px-5 py-3.5 backdrop-blur-md select-none",
              stickyHeaderClassName
            )}
          >
            {enableSelection && (
              <div className="w-10 flex items-center justify-center shrink-0 mr-1">
                <CustomCheckbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={handleSelectAll}
                  ariaLabel="Select all rows"
                />
              </div>
            )}
            {columns.map((col, i) => (
              <div
                key={i}
                role="columnheader"
                className={cn(
                  "text-xs font-bold uppercase tracking-wider text-muted-foreground/90",
                  col.className || "flex-1"
                )}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div role="rowgroup" className={cn("divide-y divide-border/40 bg-card", bodyClassName)}>
            {data.map((item, index) => {
              const id = getKey(item, index);
              const isSelected = selectedSet.has(id);

              return (
                <div
                  key={id}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  className={cn(
                    "flex items-center px-5 py-3.5 transition-colors group",
                    onRowClick && "cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                    isSelected && "bg-primary/5 hover:bg-primary/10",
                    rowClassName
                  )}
                >
                  {enableSelection && (
                    <div
                      className="w-10 flex items-center justify-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CustomCheckbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(id, e)}
                        ariaLabel={`Select row ${id}`}
                      />
                    </div>
                  )}

                  {columns.map((col, i) => (
                    <div
                      key={i}
                      role="cell"
                      className={cn(
                        "text-sm font-normal text-foreground min-w-0 truncate",
                        col.className || "flex-1"
                      )}
                    >
                      {col.render(item, index)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS (HELPER COMPONENTS)
// ---------------------------------------------------------------------------

/** Custom Reusable Checkbox inayosaidia indeterminate state (dash icon) */
function CustomCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className={cn(
        "accent-primary h-4 w-4 rounded-md border-border/80 text-primary focus:ring-primary/40 cursor-pointer transition-all"
      )}
    />
  );
}

/** Component ya Default Pale Data Inapokuwa Tupu */
function DefaultEmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-xl border p-12 text-center shadow-2xs",
        className
      )}
    >
      <div className="bg-muted/80 mb-3 grid h-12 w-12 place-items-center rounded-full">
        <svg
          className="text-muted-foreground/60 h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-foreground text-base">Hakuna Data Iliyopatikana</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Jaribu kubadilisha filter au kuongeza rekodi mpya.
      </p>
    </div>
  );
}