/**
 * @file "School Setup" multi-step form - Vite/CSR version.
 *
 * Mabadiliko makuu kutoka Next.js version:
 * - `next/navigation` -> `react-router-dom` (`useNavigate`, `useSearchParams`)
 * - `validateWizard()` ya mkono imeondolewa - `schoolSetupSchema` (Zod,
 *   ikiwa na cross-field `.superRefine`) ndiyo sasa inayothibitisha
 *   payload nzima kabla ya submit; hairudiwi mara mbili (logic moja tu).
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

import { useSchoolSetupStore, useToast } from "@/lib/store";
import { useCompatibleGrading, useUser } from "@/lib/hooks";
import type { CompatibleGradingRule } from "@/types";
import { EduLinearLoader, EduMainLoader, InputLabel } from "@/components/atoms";
import { EduDateInput } from "@/components/fields/EduDateInput";
import { EduInput } from "@/components/fields/EduInput";
import { EduMainModal, showFeedback } from "@/components/modals";
import { GadingPreviewCard } from "./Gadingpreviewcard";
import { SetUpPreviewCard } from "./Setuppreviewcard";
//import { SchoolSetuCompletdCard } from "./SchoolSetupCompletedCard";

import { schoolSetupSchema, type SchoolSetupPayload } from "@/lib/schemas";
import { validateWithZod } from "@/lib/utils";
import { apiMutation, isApiError } from "@/lib/api";
import { EduButton, EduScreenLoader, EduRadioGroup } from "@/components/elements";

/** Idadi ya terms - haichaguliwi na mtumiaji, imewekwa default. */
const DEFAULT_TERM_COUNT = 2;

