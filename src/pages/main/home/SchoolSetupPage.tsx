/**
 * @file "School Setup" route page - Vite/CSR version. Angalia maelezo ya
 * mabadiliko kwenye AddSchoolPage.tsx (yanafanana - metadata hook,
 * `<img>` badala ya next/image, hakuna Suspense wrapper).
 */
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SchoolSetupForm } from "./_components";
import { useDocumentMeta } from "@/lib/hooks";

export const SchoolSetupPage = () => {
  useDocumentMeta({
    title: "Setup School",
    description: "Initialize your school by adding academic year and grading rules.",
    noindex: true, // protected route
  });

  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="relative z-10 w-full max-w-4xl min-h-[70vh] md:min-h-[500px] bg-white/90 rounded-2xl flex flex-col items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-border/50 transition-all duration-300">
        <div className="flex items-center justify-between gap-3 w-full p-3 sm:p-4 border-b border-border/40">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icons/logo-128.png" alt="EduAsas Logo" width={40} height={40} className="shrink-0 rounded-md" />
            <h1 className="font-black tracking-tight text-lg sm:text-xl truncate">School Set-up</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="shrink-0 rounded-full h-10 w-10 grid place-items-center bg-muted/60 hover:bg-primary/10 hover:shadow-sm transition-all duration-300 text-foreground/70 hover:text-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="w-full flex flex-col items-center">
          <SchoolSetupForm />
        </div>
      </div>
    </main>
  );
}