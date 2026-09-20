import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Layers,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

import { useWorkspace } from "@/shared/providers";
import { useClassContext } from "@/shared/contexts";
import { EduScreenLoader } from "@/components/elements";
import { AddSectionForm, SectionCard } from "./_components";
import { useClassSections } from "@/lib/hooks";
import { Button } from "@/components/atoms";
import { EduMainModal, showFeedback } from "@/components/modals";

export const ClassProfilePage = () => {
  const { classProfile } = useClassContext();
  const { setWorkspaceHeader } = useWorkspace();
  const [addSection, setAddSection] = useState(true);

  useEffect(() => {
    if (classProfile?.displayName) {
      document.title = `${classProfile.displayName} | EduAsas`;
    }
  }, [classProfile?.displayName]);

  useEffect(() => {
    if (classProfile?.displayName) {
      setWorkspaceHeader({ title: `${classProfile.displayName} - Dashboard` });
    }
  }, [setWorkspaceHeader]);

  if (!classProfile) return null;

  const { classSections, isLoading } = useClassSections(classProfile.id);

  if (isLoading) return (<EduScreenLoader loadingText="Pulling sections" />)


  return (
    <>
      <div className="space-y-6">
        {/* Banner / Intro Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xs bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Left: Title & Description */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {classProfile.displayName} Dashboard
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                Overview of active sections, subject assignments, and student enrollment statistics for this class level.
              </p>
            </div>

            {/* Right: Quick Action Buttons (Add Section & Add Stream) */}
            <div className="flex items-center gap-2.5 self-start lg:self-center">
              <Button
                
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 text-nowrap"
              >
                Add Stream
              </Button>

              <Button
                
                onClick={() => setAddSection((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-indigo-700 text-nowrap"
              >
                Add Section
              </Button>
            </div>

          </div>
        </div>

        {/* Information / Quick Links Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Quick Management
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Class Operations</span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={`/classes/${classProfile.classCode}/sections`}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 border border-amber-100/50">
                    <Layers className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-slate-900">Sections</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{classProfile.sectionsCount ?? 0} streams active</p>
                </div>
              </a>

              <a
                href={`/classes/${classProfile.classCode}/subjects`}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-slate-900">Subjects</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{classProfile.subjectsCount ?? 0} assigned</p>
                </div>
              </a>

              <a
                href={`/classes/${classProfile.classCode}/students`}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-100/50">
                    <Users className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-bold text-slate-900">Students</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{classProfile.studentsCount ?? 0} registered</p>
                </div>
              </a>
            </div>
          </div>

          {/* New feture branding space */}
          {/* Conditional Feature Card: Streams/Combinations or Clean Fallback */}
          {(classProfile.classCategory === "A-LEVEL" || classProfile.classCategory === "O-LEVEL") ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {classProfile.classCategory === "O-LEVEL" ? "Academic Streams" : "Combinations"}
                  </h3>
                  <span className="inline-flex items-center text-[10px] font-semibold text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded-md border border-indigo-100">
                    New Feature
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Module Status</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category Level</span>
                    <span className="font-bold text-slate-900 uppercase text-[11px]">
                      {classProfile.classCategory}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Stream configuration is fully active for this class tier.</span>
              </div>
            </div>
          ) : (
            /* Fallback Card for Primary Schools or Non-Stream Classes */
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Class Overview
                  </h3>
                  <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 py-0.5 px-2 rounded-md border border-slate-200">
                    Standard Tier
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Curriculum Structure</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      Primary PLSE Standard
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">System Mode</span>
                    <span className="font-bold text-slate-900 uppercase text-[11px]">
                      Unified Class
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-200/60 text-sm text-slate-600 flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Standard grading and reporting rules are applied automatically.</span>
              </div>
            </div>
          )}
        </div>


        <div className="w-full flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm p-5 shadow-2xs">
          {/* Header / Meta info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Class Sections ({classSections?.length || 0})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Manage administrative divisions and capacity distribution for this class.
              </p>
            </div>
            <span className="inline-flex self-start sm:self-center items-center text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
              Administrative Streams
            </span>
          </div>

          {/* Responsive Cards Grid or Empty Fallback */}
          {classSections && classSections.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                {classSections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isMainStream={classSections.length === 1 && index === 0}
                  />
                ))}
              </div>

              {/* System Notice for Single Main Stream */}
              {classSections.length === 1 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-xs sm:text-sm text-blue-900 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold">System Notice:</span> This current section is set as the default <span className="font-semibold underline">Main Stream</span>. It cannot be directly deleted until a new stream is added, and it will automatically revert back if all other streams are removed.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">No sections registered at the moment.</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the "Add Section" button above to create the first administrative stream for this class.
              </p>
            </div>
          )}
        </div>
      </div>

      <EduMainModal 
        onClose={() => setAddSection(false)}
        isOpen={addSection}
        size="md"
        className="bg-white/90 border-slate-200 p-3 rounded-lg"
      >
        <AddSectionForm
          classId={classProfile.id}
          onSuccess={() => {

            setAddSection(false)

            showFeedback({
              type: "success",
              title: "Section added",
              message: `Section successfully added to ${classProfile.displayName} class profile`,
              actions: [
                { label: "Ok", onClick: () => {}, variant: "secondary" }
              ]
            })
          }}
         />
      </EduMainModal>
    </>
  );
}