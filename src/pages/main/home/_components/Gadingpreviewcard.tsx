/**
 * @file Modal ya "grading scale preview". Haikuwa na dependency yoyote ya
 * Next.js - inatumika bila mabadiliko Vite.
 */
import { cn } from "@/lib/utils";
import type { CompatibleGradingRule, GradingRange } from "@/types";
import { AlertCircle } from "lucide-react";

export interface GadingPreviewCardProps {
  selectedRule?: CompatibleGradingRule;
}

export function GadingPreviewCard({ selectedRule }: GadingPreviewCardProps) {
  if (!selectedRule) return null;

  const hasPoints = selectedRule.ranges.some((r: GradingRange) => r.points !== null && r.points !== undefined);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-3">
      <div className="w-full space-y-1">
        <h3 className="font-heading font-black">Grading Preview</h3>
        <div className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 px-3 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-xs leading-5 text-muted-foreground">
            This grading system will be used for result processing. Additional grading systems can be created
            after your workspace is active.
          </p>
        </div>
      </div>

      <div className="p-1 bg-card w-full rounded-md overflow-x-auto">
        <table
          className="w-full min-w-[280px] text-left border-separate border-spacing-0"
          aria-label={selectedRule.name ? `Grading scale for ${selectedRule.name}` : "Grading scale"}
        >
          <thead>
            <tr className="bg-muted/40">
              <th className="p-4 text-sm font-bold text-muted-foreground">Grade</th>
              <th className="p-4 text-sm font-bold text-muted-foreground">Range</th>
              {hasPoints && <th className="p-4 text-sm font-bold text-muted-foreground">Points</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {selectedRule.ranges.map((r: GradingRange) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className={cn("p-4 text-sm font-bold", r.isPass ? "text-green-600" : "text-red-600")}>{r.grade}</td>
                <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{r.minMark} - {r.maxMark}</td>
                {hasPoints && <td className="p-4 text-[11px] text-muted-foreground">{r.points ?? 0}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}