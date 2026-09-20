/**
 * @file Modal ya "review before save" kwa School Setup wizard. Haikuwa
 * na dependency yoyote ya Next.js - inatumika bila mabadiliko Vite.
 */
import { DateUtils, cn  } from "@/lib/utils";
import { AlertCircle, Calendar, CalendarCheck2 } from "lucide-react";
import type { SchoolSetupPayload, TermPayload } from "@/lib/schemas";
import { Button } from "@/components/atoms";

export interface SetUpPreviewCardProps {
  dataPayload?: SchoolSetupPayload;
  onSave?: () => void;
  onClose?: () => void;
  onTermChange?: (order: number) => void;
  /** Onyesha loading state na zuia double-click wakati request inatumwa. */
  isSaving?: boolean;
}

export function SetUpPreviewCard({ dataPayload, onSave, onClose, onTermChange, isSaving = false }: SetUpPreviewCardProps) {
  if (!dataPayload) return null;

  return (
    <div className="w-full flex flex-col gap-5 px-1 py-2">
      <div className="space-y-1.5">
        <h2 className="font-heading text-base font-bold">Review School Setup</h2>

        <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-gray-50 px-3 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-blue-900" aria-hidden="true" />
          <p className="text-sm leading-5 text-gray-500">
            The first academic term has been selected as the current term by default. Please confirm or choose
            another term before saving, as it will be used as the active academic period for this workspace.
          </p>
        </div>

        <p className="text-xs font-medium text-muted-foreground">
          Academic Year <span className="font-bold text-primary">{dataPayload.year.value}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Select the current active term">
        {dataPayload.terms.map((term) => (
          <Term key={term.order} data={term} onClick={() => onTermChange?.(term.order)} disabled={isSaving} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <p className="text-xs text-gray-500 font-medium">Make sure the selected current term is correct before saving.</p>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            variant="ghost"
            className="flex-1 h-9 px-3 rounded-md"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 h-9 px-4 rounded-md "
          >
            {isSaving ? "Saving..." : "Save Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TermProps {
  data: TermPayload;
  onClick?: () => void;
  disabled?: boolean;
}

function Term({ data, onClick, disabled }: TermProps) {
  const status = data.isCurrent
    ? { label: "Current", icon: CalendarCheck2, className: "text-green-700 bg-green-100" }
    : { label: "Scheduled", icon: Calendar, className: "text-gray-500 bg-gray-100" };

  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={data.isCurrent}
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 min-w-0 px-2 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Calendar size={22} className="text-gray-500 shrink-0" aria-hidden="true" />
        <div className="flex flex-col text-left min-w-0">
          <span className="text-sm font-semibold text-gray-700 truncate">{data.name}</span>
          <span className="text-xs font-medium text-gray-500 truncate">
            {DateUtils.formatCustom(data.startDate)} - {DateUtils.formatCustom(data.endDate)}
          </span>
        </div>
      </div>
      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full shrink-0", "text-xs font-semibold", status.className)}>
        <StatusIcon size={13} aria-hidden="true" />
        {status.label}
      </div>
    </button>
  );
}