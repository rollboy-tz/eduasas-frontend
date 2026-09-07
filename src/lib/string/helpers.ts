/**
 * =============================================================================
 * EduAsas String Utilities
 * -----------------------------------------------------------------------------
 * Internal helper functions shared across the String Utility Library.
 *
 * These helpers are intentionally kept private to the library.
 * They should not be imported directly outside this package.
 *
 * @author EduAsas
 * @version 1.0.0
 * =============================================================================
 */

import type { StringValue } from "./types";

/**
 * Converts any nullable string into a safe string.
 *
 * @param value - The value to normalize.
 *
 * @returns A valid string.
 *
 * @example
 * normalize(null)
 * // ""
 *
 * normalize(undefined)
 * // ""
 *
 * normalize("John")
 * // "John"
 */
export function normalize(value: StringValue): string {
  return String(value ?? "");
}

/**
 * Removes leading and trailing whitespace.
 *
 * @param value - The string to trim.
 *
 * @returns A trimmed string.
 */
export function trim(value: StringValue): string {
  return normalize(value).trim();
}

/**
 * Determines whether a string is empty after trimming.
 *
 * @param value - String to check.
 *
 * @returns True if empty.
 */
export function isEmpty(value: StringValue): boolean {
  return trim(value).length === 0;
}

/**
 * Splits a string into words.
 *
 * Supported separators:
 *
 * - Spaces
 * - Underscores
 * - Hyphens
 *
 * @example
 * splitWords("john_doe")
 * // ["john","doe"]
 *
 * splitWords("john-doe")
 * // ["john","doe"]
 *
 * splitWords("john doe")
 * // ["john","doe"]
 */
export function splitWords(value: StringValue): string[] {
  return trim(value)
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Capitalizes a single word.
 *
 * This helper should only be used for
 * one individual word.
 *
 * @example
 * capitalizeWord("john")
 * // John
 *
 * capitalizeWord("JOHN")
 * // John
 */
export function capitalizeWord(word: string): string {
  if (!word) return "";

  return (
    word.charAt(0).toUpperCase() +
    word.slice(1).toLowerCase()
  );
}

/**
 * Converts every word into lowercase.
 */
export function lowerWords(words: string[]): string[] {
  return words.map(word => word.toLowerCase());
}

/**
 * Converts every word into uppercase.
 */
export function upperWords(words: string[]): string[] {
  return words.map(word => word.toUpperCase());
}

/**
 * Capitalizes every word.
 */
export function capitalizeWords(words: string[]): string[] {
  return words.map(capitalizeWord);
}

/**
 * Joins words using a separator.
 *
 * @param words - Array of words.
 * @param separator - Join character.
 */
export function joinWords(
  words: string[],
  separator: string,
): string {
  return words.join(separator);
}

/**
 * Returns the first character of a string.
 *
 * Safe for empty strings.
 */
export function firstChar(value: StringValue): string {
  const text = trim(value);

  return text.charAt(0);
}

/**
 * Returns everything except the first character.
 */
export function restChars(value: StringValue): string {
  const text = trim(value);

  return text.slice(1);
}