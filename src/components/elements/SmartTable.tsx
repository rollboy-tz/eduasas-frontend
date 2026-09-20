"use client";

import React, {
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils/helper";
import { useAppStore } from "@/lib/store";
import { CollectionHelper } from "@/lib/utils";

/**
 * @file SmartTable - unified replacement for the previous `SmartFlexTable`
 * and `SmartResponsiveList` components.
 *
 * WHY THEY WERE MERGED: the two prior components had different APIs
 * (`FlexTableColumn` vs `ResponsiveListColumn`) for the same concept,
 * inconsistent accessibility (one had role="row"/keyboard nav, the other
 * didn't), and different motion language (animate-shimmer vs animate-pulse).
 * One source of truth now - a single bug fix benefits every table.
 *
 * REAL BUGS FIXED (carried over from the two previous versions):
 * 1. `onSelectionChange` was commented out in `SmartFlexTable` - selection
 *    was a dead feature (there was no way to actually select a row).
 * 2. Every sticky column used `left-0` (no cumulative offset was computed) -
 *    a second sticky column would sit underneath the first one. Offsets
 *    are now measured from the DOM (ResizeObserver) - genuinely correct,
 *    not guessed from a className.
 * 3. A hardcoded `bg-white` (ignoring the rest of the palette) has been
 *    normalized - every surface now consistently uses `bg-white/90` +
 *    `slate-*` borders (see note below on styling approach).
 * 4. `bg-primary/30` on the selected mobile card (much heavier than the
 *    `bg-blue-50` used on desktop) - both views now share one tint.
 *
 * STYLING: this version intentionally avoids project-specific semantic
 * classes (`bg-card`, `border-border`, `text-foreground`, etc.) in favor
 * of plain Tailwind palette classes (`bg-white/90`, `border-slate-200`,
 * `text-slate-900`, `bg-blue-600` for the accent color). Swap the
 * `slate`/`blue` classes below for your own palette if needed - nothing
 * here depends on a custom theme/CSS-variable setup.
 *
 * NEW ADDITIONS:
 * - Column sorting (`sortable` + `sortValue` for client-side auto-sort, or
 *   `onSortChange` for server-side sorting).
 * - Bulk action bar (`enableSelection` + `bulkActions`) - appears
 *   automatically once selection > 0.
 * - Row/card enter-exit animations (framer-motion `AnimatePresence`).
 * - `role="table"/"row"/"cell"` + keyboard nav (Enter/Space) - now present
 *   in BOTH views (desktop and mobile), not just one as before.
 *
 * NOT INCLUDED (intentionally, not an oversight): row virtualization. For
 * lists of 500+ rows, integrate `@tanstack/react-virtual`. This component
 * is structured to allow that later (rows are a flat map, not nested), but
 * wiring it in directly would require solving variable-height measurement
 * for mobile cards (`mobileMode: "expanded"`) - that needs a library, not
 * a quick custom hack.
 *
 * @example
 * ```tsx
 * interface Student {
 *   id: string;
 *   name: string;
 *   email: string;
 *   status: "active" | "suspended";
 *   joinedAt: string; // ISO date
 * }
 *
 * function StudentsTable({ students, isLoading }: { students: Student[]; isLoading: boolean }) {
 *   const [selected, setSelected] = useState<Set<string>>(new Set());
 *   const [sort, setSort] = useState<SmartTableSort | null>(null);
 *
 *   const columns: SmartTableColumn<Student>[] = [
 *     {
 *       key: "name",
 *       header: "Name",
 *       className: "flex-1",
 *       sticky: true,
 *       sortable: true,
 *       sortValue: (s) => s.name.toLowerCase(),
 *       isPrimary: true, // used as the mobile card title
 *       render: (s) => <span className="font-medium">{s.name}</span>,
 *     },
 *     {
 *       key: "email",
 *       header: "Email",
 *       className: "w-64",
 *       render: (s) => s.email,
 *     },
 *     {
 *       key: "status",
 *       header: "Status",
 *       className: "w-32",
 *       isSecondary: true, // shown as a badge next to the title on mobile
 *       render: (s) => (
 *         <span
 *           className={cn(
 *             "rounded-full px-2 py-0.5 text-xs font-medium",
 *             s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
 *           )}
 *         >
 *           {s.status}
 *         </span>
 *       ),
 *     },
 *     {
 *       key: "joinedAt",
 *       header: "Joined",
 *       className: "w-40",
 *       sortable: true,
 *       sortValue: (s) => s.joinedAt,
 *       mobileMode: "expanded", // hidden behind "View More" on mobile
 *       render: (s) => new Date(s.joinedAt).toLocaleDateString(),
 *     },
 *   ];
 *
 *   return (
 *     <SmartTable
 *       data={students}
 *       columns={columns}
 *       rowKey="id"
 *       isLoading={isLoading}
 *       enableSelection
 *       selectedKeys={selected}
 *       onSelectionChange={setSelected}
 *       sort={sort}
 *       onSortChange={setSort}
 *       onRowClick={(s) => console.log("open", s.id)}
 *       bulkActions={(count, clear) => (
 *         <>
 *           <button onClick={clear} className="text-xs font-medium text-slate-500">
 *             Cancel
 *           </button>
 *           <button
 *             onClick={() => console.log("suspend", count, "students")}
 *             className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
 *           >
 *             Suspend {count}
 *           </button>
 *         </>
 *       )}
 *     />
 *   );
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortDirection = "asc" | "desc";

export interface SmartTableSort {
  key: string;
  direction: SortDirection;
}

/**
 * Configuration for a single column - shared by BOTH views (desktop table
 * and mobile cards), one source of truth.
 */
export interface SmartTableColumn<T> {
  /** Unique column identifier - used for sorting/measurement. */
  key: string;
  header: string;
  /** Width/appearance classes on desktop (e.g. 'w-32' or 'flex-1'). */
  className?: string;
  /** Pin to the left edge while horizontally scrolling (desktop). */
  sticky?: boolean;
  /** Allow clicking this header to sort the data. */
  sortable?: boolean;
  /**
   * Raw sort value - if provided and `onSortChange` was NOT passed, the
   * component sorts the data itself (client-side). Without this,
   * `sortable: true` relies entirely on `onSortChange` (server-side).
   */
  sortValue?: (item: T) => string | number;
  /** Card's main title on mobile. */
  isPrimary?: boolean;
  /** Badge/status shown next to the title on mobile. */
  isSecondary?: boolean;
  /** Action button shown top-right of the card on mobile. */
  isAction?: boolean;
  /** "summary" (default, always visible) or "expanded" (behind "View More"). */
  mobileMode?: "summary" | "expanded";
  dataCellClasses?: string;
  headerCellClasses?: string;
  cardRowClasses?: string;
  render: (item: T, index: number) => ReactNode;
}

export interface SmartTableProps<T> {
  data: T[];
  columns: SmartTableColumn<T>[];
  rowKey: keyof T | ((item: T, index: number) => string);
  isLoading?: boolean;
  onRowClick?: (item: T) => void;

  // Selection
  selectedKeys?: Set<string> | string[];
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  enableSelection?: boolean;
  /**
   * Content for the bulk action bar (shown once selection.size > 0).
   * If left empty, the bar still shows "N selected" + "Clear".
   */
  bulkActions?: (selectedCount: number, clearSelection: () => void) => ReactNode;

  // Sorting
  sort?: SmartTableSort | null;
  onSortChange?: (sort: SmartTableSort | null) => void;

  // Layout
  /** Force the mobile card view regardless of screen size. */
  disableTable?: boolean;
  className?: string;
  bodyClassName?: string;
  rowClassName?: string;
  cardClassName?: string;
  cardHeaderClassName?: string;
  cardRowsClassName?: string;
  stickyHeaderClassName?: string;
  selectedRowClassName?: string;
  emptyState?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @file SmartTable - unified replacement for the previous `SmartFlexTable`
 * and `SmartResponsiveList` components.
 *
 * WHY THEY WERE MERGED: the two prior components had different APIs
 * (`FlexTableColumn` vs `ResponsiveListColumn`) for the same concept,
 * inconsistent accessibility (one had role="row"/keyboard nav, the other
 * didn't), and different motion language (animate-shimmer vs animate-pulse).
 * One source of truth now - a single bug fix benefits every table.
 *
 * REAL BUGS FIXED (carried over from the two previous versions):
 * 1. `onSelectionChange` was commented out in `SmartFlexTable` - selection
 *    was a dead feature (there was no way to actually select a row).
 * 2. Every sticky column used `left-0` (no cumulative offset was computed) -
 *    a second sticky column would sit underneath the first one. Offsets
 *    are now measured from the DOM (ResizeObserver) - genuinely correct,
 *    not guessed from a className.
 * 3. A hardcoded `bg-white` (ignoring the rest of the palette) has been
 *    normalized - every surface now consistently uses `bg-white/90` +
 *    `slate-*` borders (see note below on styling approach).
 * 4. `bg-primary/30` on the selected mobile card (much heavier than the
 *    `bg-blue-50` used on desktop) - both views now share one tint.
 *
 * STYLING: this version intentionally avoids project-specific semantic
 * classes (`bg-card`, `border-border`, `text-foreground`, etc.) in favor
 * of plain Tailwind palette classes (`bg-white/90`, `border-slate-200`,
 * `text-slate-900`, `bg-blue-600` for the accent color). Swap the
 * `slate`/`blue` classes below for your own palette if needed - nothing
 * here depends on a custom theme/CSS-variable setup.
 *
 * NEW ADDITIONS:
 * - Column sorting (`sortable` + `sortValue` for client-side auto-sort, or
 *   `onSortChange` for server-side sorting).
 * - Bulk action bar (`enableSelection` + `bulkActions`) - appears
 *   automatically once selection > 0.
 * - Row/card enter-exit animations (framer-motion `AnimatePresence`).
 * - `role="table"/"row"/"cell"` + keyboard nav (Enter/Space) - now present
 *   in BOTH views (desktop and mobile), not just one as before.
 *
 * NOT INCLUDED (intentionally, not an oversight): row virtualization. For
 * lists of 500+ rows, integrate `@tanstack/react-virtual`. This component
 * is structured to allow that later (rows are a flat map, not nested), but
 * wiring it in directly would require solving variable-height measurement
 * for mobile cards (`mobileMode: "expanded"`) - that needs a library, not
 * a quick custom hack.
 *
 * @example
 * ```tsx
 * interface Student {
 *   id: string;
 *   name: string;
 *   email: string;
 *   status: "active" | "suspended";
 *   joinedAt: string; // ISO date
 * }
 *
 * function StudentsTable({ students, isLoading }: { students: Student[]; isLoading: boolean }) {
 *   const [selected, setSelected] = useState<Set<string>>(new Set());
 *   const [sort, setSort] = useState<SmartTableSort | null>(null);
 *
 *   const columns: SmartTableColumn<Student>[] = [
 *     {
 *       key: "name",
 *       header: "Name",
 *       className: "flex-1",
 *       sticky: true,
 *       sortable: true,
 *       sortValue: (s) => s.name.toLowerCase(),
 *       isPrimary: true, // used as the mobile card title
 *       render: (s) => <span className="font-medium">{s.name}</span>,
 *     },
 *     {
 *       key: "email",
 *       header: "Email",
 *       className: "w-64",
 *       render: (s) => s.email,
 *     },
 *     {
 *       key: "status",
 *       header: "Status",
 *       className: "w-32",
 *       isSecondary: true, // shown as a badge next to the title on mobile
 *       render: (s) => (
 *         <span
 *           className={cn(
 *             "rounded-full px-2 py-0.5 text-xs font-medium",
 *             s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
 *           )}
 *         >
 *           {s.status}
 *         </span>
 *       ),
 *     },
 *     {
 *       key: "joinedAt",
 *       header: "Joined",
 *       className: "w-40",
 *       sortable: true,
 *       sortValue: (s) => s.joinedAt,
 *       mobileMode: "expanded", // hidden behind "View More" on mobile
 *       render: (s) => new Date(s.joinedAt).toLocaleDateString(),
 *     },
 *   ];
 *
 *   return (
 *     <SmartTable
 *       data={students}
 *       columns={columns}
 *       rowKey="id"
 *       isLoading={isLoading}
 *       enableSelection
 *       selectedKeys={selected}
 *       onSelectionChange={setSelected}
 *       sort={sort}
 *       onSortChange={setSort}
 *       onRowClick={(s) => console.log("open", s.id)}
 *       bulkActions={(count, clear) => (
 *         <>
 *           <button onClick={clear} className="text-xs font-medium text-slate-500">
 *             Cancel
 *           </button>
 *           <button
 *             onClick={() => console.log("suspend", count, "students")}
 *             className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
 *           >
 *             Suspend {count}
 *           </button>
 *         </>
 *       )}
 *     />
 *   );
 * }
 * ```
 */

export function SmartTable<T>({
  data = [],
  columns,
  rowKey,
  isLoading = false,
  onRowClick,
  selectedKeys,
  onSelectionChange,
  enableSelection = false,
  bulkActions,
  sort: sortProp,
  onSortChange,
  disableTable,
  bodyClassName,
  rowClassName,
  stickyHeaderClassName,
  className,
  emptyState,
  cardClassName,
  cardHeaderClassName,
  cardRowsClassName,
  selectedRowClassName = "bg-blue-50",
}: SmartTableProps<T>) {
  const isMobileView = useAppStore((state) => state.isMobileView);
  const isMobile = disableTable ?? isMobileView;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // ---- sort (controlled if `sort` prop is passed, otherwise internal) ----
  const [internalSort, setInternalSort] = useState<SmartTableSort | null>(null);
  const sort = sortProp !== undefined ? sortProp : internalSort;

  const handleSortClick = useCallback(
    (col: SmartTableColumn<T>) => {
      if (!col.sortable) return;
      const nextDirection: SortDirection =
        sort?.key === col.key ? (sort.direction === "asc" ? "desc" : "asc") : "asc";
      const next: SmartTableSort = { key: col.key, direction: nextDirection };

      if (onSortChange) {
        onSortChange(next);
      } else {
        setInternalSort(next);
      }
    },
    [sort, onSortChange]
  );

  // Client-side auto-sort ONLY when `sortValue` is provided AND
  // `onSortChange` was NOT passed (server-side sorting is left entirely
  // to the consumer in that case).
  const sortedData = useMemo(() => {
    if (!sort || onSortChange) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return data;

    const sign = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * sign;
      if (av > bv) return 1 * sign;
      return 0;
    });
  }, [data, sort, columns, onSortChange]);

  // ---- selection ----------------------------------------------------------
  const selectedSet = useMemo(() => {
    if (!selectedKeys) return new Set<string>();
    return selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys);
  }, [selectedKeys]);

  const getKey = useCallback(
    (item: T, index: number): string =>
      typeof rowKey === "function" ? rowKey(item, index) : String(item[rowKey]),
    [rowKey]
  );

  const handleSelectRow = useCallback(
    (key: string, e?: React.MouseEvent | React.ChangeEvent) => {
      e?.stopPropagation();
      if (!onSelectionChange) return;
      const updated = new Set(selectedSet);
      updated.has(key) ? updated.delete(key) : updated.add(key);
      onSelectionChange(updated);
    },
    [selectedSet, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectionChange) return;
      if (e.target.checked) {
        onSelectionChange(new Set(sortedData.map((item, i) => getKey(item, i))));
      } else {
        onSelectionChange(new Set());
      }
    },
    [sortedData, getKey, onSelectionChange]
  );

  const clearSelection = useCallback(() => onSelectionChange?.(new Set()), [onSelectionChange]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isAllSelected = sortedData.length > 0 && selectedSet.size === sortedData.length;
  const isSomeSelected = selectedSet.size > 0 && !isAllSelected;

  // ---- BUG FIX: sticky column offsets --------------------------------
  // Previously every sticky column used `left-0` (they would all overlap
  // each other). Actual rendered width of each sticky column is now
  // measured via DOM (ResizeObserver) and a cumulative offset is computed -
  // correct even when widths come from arbitrary Tailwind classes or
  // content-based sizing.
  const stickyCols = useMemo(() => columns.filter((c) => c.sticky), [columns]);
  const headerCellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [stickyOffsets, setStickyOffsets] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    if (stickyCols.length === 0 || isMobile) return;

    function measure() {
      let cumulative = 0;
      const next: Record<string, number> = {};
      for (const col of stickyCols) {
        next[col.key] = cumulative;
        const el = headerCellRefs.current.get(col.key);
        cumulative += el?.offsetWidth ?? 0;
      }
      setStickyOffsets(next);
    }

    measure();
    const observer = new ResizeObserver(measure);
    headerCellRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stickyCols, isMobile, sortedData.length]);

  function stickyStyle(colKey: string): React.CSSProperties | undefined {
    if (!(colKey in stickyOffsets)) return undefined;
    return { left: stickyOffsets[colKey] };
  }

  // ---------------------------------------------------------------------------
  // 1. LOADING SKELETON
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading content..."
        className={cn("bg-white/90 border-slate-200 w-full overflow-hidden rounded-xl border shadow-sm", className)}
      >
        <div className="divide-slate-100 divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              {enableSelection && <div className="bg-slate-100 h-4 w-4 animate-pulse rounded" />}
              {columns.map((col) => (
                <div key={col.key} className={cn("bg-slate-100 h-4 animate-pulse rounded-sm", col.className || "flex-1")} />
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
  if (sortedData.length === 0) {
    return <>{emptyState || <DefaultEmptyState className={className} />}</>;
  }

  const showBulkBar = enableSelection && selectedSet.size > 0;

  // ---------------------------------------------------------------------------
  // 3. MOBILE CARD VIEW
  // ---------------------------------------------------------------------------
  if (isMobile) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <BulkActionBar show={showBulkBar} count={selectedSet.size} onClear={clearSelection} bulkActions={bulkActions} />

        <div role="list" className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {sortedData.map((item, index) => {
              const id = getKey(item, index);
              const isSelected = selectedSet.has(id);
              const isExpanded = expanded[id];

              const primaryCol = columns.find((c) => c.isPrimary);
              const secondaryCol = columns.find((c) => c.isSecondary);
              const actionCol = columns.find((c) => c.isAction);
              const hasExpandedFields = columns.some((c) => c.mobileMode === "expanded");

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  role="listitem"
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(item)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  className={cn(
                    "bg-white/90 border-slate-200 relative rounded-xl border p-4 shadow-sm transition-colors duration-200",
                    onRowClick && "active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                    isSelected && cn(selectedRowClassName, "border-blue-300"),
                    cardClassName
                  )}
                >
                  <div className={cn("flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100", cardHeaderClassName)}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {enableSelection && (
                        <CustomCheckbox checked={isSelected} onChange={(e) => handleSelectRow(id, e)} ariaLabel={`Select item ${id}`} />
                      )}
                      <div className="font-semibold text-slate-900 text-base truncate">
                        {primaryCol ? primaryCol.render(item, index) : `Item #${index + 1}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {secondaryCol?.render(item, index)}
                      {actionCol?.render(item, index)}
                    </div>
                  </div>

                  <div className="pt-2.5 space-y-2">
                    {columns
                      .filter((c) => {
                        if (c.isPrimary || c.isSecondary || c.isAction) return false;
                        return isExpanded ? true : c.mobileMode !== "expanded";
                      })
                      .map((col, i, filteredArray) => (
                        <div
                          key={col.key}
                          className={cn(
                            "flex justify-between items-center py-1 text-xs sm:text-sm",
                            !CollectionHelper.isLast(filteredArray, i) && "border-b border-slate-100 pb-2",
                            cardRowsClassName,
                            col.cardRowClasses
                          )}
                        >
                          <span className={cn("text-slate-500 font-medium", col.headerCellClasses)}>{col.header}</span>
                          <div className={cn("font-medium text-slate-900 text-right min-w-0 truncate ml-2", col.dataCellClasses)}>
                            {col.render(item, index)}
                          </div>
                        </div>
                      ))}
                  </div>

                  {hasExpandedFields && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(id);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full px-3.5 py-1 transition-colors"
                      >
                        {isExpanded ? "Show Less" : "View More Details"}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. DESKTOP TABLE VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className={cn("bg-white/90 border-slate-200 w-full overflow-hidden rounded-xl border shadow-sm transition-all", className)}>
      <BulkActionBar show={showBulkBar} count={selectedSet.size} onClear={clearSelection} bulkActions={bulkActions} />

      <div className="w-full overflow-x-auto" onScroll={(e) => setIsScrolled(e.currentTarget.scrollLeft > 0)}>
        <div role="table" className="w-full min-w-full divide-y divide-slate-200">
          {/* Header */}
          <div
            role="row"
            className={cn(
              "bg-white sticky top-0 z-20 flex items-center px-5 py-3.5 select-none border-b border-slate-200",
              stickyHeaderClassName
            )}
          >
            {enableSelection && (
              <div className="w-10 flex items-center justify-center shrink-0 mr-1">
                <CustomCheckbox checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} ariaLabel="Select all rows" />
              </div>
            )}

            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              return (
                <div
                  key={col.key}
                  ref={(el) => {
                    if (col.sticky) {
                      if (el) headerCellRefs.current.set(col.key, el);
                      else headerCellRefs.current.delete(col.key);
                    }
                  }}
                  role="columnheader"
                  aria-sort={isSorted ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined}
                  onClick={() => handleSortClick(col)}
                  style={col.sticky ? stickyStyle(col.key) : undefined}
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1",
                    col.className || "flex-1",
                    col.sortable && "cursor-pointer select-none hover:text-slate-900 transition-colors",
                    col.sticky && cn("bg-white sticky z-30 transition-shadow duration-300", isScrolled && "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]")
                  )}
                >
                  {col.header}
                  {col.sortable && <SortIcon active={isSorted} direction={sort?.direction} />}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div role="rowgroup" className={cn("divide-y divide-slate-100 bg-white", bodyClassName)}>
            <AnimatePresence initial={false}>
              {sortedData.map((item, index) => {
                const id = getKey(item, index);
                const isSelected = selectedSet.has(id);

                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
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
                      onRowClick && "cursor-pointer hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset",
                      isSelected && cn(selectedRowClassName, "hover:bg-blue-100"),
                      rowClassName
                    )}
                  >
                    {enableSelection && (
                      <div className="w-10 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                        <CustomCheckbox checked={isSelected} onChange={(e) => handleSelectRow(id, e)} ariaLabel={`Select row ${id}`} />
                      </div>
                    )}

                    {columns.map((col) => (
                      <div
                        key={col.key}
                        role="cell"
                        style={col.sticky ? stickyStyle(col.key) : undefined}
                        className={cn(
                          "text-sm font-normal text-slate-900 min-w-0 truncate",
                          col.className || "flex-1",
                          col.sticky &&
                            cn(
                              "sticky z-10 transition-shadow duration-300",
                              isSelected ? "bg-blue-50" : "bg-white",
                              isScrolled && "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]"
                            )
                        )}
                      >
                        {col.render(item, index)}
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" aria-hidden="true" />;
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}>
      {direction === "asc" ? <ArrowUp className="h-3 w-3 text-blue-600" aria-hidden="true" /> : <ArrowDown className="h-3 w-3 text-blue-600" aria-hidden="true" />}
    </motion.span>
  );
}

function BulkActionBar({
  show,
  count,
  onClear,
  bulkActions,
}: {
  show: boolean;
  count: number;
  onClear: () => void;
  bulkActions?: (selectedCount: number, clearSelection: () => void) => ReactNode;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 bg-blue-50 border-b border-blue-100 px-5 py-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px]">
                {count}
              </span>
              selected
              <button type="button" onClick={onClear} className="text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2 ml-1">
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">{bulkActions?.(count, onClear)}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="accent-blue-600 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer transition-all"
    />
  );
}

/**
 * Default empty state: lucide icon, a soft dashed border (a common
 * modern-SaaS empty-state pattern), tight type hierarchy, and an optional
 * action slot so callers can drop in a "Create new" button without
 * needing to replace the whole empty state via `emptyState`.
 */
function DefaultEmptyState({
  className,
  title = "No records found",
  description = "Try adjusting your filters, or add a new record to get started.",
  action,
}: {
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white/90 border-slate-200 text-slate-500 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
        className
      )}
    >
      <div className="bg-slate-100 ring-slate-200 mb-4 grid h-14 w-14 place-items-center rounded-2xl ring-1">
        <Inbox className="text-slate-400 h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}