export function SchoolSetupForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get("schoolId");

  const toast = useToast();
  const { schools, isLoading: isLoadingSchools } = useUser();

  const currentSchool = useMemo(() => schools?.find((s) => s.schoolId === schoolId), [schools, schoolId]);
  const { globalRules, isLoading: isLoadingRules } = useCompatibleGrading(currentSchool);

  const {
    currentStep, nextStep, prevStep,
    primaryGrading, setGrading,
    year, updateYear, resetSetup,
    initializeTerms, updateTerm,
  } = useSchoolSetupStore();

  const terms = useSchoolSetupStore((state) => state.terms);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [previewRange, setPreviewRange] = useState(false);
  const [finalView, setFinalView] = useState(false);
  const [modalView, setModalView] = useState<"NONE" | "ACTIVE_GUARD">("NONE");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingSchools || isLoadingRules) setHasTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoadingSchools, isLoadingRules]);

  useEffect(() => {
    if (!isLoadingSchools && schoolId && !currentSchool) {
      toast.show({ message: "School not found.", type: "error" });
    }
    if (currentSchool && currentSchool.status !== "PENDING") {
      setModalView("ACTIVE_GUARD");
    }
  }, [currentSchool, isLoadingSchools, schoolId]);

  useEffect(() => {
    if (globalRules && globalRules.length === 1 && !primaryGrading) {
      setGrading!(globalRules[0].code);
    }
  }, [globalRules, primaryGrading, setGrading]);

  // Terms hazichaguliwi tena na mtumiaji - default inawekwa mara moja tu,
  // kama store bado ipo kwenye hali yake ya awali (haijaguswa).
  useEffect(() => {
    if (terms.length !== DEFAULT_TERM_COUNT && terms.every((t) => !t.startDate && !t.endDate)) {
      initializeTerms(DEFAULT_TERM_COUNT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSteps = useMemo(() => 2 + (terms?.length || 0), [terms?.length]);

  useEffect(() => {
    if (terms.length > 0) {
      if (terms[0].startDate !== year.startDate) updateTerm(0, { startDate: year.startDate });
      const lastIndex = terms.length - 1;
      if (terms[lastIndex].endDate !== year.endDate) updateTerm(lastIndex, { endDate: year.endDate });
    }
  }, [year.startDate, year.endDate, terms.length]);

  const isLoading = (isLoadingSchools || isLoadingRules || isSubmitting) && !hasTimedOut;
  const selectedRule = globalRules?.find((r: CompatibleGradingRule) => r.code === primaryGrading);

  if (isLoadingSchools) return <EduScreenLoader />;
  if (!schools || schools.length === 0) return null;

  if (modalView === "ACTIVE_GUARD") {
    return (
      <EduMainModal isOpen size="sm" className="p-6 border-border/40 rounded-lg" onClose={() => navigate(-1)}>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="rounded-full bg-amber-500/10 p-3">
            <ShieldAlert className="text-amber-600" size={28} />
          </div>
          <h3 className="font-heading font-bold text-lg">Setup not available</h3>
          <p className="text-sm text-muted-foreground">
            This school has already been set up or is no longer pending setup.
          </p>
          <EduButton variant="ghost" onClick={() => navigate(-1)} className="mt-2 min-w-40">
            Go back
          </EduButton>
        </div>
      </EduMainModal>
    );
  }

  const payload: SchoolSetupPayload = {
    year: { value: Number(year.value), startDate: year.startDate, endDate: year.endDate },
    terms: terms.map((t) => ({ name: t.name, startDate: t.startDate, endDate: t.endDate, order: t.order, isCurrent: t.isCurrent })),
    ...(primaryGrading && globalRules.length > 1 ? { primaryGrading } : {}),
  };

  const handleNext = () => {
    if (currentStep === 1 && !primaryGrading) {
      return toast.show({ message: "Please select a grading system.", type: "error" });
    }
    if (currentStep === 2) {
      if (!year.startDate || !year.endDate) return toast.show({ message: "Set both Start and End dates.", type: "error" });
      if (year.startDate >= year.endDate) return toast.show({ message: "Closing date must be after the opening date.", type: "error" });
    }
    if (currentStep > 2) {
      const termIdx = currentStep - 3;
      const term = terms[termIdx];
      if (!term.name.trim()) return toast.show({ message: "Term name is required.", type: "error" });
      if (!term.startDate || !term.endDate) return toast.show({ message: `Set dates for ${term.name}.`, type: "error" });
    }
    if (currentStep < totalSteps) nextStep();
  };

  const openPreview = () => setFinalView(true);

  const handleCurrentTerm = (order: number) => {
    terms.forEach((term, index) => updateTerm(index, { isCurrent: term.order === order }));
  };

  const handleSubmit = async () => {
    // Zod - cross-field rules zote (boundaries, overlaps, active term)
    // ndani ya schema moja - badala ya `validateWizard()` ya mkono.
    const result = validateWithZod(schoolSetupSchema, payload);
    if (!result.success) {
      const firstMessage = Object.values(result.errors)[0];
      toast.show({ message: firstMessage ?? "Data validation failed, please retry.", type: "error" });
      return;
    }

    setFinalView(false);
    setIsSubmitting(true);
    try {
      if (!currentSchool) return;
      const setupEndpointURL = `/school/setup?schoolUId=${currentSchool.schoolUId}`;
      const res = await apiMutation("post", setupEndpointURL, result.data);
      if (res.status === "success") {
        showFeedback({
          type: "success",
          message: "Setup Copleted: Congtulation your succeffully added initial academics details to your school workspace and it's completely activated. You you can switch it and start working on.",
          actions: [
            { label: "Not Now", variant: "secondary", onClick: () => { resetSetup(), navigate("/schools?refetch_data=needed", { replace: true }) } },
            { label: "Switch Workspace", variant: "primary", onClick: () => { resetSetup(), navigate(`/schools/switch-workspace?school_slug=${currentSchool.slug}&school_id=${currentSchool.schoolId}&new_setup=true`) } }
          ]
        })
      }
    } catch (e) {
      if (isApiError(e)) {
        showFeedback({
          type: "error",
          title: `Setup failed (${e.statusCode})`,
          message: e.message || "School steup failed please check your internet connection and try agin, If this persist please contact us",
          actions: [
            { label: "Let's Retry", onClick: () => { }, variant: "primary" }
          ]
        })
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "bg-white border border-slate-200"

  const renderGradingStep = () => (
    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6">
      <EduRadioGroup<CompatibleGradingRule>
        options={globalRules}
        valueKey="code"
        labelKey="name"
        value={primaryGrading ?? ""}
        onChange={(item) => setGrading!(item.code)}
        renderBadge={() => (
          <>
            {globalRules.length === 1 && (
              <span className="text-[9px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-black tracking-widest">
                Default
              </span>
            )}
          </>
        )}
      />
      <button
        type="button"
        disabled={!selectedRule}
        onClick={() => selectedRule && setPreviewRange(true)}
        className={`rounded-md p-2 text-white transition-all duration-300 ${selectedRule ? "bg-blue-500 cursor-pointer hover:bg-blue-400 active:scale-[0.98]" : "bg-blue-200"}`}
      >
        {selectedRule ? (
          <span className="text-sm font-semibold">Preview ranges & details</span>
        ) : (
          <span className="text-xs">Select a grading rule to preview.</span>
        )}
      </button>
    </motion.div>
  );

  const renderYearConfigStep = () => (
    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6">
      <div className="w-full flex flex-col gap-1">
        <InputLabel label="Academic year" />
        <EduDateInput
          mode="year"
          value={year.value.toString()}
          onChange={(val) => updateYear({ value: Number(val) })}
          className={inputClasses}
          size="lg"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full flex flex-col gap-1">
          <InputLabel label="Year opens date" />
          <EduDateInput
            mode="date" outputFormat="iso-datetime"
            value={year.startDate}
            max={year.endDate || undefined}
            onChange={(val) => updateYear({ startDate: val })}
            className={inputClasses}
            size="lg"
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <InputLabel label="Year closes date" />
          <EduDateInput
            mode="date" value={year.endDate}
            outputFormat="iso-datetime"
            min={year.startDate || undefined}
            onChange={(val) => updateYear({ endDate: val })}
            className={inputClasses}
            size="lg"
          />
        </div>
      </div>
      <p className="text-xs text-muted-500">This academic year is organized into {DEFAULT_TERM_COUNT} terms.</p>
    </motion.div>
  );

  const renderTermStep = (index: number) => {
    const term = terms[index];
    if (!term) return null;
    const minStart = index === 0 ? year.startDate : terms[index - 1]?.endDate;
    const maxEnd = index === terms.length - 1 ? year.endDate : undefined;

    return (
      <motion.div key={`term-${index}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 gap-8">
        <div className="w-full flex flex-col gap-1">
          <InputLabel label="Term name" />
        <EduInput
          required 
          placeholder="Eg: Semister I"
          restrict="alphanumeric"
          value={term.name}
          className={inputClasses}
          size="lg"
          onChange={(val) => updateTerm(index, { name: val })}
        />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full flex flex-col gap-1">
            <InputLabel label="Term opens date" />
            <EduDateInput
              className={inputClasses}
              size="lg"
              value={term.startDate}
              outputFormat="iso-datetime"
              min={minStart || undefined}
              max={term.endDate || year.endDate || undefined}
              onChange={(val) => updateTerm(index, { startDate: val })}
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <InputLabel label="Term closes date" />
            <EduDateInput
              className={inputClasses}
              size="lg"
              value={term.endDate}
              outputFormat="iso-datetime"
              min={term.startDate || minStart || undefined}
              max={maxEnd || undefined}
              onChange={(val) => updateTerm(index, { endDate: val })} />
          </div>
        </div>

      </motion.div>
    );
  };

  const renderStep = () => {
    if (currentStep === 1) return renderGradingStep();
    if (currentStep === 2) return renderYearConfigStep();
    return renderTermStep(currentStep - 3);
  };

  return (
    <>
      <div className="w-full flex flex-col">
        <div className="w-full h-1 relative overflow-hidden" aria-hidden="true">
          <AnimatePresence>{(isSubmitting || isLoading) && <EduLinearLoader height={3} />}</AnimatePresence>
        </div>

        <div className={`flex flex-col md:flex-row min-h-[320px] transition-all duration-300 ${isLoading || isSubmitting ? "opacity-0" : ""}`}>
          <div className="w-full md:w-[40%] shrink-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
            <div className="text-[10px] font-black text-primary mb-2 tracking-[0.3em] uppercase opacity-70">
              Step {currentStep} / {totalSteps}
            </div>
            <p className="sr-only" aria-live="polite">
              {currentStep === 1 && "Grading Rules"}
              {currentStep === 2 && "Academic Year"}
              {currentStep > 2 && terms[currentStep - 3]?.name}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight">
              {currentStep === 1 && "Grading Rules"}
              {currentStep === 2 && "Academic Year"}
              {currentStep > 2 && terms[currentStep - 3]?.name}
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              {currentStep === 1 && "Automate performance tracking and criteria. Select a standard framework to begin setup."}
              {currentStep === 2 && "Configure your academic year timeline. Terms are created automatically once dates are set."}
              {currentStep > 2 && `Specify the opening and closing boundaries for ${terms[currentStep - 3]?.name}.`}
            </p>
            <div className="flex gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${currentStep} of ${totalSteps}`}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i + 1 === currentStep ? "w-8 bg-blue-600" : "w-2 bg-slate-300"}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-border/60 flex items-center gap-3 min-h-[100px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isLoading ? (
              <motion.div key="buttons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 w-full">
                <EduButton variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSubmitting} icon={ArrowLeft} className="flex-1 sm:flex-none sm:min-w-40">
                  Back
                </EduButton>
                <EduButton onClick={currentStep < totalSteps ? handleNext : openPreview} isLoading={isSubmitting} icon={currentStep < totalSteps ? ArrowRight : CheckCircle2} loadingText="Setting up" className="flex-1 sm:flex-none sm:min-w-40">
                  {currentStep < totalSteps ? "Continue" : "Finish up"}
                </EduButton>
              </motion.div>
            ) : (
              <motion.div key="loader" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex items-center gap-3 w-full justify-center md:justify-end">
                <EduMainLoader size={24} />
                <motion.h3 initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-sm tracking-tight">
                  Finishing setup...
                </motion.h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <EduMainModal isOpen={previewRange} size="lg" className="p-3 bg-white border-slate-200 rounded-lg" onClose={() => setPreviewRange(false)}>
        <GadingPreviewCard selectedRule={selectedRule} />
      </EduMainModal>

      <EduMainModal isOpen={finalView} size="md" onClose={() => setFinalView(false)} className="p-3 rounded-lg bg-white border-slate-200 border-border/40">
        <SetUpPreviewCard onClose={() => setFinalView(false)} onTermChange={handleCurrentTerm} onSave={handleSubmit} dataPayload={payload} isSaving={isSubmitting} />
      </EduMainModal>

    </>
  );
}