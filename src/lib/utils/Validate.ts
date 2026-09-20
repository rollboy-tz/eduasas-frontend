/**
 * @file Adapter ndogo inayobadilisha matokeo ya Zod (`safeParse`) kuwa
 * flat `{ [field]: message }` map ambayo form UI tayari inaielewa (badala
 * ya kila form kujifunza muundo wa Zod issues moja kwa moja).
 */
import type { z } from "zod";

export type FieldErrors = Record<string, string>;

export type ValidateResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

/**
 * Endesha Zod schema dhidi ya value, kisha rudisha ama data iliyo-parse
 * (yenye type sahihi kupitia `z.infer`), au error map iliyobanwa kwa
 * dot-joined path (mfano `"terms.1.startDate"`).
 *
 * @example
 * const result = validateWithZod(addSchoolSchema, formValues);
 * if (!result.success) {
 *   setErrors((prev) => ({ ...prev, ...result.errors }));
 *   return;
 * }
 * // result.data ina full type safety hapa
 */
export function validateWithZod<Schema extends z.ZodTypeAny>(
  schema: Schema,
  value: unknown
): ValidateResult<z.infer<Schema>> {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!errors[key]) errors[key] = issue.message; // ujumbe wa kwanza pekee kwa field moja
  }
  return { success: false, errors };
}