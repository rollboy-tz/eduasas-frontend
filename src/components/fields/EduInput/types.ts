import type { EngineMessages } from "./messages";

/**
 * Aina moja ya InputType inayotumika KILA MAHALI - kwenye component na engine.
 *
 * BUG ILIYOREKEBISHWA: awali component (EduModernInputV2) ilikuwa na type yake
 * yenyewe `inputTypeV2` (haikuwa na "number"), tofauti na `InputType` ya
 * engine (yenye "number"). Zilikuwa zinaweza kutofautiana bila TypeScript
 * kukamata hitilafu - sasa ni chanzo kimoja tu.
 */
export type InputType =
  | "text"
  | "contact"
  | "email"
  | "password"
  | "confirm"
  | "number"
  | "phone"
  | "url"
  | "fullname"
  | "name"
  | "id";

export type RestrictType = "letters" | "numbers" | "alphanumeric" | "none";

export type TransformType = "uppercase" | "lowercase" | "capitalize" | "none";

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export interface ValidationContext {
  /** Password ya kulinganisha - kwa type "confirm". */
  password?: string;
  /** Messages za kutumia - ikiwa haipo, inatumia default. Kwa i18n/override. */
  messages?: EngineMessages;
}

export type Validator = (value: string, context?: ValidationContext) => ValidationResult;

export interface EngineOptions {
  value?: string;
  type?: InputType;
  required?: boolean;
  transform?: TransformType;
  restrict?: RestrictType;
  /** Password ya kulinganisha - kwa type "confirm". */
  password?: string;
  /** Idadi ya juu ya herufi. */
  maxValue?: number;
  /** Idadi ya chini ya herufi. */
  minValue?: number;
  disabled?: boolean;
  /** Override sehemu ya messages unayotaka - kwa i18n/brand voice. */
  messages?: Partial<EngineMessages>;
  onChange?: (value: string) => void;
  onError?: (error: string | null) => void;
}