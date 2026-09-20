// path: src/pages/students/StudentEnrollPage.tsx

/**
 * @file "Enroll Student" - dedicated Vite route page (mpya).
 *
 * `EnrollStudentForm` awali ilijengwa ikitegemea kutumika ndani ya modal
 * pekee (`h-[540px]` fasta). Sasa form yenyewe ina `min-h` (flexible),
 * hivyo inafanya kazi vizuri IKIWA embedded (modal) NA kwenye full page -
 * page hii ndiyo njia mpya ya "full page" kwa matumizi kama enrollment
 * kubwa/ya kina isiyofaa kubanwa ndani ya modal ndogo.
 */
import { X, Upload, UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EnrollStudentForm, StudentsUploadsForm } from "./_components";
import { useDocumentMeta } from "@/lib/hooks";
import { useState } from "react";
import { EduButton } from "@/components/elements";

export const StudentEnrollPage = () => {
  useDocumentMeta({
    title: "Enroll Student",
    description: "Enroll a new student into the school management system.",
    noindex: true, // protected route
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"UPLOAD"| "FORM">("FORM")

  // Ikiwa page hii inafunguliwa kutoka ndani ya class fulani (mfano link
  // "Enroll student" kwenye class roster), context ya class inapita
  // kupitia query params - vinginevyo mtumiaji anachagua class mwenyewe
  // (step ya "Class Placement" inaonekana ndani ya form).

  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");
  const streamId = searchParams.get("streamId") ?? undefined;
  const classData = classId && sectionId ? { classId, sectionId, streamId } : undefined;

  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="relative z-10 w-full max-w-4xl  bg-white/90 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200 my-4 sm:my-0">
        <div className="flex items-center justify-between gap-3 w-full p-3 sm:p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-black tracking-tight text-lg sm:text-xl truncate">Enroll students</h1>
          </div>

          <div className="flex items-center gap-5">

            {mode === "FORM" ? (
              <EduButton
                onClick={() => setMode("UPLOAD")}
                className="text-sm bg-white text-gray-800 h-8 md:h-9 hover:bg-slate-50 border border-slate-200"
                icon={Upload}
              >
                Upload file
            </EduButton>
            ) : (
              <EduButton
                onClick={() => setMode("FORM")}
                className="text-sm bg-white text-gray-800 h-8 md:h-9 hover:bg-slate-50 border border-slate-200"
                icon={UserPlus}
              >
                Add manually
            </EduButton>
            )}
            
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="shrink-0 rounded-full h-10 w-10 grid place-items-center bg-muted/60 hover:bg-primary/10 hover:shadow-sm transition-all duration-300 text-foreground/70 hover:text-primary"
          >
            <X size={18} />
          </button>
          </div>
        </div>

        <div className="w-full flex flex-col items-center p-2 sm:p-3">
          {
            mode === "FORM" ? (
              <EnrollStudentForm classData={classData} onClose={() => navigate(-1)} />
            ) : (
              <StudentsUploadsForm classData={classData} onClose={() => navigate(-1)} />
            )
          }
          
        </div>
      </div>
    </main>
  );
}