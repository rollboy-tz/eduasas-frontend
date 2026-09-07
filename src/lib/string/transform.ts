/**
 * =============================================================================
 * EduAsas String Utilities
 * -----------------------------------------------------------------------------
 * Core string transformation engine.
 *
 * Every transformation exposed by the public API is implemented here.
 *
 * This file should remain framework-agnostic and side-effect free.
 *
 * @author EduAsas
 * @version 1.0.0
 * =============================================================================
 */

import type {
  StringTransformerMap,
  StringValue,
} from "./types";

import {
  trim,
  splitWords,
  capitalizeWord,
  capitalizeWords,
  lowerWords,
  upperWords,
  joinWords,
} from "./helpers";

/**
 * Collection of all supported string transformations.
 *
 * New transformations should be added here.
 */
export const transformers: StringTransformerMap = {
  /**
   * Capitalizes only the first word.
   *
   * Example:
   * john doe -> John doe
   */
  capitalize(value: StringValue): string {
    const text = trim(value);

    if (!text) return "";

    return capitalizeWord(text);
  },

  /**
   * Converts a string into sentence case.
   *
   * Example:
   * HELLO WORLD
   * ->
   * Hello world
   */
  sentenceCase(value: StringValue): string {
    const text = trim(value).toLowerCase();

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  /**
   * Converts every word into Title Case.
   *
   * Example:
   * john doe
   * ->
   * John Doe
   */
  titleCase(value: StringValue): string {
    return joinWords(
      capitalizeWords(splitWords(value)),
      " "
    );
  },

  /**
   * Converts to UPPERCASE.
   */
  upperCase(value: StringValue): string {
    return trim(value).toUpperCase();
  },

  /**
   * Converts to lowercase.
   */
  lowerCase(value: StringValue): string {
    return trim(value).toLowerCase();
  },

  /**
   * Converts to camelCase.
   *
   * hello world
   * ->
   * helloWorld
   */
  camelCase(value: StringValue): string {
    const words = lowerWords(splitWords(value));

    if (words.length === 0) return "";

    return (
      words[0] +
      capitalizeWords(words.slice(1)).join("")
    );
  },

  /**
   * Converts to PascalCase.
   *
   * hello world
   * ->
   * HelloWorld
   */
  pascalCase(value: StringValue): string {
    return capitalizeWords(
      lowerWords(splitWords(value))
    ).join("");
  },

  /**
   * Converts to snake_case.
   */
  snakeCase(value: StringValue): string {
    return joinWords(
      lowerWords(splitWords(value)),
      "_"
    );
  },

  /**
   * Converts to kebab-case.
   */
  kebabCase(value: StringValue): string {
    return joinWords(
      lowerWords(splitWords(value)),
      "-"
    );
  },

  /**
   * Converts to CONSTANT_CASE.
   */
  constantCase(value: StringValue): string {
    return joinWords(
      upperWords(splitWords(value)),
      "_"
    );
  },
};