import { showFeedback } from "@/components/modals";
import { useClassSections, useSectionProfile } from "@/lib/hooks";
import { useClassContext } from "@/shared/contexts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layers, ArrowLeft, UserPlus } from "lucide-react";
import { EduButton } from "@/components/elements";
import { cn } from "@/lib/utils";
import { SectionStudentsTable } from "./_components";

export const SectionProfile = () => {
    const params = useParams();
    const navigate = useNavigate();
    const paramSectionId = params?.sectionId as string;
    const { classProfile } = useClassContext();

    const { isLoading: loadingSections, classSections } = useClassSections(classProfile?.id);
    const [sectionId, setSectionId] = useState<string>("");

    // Hakikisha tunapata sectionId sahihi pindi classSections inapopatikana
    useEffect(() => {
        if (!loadingSections && classSections) {
            const foundSection = classSections.find((s) => s.id === paramSectionId);

            if (foundSection) {
                setSectionId(foundSection.id);
            } else if (classSections.length > 0) {
                // Kama haipo kwenye list au imekosekana, toa taarifa ya ulinzi (Forbidden)
                showFeedback({
                    type: "error",
                    isStrict: true,
                    message: "Forbidden: Access denied to the contents or provided details is incompatible with your access in this workspace.",
                    actions: [
                        { label: "Ok", onClick: () => navigate(-1) }
                    ]
                });
            }
        }
    }, [paramSectionId, classSections, loadingSections, navigate]);

    // Hapa tuna-fetch profile ya section husika mara tu sectionId inapopatikana
    const { isLoading: loadingProfile, sectionProfile } = useSectionProfile(sectionId);

    // Kama bado inatafuta section au profile ya kwanza
    if (loadingSections || (loadingProfile && !sectionProfile)) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-white/80 rounded-xl border border-slate-200">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-600">Loading section profile...</p>
                </div>
            </div>
        );
    }

    const data = sectionProfile;
    const capacity = data?.capacity || 0;
    const current = data?.currentStudents || 0;
    const fillPercentage = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0;

    return (
        <div className="w-full flex flex-col gap-6 pb-12">

            {/* Streamlined Enterprise Header & Core Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">

                {/* Left: Section Identity & Teacher Meta */}
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-1 p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                {data?.name || "Section Profile"}
                            </h1>
                            {data?.stream && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                                    <Layers className="h-3.5 w-3.5 text-slate-500" />
                                    {data.stream.name} ({data.stream.code})
                                </span>
                            )}
                        </div>

                        {/* Inline Teacher Meta (Compact & Clean) */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                            <span className="font-medium text-slate-400">Class Teacher:</span>
                            {data?.classTeacher ? (
                                <span className="font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    {data.classTeacher.firstName} {data.classTeacher.lastName} ({data.classTeacher.staffNumber})
                                </span>
                            ) : (
                                <span className="italic text-slate-400">Not assigned</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Compact Capacity & Fill Metrics Bar */}
                <div className="flex items-center gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex flex-col text-right">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capacity Status</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">
                            {current} / {capacity} <span className="text-xs font-normal text-slate-500">Students</span>
                        </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
                        <span className="text-sm font-bold text-indigo-600 font-mono">
                            {data?.availableSlots ?? 0} <span className="text-xs font-normal text-slate-500">Slots</span>
                        </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                    <span className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border",
                        fillPercentage >= 90 ? "bg-rose-50 text-rose-700 border-rose-200" :
                            fillPercentage >= 75 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                        {fillPercentage}% Full
                    </span>
                </div>

            </div>

            {/* Student Management Container / Table */}
            <div className="w-full flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                            Registered Students ({current})
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                            Manage students enrolled specifically in this section stream.
                        </p>
                    </div>
                    <EduButton
                        onClick={() => {
                            navigate(`/students/new?classId=${data?.parentClass.id}&sectionId=${data?.id}`)
                        }}
                        icon={UserPlus}
                        className="h-10 md:h-9 shadow-2xs">
                        Add Student
                    </EduButton>
                </div>

                {/* Student Table or Empty Fallback */}
                {current > 0 ? (
                    <>
                        <SectionStudentsTable sectionId={sectionProfile?.id} />
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                        <p className="text-sm font-semibold text-slate-700">No students registered in this section yet.</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Use the "Add Student" button above to assign students to this section.
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
};