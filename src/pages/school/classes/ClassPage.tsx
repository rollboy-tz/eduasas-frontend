import { EduMainModal } from "@/components/modals";
import { AddClassForm, ClassesWrapper } from "./_components";
import { useWorkspace } from "@/shared/providers";
import { useToast } from "@/lib";
import { useSchoolClasses } from "@/lib/hooks";
import { JSX, useEffect, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";

export const ClassesPage = (): JSX.Element => {

  const { setWorkspaceHeader } = useWorkspace();
  useEffect(() => {
    setWorkspaceHeader({ title: "Classes" });
  }, [setWorkspaceHeader]);

  const { refresh: reloadClasses } = useSchoolClasses();
  const [formOpen, setFormOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="w-full space-y-6">
      {/* Header / Hero Banner */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 shadow-sm">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-blue-200/60" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full border border-indigo-200/60" />
          <div className="absolute right-24 top-6 h-2 w-2 rounded-full bg-blue-300" />
          <div className="absolute bottom-8 left-20 h-2 w-2 rounded-full bg-indigo-300" />
        </div>

        {/* Content Row */}
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <GraduationCap className="h-3.5 w-3.5" />
              Academic Structure
            </span>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create and manage classes
            </h1>

            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Organize your school's academic levels by creating classes where students, subjects, and learning activities will be managed.
            </p>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Class</span>
          </button>
        </div>
      </div>

      {/* Classes Cards Section */}
      <ClassesWrapper />

      {/* Add Class Modal */}
      <EduMainModal
        isOpen={formOpen}
        size="sm"
        onClose={() => setFormOpen(false)}
        className="rounded-xl border-slate-100 p-1"
      >
        <AddClassForm
          onSuccess={() => {
            setFormOpen(false);
            reloadClasses();
            const message = "Class added successfully!";
            toast.show({ message, type: "success" });
          }}
        />
      </EduMainModal>
    </div>
  );
};