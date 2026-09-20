import { ClassSections } from "@/types";
import { Users, Layers, Edit3, Trash2, ShieldCheck } from "lucide-react";

interface SectionCardProps {
  section: ClassSections;
  isMainStream?: boolean; // Inatambua kama hii ndiyo default main stream
  onSelect?: (section: ClassSections) => void;
  onEdit?: (section: ClassSections) => void;
  onDelete?: (section: ClassSections) => void;
}

export const SectionCard = ({ 
  section, 
  isMainStream = false, 
  onSelect, 
  onEdit, 
  onDelete 
}: SectionCardProps) => {
  const capacity = section.capacity || 0;
  const current = section.currentStudents || 0;
  const available = section.availableSlots ?? Math.max(0, capacity - current);

  // Percentage calculation for class capacity fill
  const fillPercentage = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;

  return (
    <div 
      className="group relative rounded-xl bg-white border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between gap-4"
    >
      {/* Top Row: Section Name, Stream & Main Policy Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col cursor-pointer" onClick={() => onSelect?.(section)}>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {section.name}
            </h4>
            
            {/* Main Stream Policy Indicator Icon & Badge */}
            {isMainStream && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100" 
                title="Ths is default created section by system for easly students placement & management">
                <ShieldCheck className="h-3 w-3 text-indigo-600" />
                Main
              </span>
            )}
          </div>

          {section.stream?.name && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span>{section.stream.name}</span>
              {section.stream.code && (
                <span className="font-mono text-[11px] text-slate-400">
                  ({section.stream.code})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Status Percentage Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
              fillPercentage >= 90
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : fillPercentage >= 75
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {fillPercentage}% Full
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div 
        onClick={() => onSelect?.(section)}
        className="grid grid-cols-3 gap-2 py-3 px-3 border border-slate-100 bg-slate-50/70 rounded-lg cursor-pointer transition-colors hover:bg-slate-50"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Capacity
          </span>
          <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5">
            {capacity}
          </span>
        </div>

        <div className="flex flex-col border-x border-slate-200/60 px-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Enrolled
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-900 font-mono">
              {current}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Available
          </span>
          <span
            className={`text-xs font-semibold font-mono mt-0.5 ${
              available === 0 ? "text-rose-600 font-bold" : "text-slate-800"
            }`}
          >
            {available}
          </span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            fillPercentage >= 90
              ? "bg-rose-500"
              : fillPercentage >= 75
              ? "bg-amber-500"
              : "bg-indigo-600"
          }`}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>

      {/* Bottom Footer: Quick Actions & Policy Hint */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button 
          onClick={() => onSelect?.(section)}
          className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Manage Section &rarr;
        </button>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit?.(section)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit Section Details"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          
          <button 
            onClick={() => onDelete?.(section)}
            disabled={isMainStream}
            className={`p-1.5 rounded-md transition-colors ${
              isMainStream 
                ? "text-slate-200 cursor-not-allowed" 
                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            }`}
            title={isMainStream ? "Protected: Default Section Stream cannot be deleted directly" : "Move to Trash"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};