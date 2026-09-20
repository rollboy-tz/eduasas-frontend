import { EduScreenLoader } from "@/components/elements";
import { EduMainModal, showFeedback } from "@/components/modals";
import { useClassSections } from "@/lib/hooks";
import { SectionCard } from "./_components";
import { useNavigate } from "react-router-dom";
import { useClassContext } from "@/shared/contexts";

export const ClassSectionsPge = () => {
    const { classProfile } = useClassContext();
    const navigate = useNavigate();
    const { isLoading, classSections, isError, refresh } = useClassSections(classProfile?.id);

    if (isLoading) return (
        <EduScreenLoader loadingText="Pulling sections" />
    );

    if (isError || !classSections || classSections.length === 0) {
        showFeedback({
            type: "error",
            title: "Unable to pull sections",
            message: "Sections pulling process failed please try again or select section from class profile",
            actions: [
                { label: "Cancel", variant: "secondary", onClick: () => navigate(-1) },
                { label: "Retry", onClick: () => refresh() }
            ]
        });
    }

    const handleSelectSection = (sectionId: string) => {
        // Inampeleka mtumiaji kwenye path maalum ya section hiyo
        if (classProfile?.classCode) {
            navigate(`/classes/${classProfile.classCode}/sections/${sectionId}`);
        }
    };

    return (
        <EduMainModal isOpen={true} onClose={() => navigate(-1)} className="bg-white/95 border border-slate-200 p-5 rounded-2xl shadow-xl max-w-2xl">
            <div className="max-h-[550px] overflow-y-auto px-1 flex flex-col gap-4">
                
                {/* Header & Notice */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Select a section</h2>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs sm:text-sm text-blue-900 font-medium">
                        Select a section to work in. These sections belong to <span className="font-bold underline">{classProfile?.displayName || "this class"}</span>.
                    </div>
                </div>

                {/* Sections List Grid */}
                <div className="grid grid-cols-1 gap-3.5 pt-1">
                    {classSections?.map((section, index) => (
                        <div 
                            key={section.id} 
                            onClick={() => handleSelectSection(section.id)}
                            className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                        >
                            <SectionCard 
                                section={section} 
                                isMainStream={classSections.length === 1 && index === 0}
                                onSelect={(sec) => handleSelectSection(sec.id)}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </EduMainModal>
    );
};