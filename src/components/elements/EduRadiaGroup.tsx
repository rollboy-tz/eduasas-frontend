"use client";

import React, { JSX } from "react";
import { cn } from "@/lib/utils/helper";

/**
 * Interface inayofafanua 'props' zinazopokelewa na `EduRadioGroup`.
 * 
 * @template T - Aina ya Object kwenye list (e.g. `{ id: string, name: string }`)
 * @template K - Key inayotumika kama unique identifier (default ni key yoyote ya T)
 */
export interface RadioGroupProps<
  T extends Record<string, any>,
  K extends keyof T = keyof T
> {
  /**
   * Mkusanyiko wa items/options zitakazoonyeshwa kwenye Radio Group.
   */
  options: T[];

  /**
   * Thamani iliyochaguliwa kwa sasa (inastahili kulingana na item[valueKey]).
   */
  value?: T[K];

  /**
   * Callback inayotokea wakati user anapobonyeza option yoyote.
   * Inaingiza item nzima iliyochaguliwa.
   */
  onChange: (item: T) => void;

  /**
   * Jina la key inayotumika kulinganisha thamani iliyochaguliwa (unique value identifier).
   */
  valueKey: K;

  /**
   * Jina la key ya kuonyesha kama jina au kichwa cha habari (Label/Title).
   */
  labelKey?: keyof T;

  /**
   * Jina la key ya kuonyesha maelezo ya ziada chini ya label (Description).
   */
  descriptionKey?: keyof T;

  /**
   * Custom render function ya kuweka Badge au Tag pembeni ya label.
   */
  renderBadge?: (item: T, selected: boolean) => React.ReactNode;

  /**
   * Custom render function ya kuweka content upande wa kulia wa card.
   */
  renderRight?: (item: T, selected: boolean) => React.ReactNode;

  /**
   * Custom render function ikiwa unataka kubadilisha mwonekano wote wa Label na Description.
   */
  renderLabel?: (item: T, selected: boolean) => React.ReactNode;

  /**
   * Zima (disable) radio group nzima isiweze kubonyezwa.
   * @default false
   */
  disabled?: boolean;

  /**
   * ClassName ya ziada kwa ajili ya mbeba radio zote (outer container).
   */
  className?: string;

  /**
   * ClassName ya ziada kwa ajili ya kila option/card.
   */
  itemClassName?: string;

  /**
   * Upande ambao kiashiria cha radio (Radio circle) kitatokea.
   * @default "right"
   */
  indicatorPosition?: "left" | "right";
}

/**
 * Component ndogo ya ndani inayorender duara la Radio Button.
 */
function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <div
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        selected
          ? "border-primary bg-primary shadow-sm"
          : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
      )}
    >
      {selected && (
        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
      )}
    </div>
  );
}

/**
 * **EduRadioGroup** — Single/Radio selection component yenye muundo wa kisasa (SaaS / Apple style).
 *
 * Imesukwa kusaidia data za aina yoyote (Generic Objects) na inatoa uwezo wa kubadilisha mwonekano
 * wa label, maelezo, badges, na indicator position kwa urahisi.
 *
 * @example
 * ```tsx
 * const frameworks = [
 *   { id: "necta", name: "PLSE NECTA", desc: "Matokeo kulingana na Baraza la Mtihani" },
 *   { id: "standard", name: "PLSE STANDARD", desc: "Mfumo wa kawaida wa shule" }
 * ];
 * 
 * const [selected, setSelected] = useState("necta");
 *
 * <EduRadioGroup * descriptionKey="desc" labelKey="name" onChange="{(item)" options="{frameworks}" value="{selected}" valueKey="id"> setSelected(item.id)}
 * />
 * ```
 */
export function EduRadioGroup<
  T extends Record<string, any>,
  K extends keyof T = keyof T
>({
  options,
  value,
  onChange,
  valueKey,
  labelKey,
  descriptionKey,
  renderBadge,
  renderRight,
  renderLabel,
  disabled = false,
  className,
  itemClassName,
  indicatorPosition = "right",
}: RadioGroupProps<T, K>): JSX.Element {
  return (
    <div
      role="radiogroup"
      className={cn("flex w-full flex-col gap-3", className)}
    >
      {options.map((item) => {
        const itemValue = item[valueKey] as T[K];
        const selected = itemValue === value;

        return (
          <button
            key={String(itemValue)}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(item)}
            className={cn(
              "group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
              selected
                ? "border-primary bg-primary/[0.04] shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/20",
              disabled && "cursor-not-allowed opacity-50",
              itemClassName
            )}
          >
            {/* Kiashiria cha Radio ikiwa kipo upande wa kushoto */}
            {indicatorPosition === "left" && (
              <RadioIndicator selected={selected} />
            )}

            {/* Content kuu ya Label & Description */}
            <div className="flex-1 min-w-0">
              {renderLabel ? (
                renderLabel(item, selected)
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    {labelKey && (
                      <span
                        className={cn(
                          "text-sm font-semibold tracking-tight transition-colors",
                          selected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {String(item[labelKey])}
                      </span>
                    )}

                    {renderBadge && renderBadge(item, selected)}
                  </div>

                  {descriptionKey && item[descriptionKey] && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {String(item[descriptionKey])}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Custom Content ya upande wa kulia */}
            {renderRight && (
              <div className="shrink-0">{renderRight(item, selected)}</div>
            )}

            {/* Kiashiria cha Radio ikiwa kipo upande wa kulia */}
            {indicatorPosition === "right" && (
              <RadioIndicator selected={selected} />
            )}
          </button>
        );
      })}
    </div>
  );
}