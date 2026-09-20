/**
 * @file "Add School" multi-step form - Vite/CSR version.
 *
 * Mabadiliko makuu kutoka Next.js version:
 * - `useRouter`/`next/navigation` -> `useNavigate` (react-router-dom)
 * - Hakuna `"use client"` (haihitajiki nje ya Next.js App Router)
 * - Validation ya per-step na ya mwisho sasa inatumia Zod
 *   (`addSchoolStepSchemas`/`addSchoolSchema`) badala ya required-field
 *   checks za mkono - chanzo kimoja cha ukweli na payload halisi.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { useAddSchoolStore, useToast } from "@/lib/store";
import { useCategories, useUser } from "@/lib/hooks";
import { showFeedback, EduMainModal } from "@/components/modals";
import type { RegisteredSchool, SchoolRegistrationResponseData } from "@/types";
import { SchoolAddedCard } from "./SchoolAddedCard";
import { EduInput } from "@/components/fields/EduInput";
import { EduSelect } from "@/components/fields/EduSelect";

import {
  addSchoolSchema,
  addSchoolStepSchemas,
  type AddSchoolPayload,
} from "@/lib/schemas";
import { validateWithZod, type FieldErrors } from "@/lib/utils";
import { apiMutation, isApiError } from "@/lib/api";
import { EduLinearLoader, InputLabel } from "@/components/atoms";
import { EduButton } from "@/components/elements";

export interface AddSchoolFormProps {
  /** Ikiwa true, itaonyesha pop-up baada ya kufanikiwa. Default false. */
  showSuccessModal?: boolean;
  /** Hiari: fanya kitu kingine baada ya save (mfano analytics event). */
  onSuccessAction?: (schoolData: SchoolRegistrationResponseData["school"]) => void;
}

const TOTAL_STEPS = 4;

const STEP_INFO: Array<{ title: string; desc: string }> = [
  {
    title: "School Identity",
    desc: "Enter the official school name and government-issued registration number to verify your institution.",
  },
  {
    title: "Classification",
    desc: "Define your school's ownership type and the specific educational levels offered.",
  },
  {
    title: "Geographic Location",
    desc: "Specify the region and district. This helps in localizing system reports and analytics.",
  },
  {
    title: "Official Contacts",
    desc: "Provide verified contact details for administrative communication and system alerts.",
  },
];

/**
 * "Add School" wizard - 4 steps, Zod-validated kila step na kabla ya
 * final submit.
 */
