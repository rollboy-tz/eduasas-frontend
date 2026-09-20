/**
 * @file "Add School" route page - Vite/CSR version (imehama kutoka Next.js
 * App Router). Mabadiliko:
 * - `export const metadata` (Next.js Server Component API pekee) ->
 *   `useDocumentMeta()` hook (angalia `hooks/useDocumentMeta.ts`)
 * - `next/image` -> `<img>` ya kawaida
 * - `<Suspense>` iliyokuwa ikizunguka page nzima ilikuwa ni mahitaji ya
 *   Next.js App Router pekee (kwa ajili ya `useSearchParams` wakati wa
 *   SSR streaming) - Vite/CSR haihitaji hilo, `useSearchParams` ya
 *   react-router-dom ni hook ya kawaida, hivyo Suspense imeondolewa.
 * - `EduServerButton` (Next.js Server Component) haina maana Vite (kila
 *   kitu ni client-rendered) - imebadilishwa na button ya kawaida yenye
 *   `navigate(-1)`. **Angalia README - hii ni dhana, hakikisha inaendana
 *   na tabia halisi uliyokusudia.**
 */
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddSchoolForm } from "./_components";
import { useDocumentMeta } from "@/lib/hooks";

export const AddSchoolPage = () => {
  useDocumentMeta({
    title: "Add School",
    description: "Add your school to EduAsas platform and start managing it easily.",
    // Protected route (auth required) - haipaswi kuonekana kwenye search
    // results (angalia maelezo kamili kwenye README).
    noindex: true,
  });

  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="relative z-10 w-full max-w-4xl min-h-[70vh] md:min-h-[500px] bg-white/90 rounded-2xl flex flex-col items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-border/50 transition-all duration-300">
        <div className="flex items-center justify-between gap-3 w-full p-3 sm:p-4 border-b border-border/40">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icons/logo-128.png" alt="EduAsas Logo" width={40} height={40} className="shrink-0 rounded-md" />
            <h1 className="font-black tracking-tight text-lg sm:text-xl truncate">Add School</h1>
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
          <AddSchoolForm showSuccessModal />
        </div>
      </div>
    </main>
  );
}