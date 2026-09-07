/**
 * =============================================================================
 * EduAsas String Utilities
 * -----------------------------------------------------------------------------
 * Fluent String API.
 *
 * Provides a modern and chainable interface for transforming text.
 *
 * @author EduAsas
 * @version 1.0.0
 * =============================================================================
 */

import type { StringValue } from "./types";
import { transformers } from "./transform";

/**
 * Represents a fluent string transformer.
 *
 * @example
 * text("john doe").titleCase().toString()
 *
 * @example
 * text("john doe").camelCase().value()
 */
export class Text {

  /**
   * Internal string value.
   */
  private readonly source: string;

  constructor(value: StringValue) {
    this.source = value ?? "";
  }

  /**
   * Returns the current value.
   */
  value(): string {
    return this.source;
  }

  /**
   * Alias of value().
   */
  toString(): string {
    return this.source;
  }

  /**
   * Returns the primitive string value.
   */
  valueOf(): string {
    return this.source;
  }

  /**
   * Creates a new immutable Text instance.
   */
  private clone(value: string): Text {
    return new Text(value);
  }

  capitalize(): Text {
    return this.clone(
      transformers.capitalize(this.source)
    );
  }

  sentenceCase(): Text {
    return this.clone(
      transformers.sentenceCase(this.source)
    );
  }

  titleCase(): Text {
    return this.clone(
      transformers.titleCase(this.source)
    );
  }

  upperCase(): Text {
    return this.clone(
      transformers.upperCase(this.source)
    );
  }

  lowerCase(): Text {
    return this.clone(
      transformers.lowerCase(this.source)
    );
  }

  camelCase(): Text {
    return this.clone(
      transformers.camelCase(this.source)
    );
  }

  pascalCase(): Text {
    return this.clone(
      transformers.pascalCase(this.source)
    );
  }

  snakeCase(): Text {
    return this.clone(
      transformers.snakeCase(this.source)
    );
  }

  kebabCase(): Text {
    return this.clone(
      transformers.kebabCase(this.source)
    );
  }

  constantCase(): Text {
    return this.clone(
      transformers.constantCase(this.source)
    );
  }

}