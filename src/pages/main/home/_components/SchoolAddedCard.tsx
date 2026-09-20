/**
 * @file Success card inayoonekana baada ya shule kufanikiwa kusajiliwa.
 * Haikuwa na dependency yoyote ya Next.js - mabadiliko hapa ni JSDoc,
 * type safety, na CSS bug fixes (typos halisi za Tailwind).
 */

import { text } from "@/lib/string";
import type { RegisteredSchool } from "@/types";
import { ArrowRight, Check, CheckCircle, CircleDashed, type LucideIcon, LayersPlusIcon } from "lucide-react";

export interface SchoolAddedCardProps {
  school?: RegisteredSchool;
  onButtonClick?: () => void;
}

interface ChecklistRowProps {
  icon: LucideIcon;
  label: string;
  status: "complete" | "waiting";
}

/** Row moja ya checklist - imetolewa kama sub-component (DRY, no repetition). */
function ChecklistRow({ icon: Icon, label, status }: ChecklistRowProps) {
  const isComplete = status === "complete";
  return (
    <div
      className={
        isComplete
          ? "rounded-md flex items-center justify-between gap-4 bg-green-50 border border-green-500 p-2 mt-1 first:mt-6"
          : "rounded-md flex items-center justify-between gap-4 bg-muted-100 border border-muted-300 p-2 mt-1"
      }
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={20} className={isComplete ? "text-green-900 shrink-0" : "text-muted-500 shrink-0"} aria-hidden="true" />
        <span className={`font-heading font-bold text-sm truncate ${isComplete ? "text-green-900" : "text-muted-500"}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-medium ${isComplete ? "text-green-700" : "text-muted-500"}`}>
          {isComplete ? "Complete" : "Waiting"}
        </span>
        {isComplete ? (
          <CheckCircle size={14} strokeWidth={2} className="text-green-900" aria-hidden="true" />
        ) : (
          <CircleDashed size={14} strokeWidth={2} className="text-muted-400" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

/** Onyeshwa ndani ya modal baada ya `POST /school/register` kufanikiwa. */
export function SchoolAddedCard({ school, onButtonClick }: SchoolAddedCardProps) {
  if (!school) return null;

  return (
    <div className="flex flex-col px-2 sm:px-0 py-8 sm:py-10">
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-full bg-green-500/20 p-3 mb-5">
          <div className="rounded-full bg-green-500/80 p-2">
            <Check className="text-white" strokeWidth={3} size={30} aria-hidden="true" />
          </div>
        </div>

        <h2 className="font-heading font-black text-xl text-green-600 my-2 text-center">Added Completely!</h2>
        <p className="font-heading font-bold text-sm text-center break-words max-w-full">{text.upperCase(school.name)}</p>
        <p className="text-xs text-muted-500 text-center">Were successfully added to the system.</p>

        <div className="w-full">
          <ChecklistRow icon={LayersPlusIcon} label="Add school" status="complete" />
          <ChecklistRow icon={LayersPlusIcon} label="Setup school" status="waiting" />
        </div>

        <button
          type="button"
          onClick={onButtonClick}
          className="bg-blue-600 text-white font-medium py-2 px-8 text-sm flex items-center justify-center cursor-pointer gap-3 mt-5 rounded-md shadow-sm hover:bg-blue-500 transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <span>Complete setup</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}