// path: src/components/students/enroll-student-form.tsx

/**
 * @file Student enrollment wizard - modernized/minimal pass (v2).
 *
 * Mabadiliko kutoka toleo la awali:
 * - `InputLabel` (external) + `className={inputStyle}` ndio muundo
 *   sahihi wa kutumika (si `label` prop ya ndani ya Edu* - ni deprecated
 *   kwenye codebase hii).
 * - Stepper mpya (`EnrollmentStepper`) - horizontal, inayo-animate na
 *   framer-motion, badala ya ile ya awali (compact circle + prev/next).
 * - Fields zinazohusiana (jina la kwanza/kati/mwisho, gender/DOB,
 *   admission/entry year, PREMS/BEMIS/NECTA, jina/uhusiano la guardian,
 *   simu/barua pepe) sasa zipo kwenye `flex flex-col sm:flex-row` rows -
 *   kwenye vifaa vikubwa zinakaa kando kando (haziachi nafasi tupu),
 *   kwenye simu zinarudi wima kama kawaida.
 * - Date of Birth ina `max` (haiwezi kuwa siku zijazo).
 * - Entry Year ina `min`/`max` (mwaka mmoja nyuma hadi mmoja mbele).
 * - PREMS/BEMIS/NECTA zinatumia `type="id"` (zinaruhusu `-`/`_`/`/`).
 * - Review & Confirm: JSX inayorudiwa imetolewa kwenye `ReviewSection`/
 *   `ReviewItem` sub-components (DRY).
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  X,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { useEnrollStudentStore } from "@/lib/store";
import { EduInput } from "@/components/fields/EduInput";
import { EduSelect } from "@/components/fields/EduSelect";
import { EduDateInput } from "@/components/fields/EduDateInput/EduDateInput";
import { InputLabel } from "@/components/atoms";
import { useClassProfile, useSchoolClasses, useStudents } from "@/lib/hooks";
import { EduMainLoader, ThreeLoadingDot } from "@/components/atoms";
import type { EnrollStudentOutput, EnrollStudentResult } from "@/types";
import { isApiError } from "@/lib/api";
import { useToast } from "@/lib/store";
import { EnrollmentStepper } from "./EnrollmentStepper";
import { enrollSchema } from "@/lib/schemas";

interface ClassDataProp {
  classId: string;
  sectionId: string;
  streamId?: string;
}

export interface EnrollStudentFormProps {
  classData?: ClassDataProp;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

type OptionItem = { value: string; key: string };

const GENDERS: OptionItem[] = [
  { value: "MALE", key: "Male" },
  { value: "FEMALE", key: "Female" },
];

const RELATIONSHIPS: OptionItem[] = [
  { value: "PARENT", key: "Parent" },
  { value: "FATHER", key: "Father" },
  { value: "MOTHER", key: "Mother" },
  { value: "GUARDIAN", key: "Guardian" },
];

const TODAY_ISO = new Date().toISOString().slice(0, 10);
const CURRENT_YEAR = new Date().getFullYear();

/** Wrapper ndogo - label + field, kwa matumizi ndani ya flex rows. */
function Field({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex-1 min-w-0 space-y-1 ${className ?? ""}`}>{children}</div>;
}

export function EnrollStudentForm({ classData, onSuccess, onClose }: EnrollStudentFormProps) {
  const toast = useToast();
  const { formData, setProfileData, setAcademicData, setGuardianData, resetForm } = useEnrollStudentStore();
  const { enrollStudent, isEnrolling: isSubmitting } = useStudents();

  const inputStyle = "bg-white border border-slate-200 rounded-md";
  const hasClassContext = Boolean(classData?.classId && classData?.sectionId);

  const steps = useMemo(
    () =>
      hasClassContext
        ? [
          { id: "profile", title: "Personal Profile" },
          { id: "academic", title: "Academic Records" },
          { id: "guardian", title: "Guardian Details" },
          { id: "preview", title: "Review & Confirm" },
        ]
        : [
          { id: "placement", title: "Class Placement" },
          { id: "profile", title: "Personal Profile" },
          { id: "academic", title: "Academic Records" },
          { id: "guardian", title: "Guardian Details" },
          { id: "preview", title: "Review & Confirm" },
        ],
    [hasClassContext]
  );

  const [activeTab, setActiveTab] = useState<string>(steps[0].id);
  const [isEditing, setEditing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classData?.classId || "");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [studentRes, setStudentRes] = useState<EnrollStudentResult>({ studentId: "", systemId: "", message: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeIndex = steps.findIndex((s) => s.id === activeTab);

  const { classes, isLoading } = useSchoolClasses();
  const { classProfile, isLoading: loadingClass } = useClassProfile(selectedClassId);

  const classesOption: OptionItem[] = classes.map((cls) => ({ value: cls.id, key: cls.displayName }));
  const sectionsOption: OptionItem[] = (classProfile?.sections || []).map((s) => ({ value: s.id, key: s.name }));
  const streamsOption: OptionItem[] = (classProfile?.streams || []).map((s) => ({ value: s.id, key: s.name }));

  useEffect(() => {
    if (sectionsOption.length === 1 && formData.academic.sectionId !== sectionsOption[0].value) {
      setAcademicData({ sectionId: sectionsOption[0].value });
    }
  }, [sectionsOption, formData.academic.sectionId, setAcademicData]);

  useEffect(() => {
    if (streamsOption.length === 1 && formData.academic.streamId !== streamsOption[0].value) {
      setAcademicData({ streamId: streamsOption[0].value });
    }
  }, [streamsOption, formData.academic.streamId, setAcademicData]);

  function validateStep(stepId: string): boolean {
    if (stepId === "placement") {
      if (!selectedClassId) {
        toast.show({ message: "Please select a target class to proceed.", type: "error" });
        return false;
      }
      if (!formData.academic.sectionId) {
        toast.show({ message: "Please assign a specific section.", type: "error" });
        return false;
      }
    }

    if (stepId === "profile") {
      if (!formData.profile.firstName?.trim()) {
        toast.show({ message: "First name is required.", type: "error" });
        return false;
      }
      if (!formData.profile.lastName?.trim()) {
        toast.show({ message: "Last name is required.", type: "error" });
        return false;
      }
      if (!formData.profile.gender) {
        toast.show({ message: "Please select gender.", type: "error" });
        return false;
      }
      if (!formData.profile.dateOfBirth) {
        toast.show({ message: "Date of birth is required.", type: "error" });
        return false;
      }
    }

    if (stepId === "academic") {
      if (!formData.academic.admissionNo?.trim()) {
        toast.show({ message: "Admission number is required.", type: "error" });
        return false;
      }
      if (!formData.academic.entryYear) {
        toast.show({ message: "Entry year is required.", type: "error" });
        return false;
      }
    }

    if (stepId === "guardian") {
      if (!formData.guardian.fullName?.trim()) {
        toast.show({ message: "Guardian full name is required.", type: "error" });
        return false;
      }
      if (!formData.guardian.relationship) {
        toast.show({ message: "Please select guardian relationship.", type: "error" });
        return false;
      }
      if (!formData.guardian.phone?.trim()) {
        toast.show({ message: "Guardian contact number is required.", type: "error" });
        return false;
      }
    }

    return true;
  }

  function handleNextStep() {
    if (!validateStep(activeTab)) return;

    if (isEditing) {
      setEditing(false);
      setActiveTab("preview");
      return;
    }


    if (activeIndex < steps.length - 1) {
      setActiveTab(steps[activeIndex + 1].id);
    }
  }

  function handleTabChange(targetStepId: string) {
    const targetIndex = steps.findIndex((s) => s.id === targetStepId);
    if (targetIndex > activeIndex) {
      for (let i = activeIndex; i < targetIndex; i++) {
        if (!validateStep(steps[i].id)) return;
      }
    }
    setActiveTab(targetStepId);
  }

  function handleEdit(stepId: string) {
    setEditing(true);
    setActiveTab(stepId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    try {
      const rawPayload = {
        ...formData,
        academic: {
          ...formData.academic,
          entryYear: Number(formData.academic.entryYear),
          sectionId: classData?.sectionId || formData.academic.sectionId,
          streamId: classData?.streamId || formData.academic.streamId || null,
        },
        profile: { ...formData.profile, photoUrl: null },
      };

      const payload = enrollSchema.parse(rawPayload);
      const response = await enrollStudent(payload as EnrollStudentOutput);

      setSubmitted(true);
      onSuccess?.(response);
      setStudentRes(response.data);
    } catch (err: any) {
      setSubmitted(false);

      if (err?.name === "ZodError" || err?.issues) {
        const firstIssue = (err.issues || err.errors)?.[0];
        setSubmitError(`Validation Error: ${firstIssue?.message || "Please check your input details."}`);
      } else if (isApiError(err)) {
        setSubmitError(err.message || "Unable to complete student enrollment. Please try again.");
      } else {
        setSubmitError("An unexpected system error occurred. Please try again later.");
      }
    }
  }

  function handleResetAndNew() {
    resetForm?.();
    setIsAgreed(false);
    setSubmitted(false);
    setSubmitError(null);
    setActiveTab(steps[0].id);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-h-[540px] rounded-2xl flex flex-col justify-between py-5 px-2 sm:px-5"
    >
      {/* 1. STEPPER HEADER */}
      <div className="shrink-0 pb-4 max-w-md mx-auto w-full">
        <EnrollmentStepper steps={steps} activeIndex={activeIndex} onStepClick={handleTabChange} />
      </div>

      {/* 2. FORM BODY */}
      <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 py-4 max-w-3xl mx-auto w-full">
        {/* STEP: PLACEMENT */}
        {!hasClassContext && activeTab === "placement" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <span className="font-semibold block text-blue-950 mb-0.5">Class Placement Notice</span>
                Please select the target class and section/stream to assign this student before proceeding with enrollment.
              </div>
            </div>

            {isLoading ? (
              <div className="h-10 w-full bg-slate-50 animate-pulse rounded-md border border-slate-200 flex items-center px-3 gap-2 text-slate-400 text-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>
                  Loading classes<ThreeLoadingDot className="text-sm" />
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <InputLabel label="Select Class" required />
                <EduSelect
                  className={inputStyle}
                  options={classesOption}
                  valueKey="value"
                  labelKey="key"
                  value={selectedClassId}
                  onChange={(v) => {
                    setSelectedClassId(v as string);
                    setAcademicData({ sectionId: "", streamId: undefined });
                  }}
                />
              </div>
            )}

            {loadingClass ? (
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
                <div className="h-10 w-full bg-slate-100 animate-pulse rounded-md border border-slate-200 flex items-center px-3 gap-2 text-slate-400 text-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    Fetching class details<ThreeLoadingDot className="text-sm" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3.5">
                {sectionsOption.length > 0 && (
                  <Field className="animate-in fade-in duration-200">
                    <InputLabel label="Select Section" required />
                    <EduSelect
                      className={inputStyle}
                      options={sectionsOption}
                      valueKey="value"
                      disabled={sectionsOption.length === 1}
                      labelKey="key"
                      value={sectionsOption.length === 1 ? sectionsOption[0].value : formData.academic.sectionId}
                      onChange={(v) => setAcademicData({ sectionId: v as string })}
                    />
                  </Field>
                )}

                {streamsOption.length > 0 && (
                  <Field className="animate-in fade-in duration-200">
                    <InputLabel label="Stream (Optional)" />
                    <EduSelect
                      className={inputStyle}
                      options={streamsOption}
                      disabled={streamsOption.length === 1}
                      valueKey="value"
                      labelKey="key"
                      value={streamsOption.length === 1 ? streamsOption[0].value : formData.academic.streamId}
                      onChange={(v) => setAcademicData({ streamId: (v as string) || "" })}
                    />
                  </Field>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP: PERSONAL PROFILE */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field>
                <InputLabel label="First Name" required />
                <EduInput
                  className={inputStyle}
                  type="name"
                  required
                  placeholder="e.g. James"
                  value={formData.profile.firstName}
                  onChange={(v) => setProfileData({ firstName: v })}
                />
              </Field>
              <Field>
                <InputLabel label="Middle Name" />
                <EduInput
                  className={inputStyle}
                  type="name"
                  placeholder="e.g. John"
                  value={formData.profile.middleName}
                  onChange={(v) => setProfileData({ middleName: v })}
                />
              </Field>
              <Field>
                <InputLabel label="Last Name" required />
                <EduInput
                  className={inputStyle}
                  type="name"
                  required
                  placeholder="e.g. Doe"
                  value={formData.profile.lastName}
                  onChange={(v) => setProfileData({ lastName: v })}
                />
              </Field>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field>
                <InputLabel label="Gender" required />
                <EduSelect
                  className={inputStyle}
                  options={GENDERS}
                  valueKey="value"
                  placeholder="Select gender"
                  labelKey="key"
                  value={formData.profile.gender}
                  onChange={(g) => setProfileData({ gender: g as "MALE" | "FEMALE" })}
                />
              </Field>
              <Field>
                <InputLabel label="Date of Birth" required />
                <EduDateInput
                  className={inputStyle}
                  placeholder="Birth date"
                  max={TODAY_ISO}
                  value={formData.profile.dateOfBirth}
                  onChange={(date) => setProfileData({ dateOfBirth: date })}
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP: ACADEMIC DETAILS */}
        {activeTab === "academic" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field>
                <InputLabel label="Admission No" required />
                <EduInput
                  className={inputStyle}
                  type="id"
                  required
                  placeholder="ADM/2026/001"
                  value={formData.academic.admissionNo}
                  onChange={(v) => setAcademicData({ admissionNo: v })}
                />
              </Field>
              <Field>
                <InputLabel label="Entry Year" required />
                <EduDateInput
                  className={inputStyle}
                  mode="year"
                  required
                  placeholder="2026"
                  min={String(CURRENT_YEAR - 1)}
                  max={String(CURRENT_YEAR + 1)}
                  value={formData.academic.entryYear ? String(formData.academic.entryYear) : ""}
                  onChange={(v) => setAcademicData({ entryYear: v })}
                />
              </Field>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field>
                <InputLabel label="PREMS No" />
                <EduInput
                  className={inputStyle}
                  type="id"
                  placeholder="P1234567890"
                  value={formData.academic.premsNumber}
                  onChange={(v) => setAcademicData({ premsNumber: v })}
                />
              </Field>
              <Field>
                <InputLabel label="BEMIS No" />
                <EduInput
                  className={inputStyle}
                  type="id"
                  placeholder="B9876543210"
                  value={formData.academic.bemisNumber}
                  onChange={(v) => setAcademicData({ bemisNumber: v })}
                />
              </Field>
              <Field>
                <InputLabel label="NECTA Index No" />
                <EduInput
                  className={inputStyle}
                  type="id"
                  placeholder="S0123-0001-2026"
                  value={formData.academic.indexNo}
                  onChange={(v) => setAcademicData({ indexNo: v })}
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP: GUARDIAN INFORMATION */}
        {activeTab === "guardian" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field className="sm:flex-[2]">
                <InputLabel label="Guardian Full Name" required />
                <EduInput
                  className={inputStyle}
                  type="fullname"
                  required
                  placeholder="e.g. Mr John Doe"
                  value={formData.guardian.fullName}
                  onChange={(v) => setGuardianData({ fullName: v })}
                />
              </Field>
              <Field>
                <InputLabel label="Relationship" required />
                <EduSelect
                  className={inputStyle}
                  options={RELATIONSHIPS}
                  valueKey="value"
                  labelKey="key"
                  value={formData.guardian.relationship}
                  onChange={(r) => setGuardianData({ relationship: r as string })}
                />
              </Field>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Field>
                <InputLabel label="Phone Number" />
                <EduInput
                  className={inputStyle}
                  type="phone"
                  placeholder="+255712345678"
                  value={formData.guardian.phone}
                  onChange={(v) => setGuardianData({ phone: v })}
                />
              </Field>
              <Field>
                <InputLabel label="Email Address" />
                <EduInput
                  className={inputStyle}
                  type="email"
                  placeholder="johndoe@gmail.com"
                  value={formData.guardian.email}
                  onChange={(v) => setGuardianData({ email: v })}
                />
              </Field>
            </div>

            <Field>
              <InputLabel label="Home Address" />
              <EduInput
                className={inputStyle}
                type="text"
                placeholder="e.g. Temeke, Dar es Salaam"
                value={formData.guardian.homeAddress}
                onChange={(v) => setGuardianData({ homeAddress: v })}
              />
            </Field>
          </div>
        )}

        {/* STEP: REVIEW & CONFIRM */}
        {activeTab === "preview" && (
          <div className="flex flex-col gap-3 text-sm animate-in fade-in duration-200">
            {isSubmitting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
                <EduMainLoader />
                <div className="text-center space-y-1">
                  <span className="font-semibold text-slate-800">
                    Enrolling Student<ThreeLoadingDot />
                  </span>
                  <p className="text-[11px] text-slate-400">Please wait while we save the records.</p>
                </div>
              </div>
            ) : isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-3 w-full max-w-xs mx-auto text-center">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base tracking-tight">Enrollment Completed!</h4>
                    <p className="text-sm text-slate-500 mt-0.5">Student record has been successfully created.</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800">
                      {formData.profile.firstName} {formData.profile.middleName} {formData.profile.lastName}
                    </span>
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/60 text-blue-700 px-2.5 py-1 rounded-md">
                      <span className="text-sm font-medium text-blue-600/80">Student ID:</span>
                      <span className="font-mono text-sm font-bold">{studentRes.systemId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetAndNew}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Enroll Another
                  </button>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                    <button type="button" onClick={() => setSubmitError(null)} className="text-rose-400 hover:text-rose-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="p-2 bg-blue-50/60 border border-blue-100 rounded-lg text-blue-900 text-sm">
                  Review the details below carefully before confirming enrollment.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReviewSection title="Personal Profile" onEdit={() => handleEdit("profile")}>
                    <ReviewItem className="col-span-2" label="Full Name" value={`${formData.profile.firstName} ${formData.profile.middleName} ${formData.profile.lastName}`.trim()} />
                    <ReviewItem label="Gender" value={formData.profile.gender} />
                    <ReviewItem label="Date of Birth" value={formData.profile.dateOfBirth} />
                  </ReviewSection>

                  {!hasClassContext && (
                    <ReviewSection title="Class Placement" onEdit={() => handleEdit("placement")}>
                      <ReviewItem label="Class" value={classesOption.find((c) => c.value === selectedClassId)?.key} />
                      <ReviewItem label="Section" value={sectionsOption.find((s) => s.value === formData.academic.sectionId)?.key} />
                      {streamsOption.length > 0 && (
                        <ReviewItem label="Stream" value={streamsOption.find((s) => s.value === formData.academic.streamId)?.key} />
                      )}
                    </ReviewSection>
                  )}

                  <ReviewSection title="Academic Records" onEdit={() => handleEdit("academic")}>
                    <ReviewItem label="Admission No" value={formData.academic.admissionNo} mono />
                    <ReviewItem label="Entry Year" value={formData.academic.entryYear} />
                    <ReviewItem label="PREMS No" value={formData.academic.premsNumber} mono />
                    <ReviewItem label="BEMIS No" value={formData.academic.bemisNumber} mono />
                    <ReviewItem label="Index No" value={formData.academic.indexNo} mono />
                  </ReviewSection>

                  <ReviewSection title="Guardian Details" onEdit={() => handleEdit("guardian")}>
                    <ReviewItem label="Name" value={formData.guardian.fullName} />
                    <ReviewItem label="Phone" value={formData.guardian.phone} />
                    <ReviewItem label="Relationship" value={formData.guardian.relationship} />
                    <ReviewItem label="Email" value={formData.guardian.email} />
                    <ReviewItem className="col-span-2" label="Address" value={formData.guardian.homeAddress} />
                  </ReviewSection>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 pt-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="declaration" className="text-sm text-slate-600 leading-snug cursor-pointer select-none">
                    I confirm that the details provided above are accurate and verified for student enrollment.
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. FOOTER NAVIGATION */}
      {!isSubmitted && (
        <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between shrink-0 max-w-3xl mx-auto w-full">
          {activeIndex > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab(steps[activeIndex - 1].id)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-2.5 py-1.5 rounded-md hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {activeIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm shadow-blue-500/20 ml-auto"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isAgreed || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm shadow-blue-500/20 ml-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Submit Enrollment
                </>
              )}
            </button>
          )}
        </div>
      )}
    </form>
  );
}

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
        <span className="font-heading font-bold text-gray-600 uppercase leading-5 text-[12px]">{title}</span>
        <button type="button" onClick={onEdit} className="text-blue-600 font-semibold hover:underline text-[12px] cursor-pointer">
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-slate-600">{children}</div>
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value?: string | number | null;
  mono?: boolean;
  className?: string;
}

function ReviewItem({ label, value, mono, className }: ReviewItemProps) {
  return (
    <div className={className}>
      <span className="text-slate-500 block text-[12px] font-medium">{label}:</span>
      <strong className={`text-slate-800 ${mono ? "font-heading" : ""}`}>{value || "-"}</strong>
    </div>
  );
}