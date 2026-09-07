/**
 * ============================================================================
 * EduAsas String Utilities
 * ----------------------------------------------------------------------------
 * Shared types used across the String Utility Library.
 *
 * @author EduAsas
 * @version 1.0.0
 * ============================================================================
 */

/**
 * Represents any value that can safely be converted to a string.
 *
 * This type allows the utilities to gracefully handle nullable values
 * without throwing runtime errors.
 *
 * @example
 * const value: StringValue = "John";
 * const value: StringValue = null;
 * const value: StringValue = undefined;
 */
export type StringValue = string | null | undefined;

/**
 * Represents every available string transformation.
 *
 * Useful for strongly typed APIs, testing, logging,
 * and future plugin systems.
 */
export type TransformMethod =
  | "capitalize"
  | "sentenceCase"
  | "titleCase"
  | "upperCase"
  | "lowerCase"
  | "camelCase"
  | "pascalCase"
  | "snakeCase"
  | "kebabCase"
  | "constantCase";

/**
 * Generic string transformer.
 *
 * Receives a string and returns a transformed string.
 */
export type StringTransformer = (
  value: StringValue
) => string;

/**
 * A collection of named string transformers.
 */
export type StringTransformerMap = Record<
  TransformMethod,
  StringTransformer
>;