import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Layers, MoreVertical, ChevronRight, Eye, Edit, Trash2,  School } from 'lucide-react';
import { MoreActionsList } from '@/components/modals';

interface ClassCardProps {
  schoolClass: {
    id: string;
    classCode: string;
    classCategory: string;
    status: string;
    isActive: boolean;
    displayName: string;
    shortName: string;
    streamsCount: number;
    sectionsCount: number;
    studentsCount: number;
    subjectsCount: number;
    createdAt: string;
  };
}

export const ClassCard: React.FC<ClassCardProps> = ({ schoolClass }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/classes/${schoolClass.classCode}`);
  };

  const classActions = [
    {
      label: 'View Class Details',
      onClick: handleNavigate,
      icon: <Eye size={14} />,
    },
    {
      label: 'Edit Class',
      onClick: () => console.log('Edit class', schoolClass.id),
      icon: <Edit size={14} />,
    },
    {
      label: 'Delete Class',
      onClick: () => console.log('Delete class', schoolClass.id),
      variant: 'danger' as const,
      icon: <Trash2 size={14} />,
    },
  ];

  return (
    <div
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
      className="group relative w-full w-full cursor-pointer select-none rounded-md border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-blue-300 shadow-sm hover:shadow-md hover:shadow-blue-500/5 active:scale-[0.99]"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white">
            <School className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                {schoolClass.displayName}
              </h3>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  schoolClass.isActive ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'
                }`}
              />
              <span className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {schoolClass.classCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Prevent propagation on action menu button */}
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <MoreActionsList
            trigger={
              <button
                type="button"
                aria-label="Class options"
                className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            actions={classActions}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs">
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-400">
            <Users className="h-3 w-3 flex-shrink-0 text-slate-400" />
            <span className="truncate">Students</span>
          </span>
          <span className="mt-0.5 text-xs font-semibold text-slate-800">
            {schoolClass.studentsCount}
          </span>
        </div>

        <div className="flex min-w-0 flex-col border-l border-slate-200/60 pl-2.5">
          <span className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-400">
            <BookOpen className="h-3 w-3 flex-shrink-0 text-slate-400" />
            <span className="truncate">Subjects</span>
          </span>
          <span className="mt-0.5 text-xs font-semibold text-slate-800">
            {schoolClass.subjectsCount}
          </span>
        </div>

        <div className="flex min-w-0 flex-col border-l border-slate-200/60 pl-2.5">
          <span className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-400">
            <Layers className="h-3 w-3 flex-shrink-0 text-slate-400" />
            <span className="truncate">Sections</span>
          </span>
          <span className="mt-0.5 text-xs font-semibold text-slate-800">
            {schoolClass.sectionsCount}
          </span>
        </div>
      </div>
    </div>
  );
};