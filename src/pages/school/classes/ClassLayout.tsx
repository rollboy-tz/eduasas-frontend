import { EduScreenLoader } from "@/components/elements";
import { EduMainModal } from "@/components/modals";
import { useSchoolClasses, useClassProfile } from "@/lib/hooks";
import { ClassProvider } from "@/shared/contexts";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";

export const ClassLayout =() => {
    const params = useParams();
    const navigate = useNavigate();
    const classCode = params?.code as string;

    const { classes, isLoading, isError, refresh } = useSchoolClasses();

    const [isErrorModalOpen, setErrorModalOpen] = useState(false);

    // 1. Inatafuta class husika kwenye cache/array
    const currentClass = useMemo(() => {
        if (!classes || !classCode) return null;
        return classes.find(
            (item) => item.classCode?.toLowerCase() === classCode?.toLowerCase()
        );
    }, [classes, classCode]);

    //2 Kuvuta class profile
    const {
        classProfile,
        refreshProfile,
        isUpdating,
        isError: profileError,
        isLoading: profileLoading
    } = useClassProfile(currentClass?.id);

    // 2. Handler ya kufunga modal na kurudi nyuma
    const handleModalClose = useCallback(() => {
        setErrorModalOpen(false);
        navigate("/classes");
    }, [navigate]);

    // Validation Guard Check
    useEffect(() => {
        if (!isLoading && (!classCode || isError || !currentClass)) {
            setErrorModalOpen(true);
        }
    }, [isLoading, classCode, isError, currentClass]);

    if (isLoading || profileLoading) {
        return <EduScreenLoader loadingText="Fetching class data" />;
    }

    if (!currentClass || isError || !classCode || profileError) {
        return (
            <div className="w-full py-12 text-center">
                <EduMainModal
                    isOpen={isErrorModalOpen}
                    size="sm"
                    onClose={handleModalClose}
                    className="rounded-lg border-slate-100 bg-white/70 p-2 shadow-2xl"
                >
                    <div className="flex flex-col items-center text-center  p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/50 mb-4">
                            <AlertTriangle className="h-6 w-6 stroke-[2.25]" />
                        </div>

                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {isError ? "Failed to Load Class Data" : "Class Profile Not Found"}
                        </h3>

                        <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[280px]">
                            {isError
                                ? "We encountered an issue fetching the class details. Please check your connection and try again."
                                : "No active class found matching the details. It may have been moved or deleted."}
                        </p>

                        <div
                            className={`mt-6 flex w-full items-center gap-2.5 border-t border-slate-100 pt-4 ${isError ? "justify-end" : "justify-center"
                                }`}
                        >
                            {/* Back to Classes Button */}
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer ${isError 
                                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20"
                                    }`}
                            >
                                <ArrowLeft
                                    className={`h-3.5 w-3.5 ${isError ? "text-slate-500" : "text-white"
                                        }`}
                                />
                                Back to Classes
                            </button>

                            {/* Primary Action: Try Again */}
                            {isError && refresh && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErrorModalOpen(false);
                                        refresh();
                                    }}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </EduMainModal>
            </div>
        );
    }

    return (
        <ClassProvider value={{
            classProfile,
            refreshProfile,
            isUpdating
        }}>
            <Outlet />
        </ClassProvider>);
}