/**
 * =============================================================================
 * EduAsas String Utilities
 * -----------------------------------------------------------------------------
 * Public API entry point.
 * =============================================================================
 */

import { Text } from "./text";
import { transformers } from "./transform";
import type { StringValue } from "./types";


type TextAPI = {
  (value: StringValue): Text;
} & typeof transformers;


/**
 * Main text utility function.
 *
 * Supports both:
 *@example
 * Fluent:
 * text("hello world").titleCase()
 *
 * Direct:
 * text.titleCase("hello world")
 */
export const text = Object.assign(
  (value: StringValue) => new Text(value),
  transformers
) as TextAPI;