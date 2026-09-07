"use client";

import { ReactNode, useState, UIEvent } from "react";
import { cn } from "@/lib/utils/helper";

/**
 * Usanidi wa safu (Column Configuration) ya SmartFlexTable.
 * @template T Aina ya data inayowekwa kwenye table.
 */
export interface FlexTableColumn<T> {
  /** Jina la kichwa cha safu linaloonekana kwenye Header */
  header: string;

  /** ClassName za Tailwind kwa ajili ya kuweka upana au muonekano (mfano: 'w-[50px]' au 'flex-1') */
  className?: string;

  /** 
   * Ikiwa `true`, safu hii itaganda upande wa kushoto (Sticky Column) wakati mtumiaji anapotembeza (scroll) kwenda kulia.
   */
  sticky?: boolean;

  /** 
   * Function inayorejesha Element ya React/JSX ya kutoa data husika kwenye seli.
   * @param item Object ya data husika.
   * @param index Nambari ya nafasi ya data kwenye mfululizo.
   */
  render: (item: T, index: number) => ReactNode;
}

/**
 * Props za component ya SmartFlexTable.
 * @template T Aina ya data inayowekwa kwenye table.
 */
interface SmartFlexTableProps<T> {
  /** Mfululizo wa data unaotakiwa kuonyeshwa */
  data: T[];

  /** Usanidi wa safu (Columns Configuration) */
  columns: FlexTableColumn<T>[];

  /** Ufunguo wa kipekee kwa kila safu (mfano: `"id"` au function `. */
  rowKey: keyof T | ((item: T, index: number) => string);

  /** Orodha ya vitambulisho (IDs) vilivyochaguliwa (kwa ajili ya selection) */
  selectedIds?: string[];

  /** Callback inayotokea wakati uteuzi wa safu unapobadilika */
  onSelectionChange?: (ids: string[]) => void;

  /** Hali ya upakiaji wa data (Loading State) */
  isLoading?: boolean;

  /** Tendo linalotokea mtumiaji akibonyeza safu (Row Click) */
  onRowClick?: (item: T) => void;

  /** Component ya kuonyesha iwapo hakuna data iliyopatikana */
  emptyState?: ReactNode;

  /** ClassName kuu ya kontena la nje */
  className?: string;

  /** ClassName za ziada kwa ajili ya kila safu ya data (Table Row) */
  rowsClassName?: string;

  /** ClassName za ziada kwa ajili ya sehemu ya juu ya kadi (Table Header) */
  headerClassName?: string;

  /** ClassName maalum kwa ajili ya safu iliyochaguliwa (Selected Row styling) */
  selectedRowClassName?: string;

  /** ClassName za ziada kwa ajili ya mwili wa table (Table Body) */
  tableBodyClassName?: string;
}

/**
 * Component ya Table inayoruhusu kuscroll mlalo (Horizontal Scroll) kwa kutumia Flexbox,
 * yenye usaidizi wa safu zilizoganda (Sticky Columns), Uteuzi (Selection), na Loading Skeleton.
 *
 * @example
 * ```tsx
 * <SmartFlexTable * columns="{columns}" data="{data}" rowKey="id"/>
 * ```
 */
export function SmartFlexTable<T>({
  data,
  columns,
  rowKey,
  selectedIds = [],
  //onSelectionChange,
  isLoading,
  onRowClick,
  emptyState,
  className,
  rowsClassName,
  headerClassName,
  selectedRowClassName = "bg-primary/5",
  tableBodyClassName,
}: SmartFlexTableProps<T>) {
  const [isScrolled, setIsScrolled] = useState(false);

  const getKey = (item: T, index: number): string =>
    typeof rowKey === "function" ? rowKey(item, index) : String(item[rowKey]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 0);
  };

  return (
    <div
      className={cn(
        "card-surface bg-card border-border/40 relative w-full overflow-hidden rounded-lg border shadow-sm",
        className
      )}
    >
      <div className="custom-scrollbar overflow-x-auto" onScroll={handleScroll}>
        <div className="inline-block min-w-full align-middle">
          {/* HEADER */}
          <div
            className={cn(
              "bg-secondary border-border sticky top-0 z-20 flex border-b",
              headerClassName
            )}
          >
            {columns.map((col, i) => (
              <div
                key={i}
                className={cn(
                  "text-foreground px-5 py-3.5 text-[13px] font-semibold uppercase tracking-tight",
                  col.className,
                  col.sticky &&
                    cn(
                      "bg-secondary sticky left-0 z-30 transition-shadow duration-300",
                      isScrolled && "shadow-sm"
                    )
                )}
              >
                {col.header}
              </div>
            ))}
          </div>

          {/* BODY */}
          <div className={cn("divide-border/40 divide-y", tableBodyClassName)}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <div key={r} className="flex">
                  {columns.map((col, c) => (
                    <div
                      key={c}
                      className={cn("skeleton animate-shimmer h-12 px-5 py-4", col.className)}
                    />
                  ))}
                </div>
              ))
            ) : data.length === 0 ? (
              <div className="text-muted-foreground py-14 text-center text-sm font-medium">
                {emptyState || "Hakuna taarifa zilizopatikana."}
              </div>
            ) : (
              data.map((item, index) => {
                const id = getKey(item, index);
                const isSelected = selectedIds.includes(id);

                return (
                  <div
                    key={id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "hover:bg-item-hover flex cursor-pointer transition-colors",
                      isSelected && selectedRowClassName,
                      rowsClassName
                    )}
                  >
                    {columns.map((col, cIndex) => (
                      <div
                        key={cIndex}
                        className={cn(
                          "bg-card px-5 py-4 text-sm font-medium truncate",
                          col.className,
                          col.sticky &&
                            cn(
                              "sticky left-0 z-10 transition-shadow duration-300",
                              isScrolled && "shadow-sm"
                            )
                        )}
                      >
                        {col.render(item, index)}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}