export function AddSchoolForm({ showSuccessModal = false, onSuccessAction }: AddSchoolFormProps) {
  const {
    currentStep, nextStep, prevStep, setStepData, resetStore,
    name, registrationNumber, schoolType, categoryIds, region, district, email, phone,
  } = useAddSchoolStore();
  const navigate = useNavigate();
  const { refresh: mutate } = useUser();

  const toast = useToast();
  const { categories } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredSchool, setRegisteredSchool] = useState<RegisteredSchool>();

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const payload: AddSchoolPayload = {
    name, registrationNumber, schoolType, categoryIds, region, district, email, phone,
  };

  /**
   * Thibitisha field za step ya sasa kupitia Zod. Rudisha `true` kama
   * sawa, vinginevyo weka errors na uonyeshe toast, kisha rudisha `false`.
   */
  function validateStep(step: number): boolean {
    const schema = addSchoolStepSchemas[step as keyof typeof addSchoolStepSchemas];
    if (!schema) return true;

    const result = validateWithZod(schema, payload);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, ...result.errors }));
      const firstMessage = Object.values(result.errors)[0];
      toast.show({ message: firstMessage, type: "error" });
      return false;
    }
    return true;
  }

  function handleNextStep() {
    if (!validateStep(currentStep)) return;
    nextStep();
  }

  async function handleFinalSubmit() {
    // Zod inathibitisha PAYLOAD NZIMA hapa - si tu step ya mwisho -
    // hii inazuia data mbovu kutoka step za awali kupita kimya kimya
    // kama mtumiaji hakuwahi ku-blur field husika.
    const result = validateWithZod(addSchoolSchema, payload);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, ...result.errors }));
      toast.show({ message: Object.values(result.errors)[0], type: "error" });
      return;
    }

    if (errors) setErrors({});

    setIsSubmitting(true);
    try {
      const res = await apiMutation<SchoolRegistrationResponseData>(
        "post",
        "/school/register",
        result.data
      );

      if (res.status === "success") {
        const school = res.data.school;
        setRegisteredSchool(school);
        mutate();

        if (showSuccessModal) {
          setIsModalOpen(true);
        } else {
          toast.show({ message: "School added successfully!", type: "success" });
          navigate("/schools?refetch_data=needed", { replace: true });
          resetStore();
        }

        onSuccessAction?.(school);
      }
    } catch (err) {
      if (isApiError(err)) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
        showFeedback({
          type: "error",
          title: `Submission Error (${err.statusCode})`,
          message,
          actions: [
            { label: "Close", variant: "danger", onClick: () => { } },
            { label: "Retry", variant: "primary", onClick: () => handleFinalSubmit() },
          ],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStepSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (currentStep < TOTAL_STEPS) handleNextStep();
    else handleFinalSubmit();
  }

  const completeSetup = () => {
    const sId = registeredSchool?.schoolId;
    navigate(`/schools/setup?schoolId=${sId}`, { replace: true });
    resetStore();
  };

  const inputClasses = "bg-white border border-slate-200"

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <InputLabel label="School name" required />
              <EduInput
                required
                restrict="alphanumeric"
                transform="none"
                type="text"
                value={name}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("name"); setStepData({ name: val }); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <InputLabel label="Registration number" required />
              <EduInput
                required
                type="id"
                transform="none"
                placeholder="e.g. EM.12345"
                value={registrationNumber}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("registrationNumber"); setStepData({ registrationNumber: val }); }}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-6 relative z-50">
            <div className="flex flex-col gap-1">
              <InputLabel label="School ownership" required />
              <EduSelect
                labelKey="label"
                valueKey="value"
                multiple={false}
                value={schoolType}
                options={[
                  { label: "Private", value: "PRIVATE" },
                  { label: "Government", value: "GOVERNMENT" },
                ]}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("schoolType"); setStepData({ schoolType: val as "GOVERNMENT" | "PRIVATE" }); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <InputLabel label="School level" required />
              <EduSelect
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                labelKey="label"
                valueKey="value"
                value={categoryIds[0]}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("categoryIds"); setStepData({ categoryIds: val ? [val as string] : [] }); }}
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <InputLabel label="Located region" />
              <EduInput
                restrict="letters"
                transform="capitalize"
                value={region ?? ""}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("region"); setStepData({ region: val || null }); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <InputLabel label="Located district" />
              <EduInput
                restrict="letters"
                transform="capitalize"
                value={district ?? ""}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("district"); setStepData({ district: val || null }); }}
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <EduInput
                label="Official email"
                type="email"
                required={false}
                value={email ?? ""}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("email"); setStepData({ email: val || null }); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <EduInput
                label="Official phone"
                type="phone"
                required={false}
                value={phone ?? ""}
                className={inputClasses}
                size="lg"
                onChange={(val) => { clearError("phone"); setStepData({ phone: val || null }); }}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full h-1 px-1 relative overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {isSubmitting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <EduLinearLoader height={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleStepSubmit} className="w-full flex flex-col">
        <div className="flex flex-col md:flex-row min-h-[380px]">
          <div className="w-full md:w-[40%] shrink-0 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
            <motion.div key={`info-${currentStep}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-[320px] mx-auto md:mx-0">
              <p className="sr-only" aria-live="polite">
                Step {currentStep} of {TOTAL_STEPS}: {STEP_INFO[currentStep - 1].title}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600 leading-tight">
                {STEP_INFO[currentStep - 1].title}
              </h2>
              <p className="text-sm font-medium text-slate-600 mb-6 sm:mb-8">
                {STEP_INFO[currentStep - 1].desc}
              </p>
              <div
                className="flex gap-2"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={TOTAL_STEPS}
                aria-label={`Step ${currentStep} of ${TOTAL_STEPS}`}
              >
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                  <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s === currentStep ? "w-8 bg-blue-600" : "w-2 bg-slate-300"}`} />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-16">
            <div className="w-full max-w-[450px]">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-border/60 flex flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 sm:gap-4 rounded-b-2xl">
          <EduButton type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSubmitting} icon={ArrowLeft} className="flex-1 sm:flex-none sm:min-w-40">
            Back
          </EduButton>

          {currentStep < TOTAL_STEPS ? (
            <EduButton type="submit" icon={ArrowRight} iconPosition="right" className="flex-1 sm:flex-none sm:min-w-40">
              Continue
            </EduButton>
          ) : (
            <EduButton type="submit" isLoading={isSubmitting} icon={Check} iconPosition="right" loadingText="Submitting" className="flex-1 sm:flex-none sm:min-w-40">
              Submit
            </EduButton>
          )}
        </div>
      </form>

      <EduMainModal
        isOpen={isModalOpen}
        onClose={() => {
          resetStore();
          navigate(-1);
          setIsModalOpen(false);
        }}
        className="p-3 border-border/40 rounded-lg"
        size="sm"
      >
        <SchoolAddedCard school={registeredSchool} onButtonClick={completeSetup} />
      </EduMainModal>
    </>
  );
}