// path: src/components/students/schemas/enroll.schema.ts

import { z } from "zod";

/**
 * ENROLLMENT VALIDATION SCHEMA
 * Production-grade schema ensuring complete data integrity for Profile, Academic, and Guardian records.
 */
export const enrollSchema = z.object({
  // 1. STUDENT PROFILE DATA
  profile: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),
    middleName: z
      .string()
      .trim()
      .max(50, "Middle name cannot exceed 50 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters"),
    gender: z.enum(["MALE", "FEMALE"], {
      message: "Please select a valid gender (MALE or FEMALE)",
    }),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must follow the standard YYYY-MM-DD format"),
    photoUrl: z
      .string()
      .url("Please provide a valid image URL")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  }),

  // 2. ACADEMIC RECORDS (Tanzanian Educational Standards)
  academic: z.object({
    admissionNo: z
      .string()
      .trim()
      .min(1, "Admission number is required"),
    sectionId: z
      .string()
      .min(25, "Please select a valid class section")
      .max(28, "Invalid Section identifier"),
    
    // Fallback logic friendly stream selector
    streamId: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    
    entryYear: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((year) => !isNaN(year) && year >= 2000 && year <= 2100, {
        message: "Please enter a valid entry academic year",
      }),
    
    premsNumber: z
      .string()
      .trim()
      .max(30, "PREMS number cannot exceed 30 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    bemisNumber: z
      .string()
      .trim()
      .max(30, "BEMIS number cannot exceed 30 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    indexNo: z
      .string()
      .trim()
      .max(30, "Index number cannot exceed 30 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  }),

  // 3. GUARDIAN & CONTACT DETAILS
  guardian: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(3, "Guardian's full name is required"),
      phone: z
        .string()
        .trim()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number is too long"),
      email: z
        .string()
        .email("Please provide a valid email address")
        .optional()
        .nullable()
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
      homeAddress: z
        .string()
        .trim()
        .min(3, "Please enter a valid home address")
        .optional()
        .nullable()
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
      relationship: z
        .string()
        .trim()
        .default("PARENT"),
    })
    .optional()
    .nullable(),
});

export type EnrollStudentInput = z.input<typeof enrollSchema>;
export type EnrollStudentOutput = z.output<typeof enrollSchema>;