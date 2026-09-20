/**
 * @file Zod validation schemas kwa school onboarding flow (Add School +
 * School Setup). Hizi schemas ndizo "chanzo kimoja cha ukweli" cha valid
 * payload inayoonekana - UI (per-field error messages), TypeScript types
 * (kupitia z.infer), na hata backend zinaweza kutumia schema hizi hizi ili
 * client na server zisitofautiane kuhusu "valid" inamaanisha nini.
 */
import { z } from "zod";

/** Aina ya umiliki wa shule. */
export const schoolTypeSchema = z.enum(["PRIVATE", "GOVERNMENT"]);
export type SchoolType = z.infer<typeof schoolTypeSchema>;

/**
 * Payload kamili ya `POST /school/register`.
 *
 * `region`/`district`/`email`/`phone` ni hiari kwa hatua hii (zinakusanywa
 * lakini hazilazimishwi) - sawa na tabia ya awali ambapo step 3/4 hazikuwa
 * required, wakati `name`/`registrationNumber`/`schoolType`/`categoryIds`
 * ni lazima.
 */
export const addSchoolSchema = z.object({
  name: z
    .string({ error: "School name is required" })
    .trim()
    .min(2, "School name must be at least 2 characters"),
  registrationNumber: z
    .string({ error: "Registration number is required" })
    .trim()
    .min(2, "Registration number must be at least 2 characters"),
  schoolType: schoolTypeSchema,
  categoryIds: z.array(z.string()).min(1, "Please select at least one school level"),
  region: z.string().trim().nullable().optional(),
  district: z.string().trim().nullable().optional(),
  email: z
    .email("Enter a valid email address")
    .nullable()
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().nullable().optional(),
});

export type AddSchoolPayload = z.infer<typeof addSchoolSchema>;

/**
 * Schemas ndogo ndogo kwa kila step ya wizard - zinatumia `.pick()`
 * kutoka kwenye schema kuu, hivyo hazipotei sync kamwe na payload halisi
 * (ukibadilisha field kwenye `addSchoolSchema`, step schema inayoihusu
 * inasasika kiotomatiki, hakuna kuandika mara mbili).
 */
export const addSchoolStepSchemas = {
  1: addSchoolSchema.pick({ name: true, registrationNumber: true }),
  2: addSchoolSchema.pick({ schoolType: true, categoryIds: true }),
  3: addSchoolSchema.pick({ region: true, district: true }),
  4: addSchoolSchema.pick({ email: true, phone: true }),
} as const;

// ---------------------------------------------------------------------------
// School Setup
// ---------------------------------------------------------------------------

/** Term moja ya kitaaluma ndani ya mwaka wa masomo wa shule. */
export const termSchema = z
  .object({
    name: z.string().trim().min(1, "Term name is required"),
    startDate: z.string().min(1, "Term start date is required"),
    endDate: z.string().min(1, "Term end date is required"),
    order: z.number().int().positive(),
    isCurrent: z.boolean(),
  })
  .refine((term) => term.startDate < term.endDate, {
    message: "Term must close after it opens",
    path: ["endDate"],
  });

export type TermPayload = z.infer<typeof termSchema>;

/**
 * Payload kamili ya `POST /school/setup`.
 *
 * Cross-field rules (term ya kwanza/mwisho lazima ziambatane na mipaka ya
 * mwaka wa masomo, terms zisiingiliane, term MOJA tu iwe "current") ziko
 * kwenye `.superRefine` chini - hizi ndizo business rules zilizokuwa
 * zikithibitishwa kwa mkono ndani ya `validateWizard` awali; sasa Zod
 * ndiyo inayozibeba, kwa hiyo logic haiwezi kupotea sync na aina za data.
 */
export const schoolSetupSchema = z
  .object({
    year: z
      .object({
        value: z.number().int().min(2000).max(2050, "Enter a valid academic year"),
        startDate: z.string().min(1, "Academic year start date is required"),
        endDate: z.string().min(1, "Academic year end date is required"),
      })
      .refine((year) => year.startDate < year.endDate, {
        message: "Closing date must be after the opening date",
        path: ["endDate"],
      }),
    terms: z.array(termSchema).min(1, "At least one term is required"),
    primaryGrading: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { year, terms } = data;
    if (terms.length === 0) return;

    const first = terms[0];
    const last = terms[terms.length - 1];

    if (first.startDate !== year.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `First term must open on ${year.startDate}`,
        path: ["terms", 0, "startDate"],
      });
    }

    if (last.endDate !== year.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Final term must close on ${year.endDate}`,
        path: ["terms", terms.length - 1, "endDate"],
      });
    }

    for (let i = 1; i < terms.length; i++) {
      if (terms[i].startDate <= terms[i - 1].endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${terms[i].name} cannot start before ${terms[i - 1].name} closes`,
          path: ["terms", i, "startDate"],
        });
      }
    }

    if (!terms.some((t) => t.isCurrent)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select the currently active term",
        path: ["terms"],
      });
    }
  });

export type SchoolSetupPayload = z.infer<typeof schoolSetupSchema>;