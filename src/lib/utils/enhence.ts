/**
 * A resolver function that can generate
 * a value dynamically from the original item.
 *
 * @template T Original item type
 * @template V Generated value type
 */
export type EnhancerValue<T, V> =
    V | ((item: T, index: number) => V);



/**
 * Configuration used to enhance each item.
 *
 * Every key represents a new property that will
 * be attached to the original object.
 *
 * @example
 * ```ts
 * {
 *   badge: "Recommended",
 *
 *   color: (item) =>
 *      item.status === "ACTIVE"
 *          ? "green"
 *          : "gray"
 * }
 * ```
 */
export type EnhancerConfig<T> = Record<
    string,
    EnhancerValue<T, unknown>
>;


/**
 * Extracts the final added properties
 * from enhancer configuration.
 */
export type InferEnhancements<
    C extends Record<string, unknown>
> = {
    [K in keyof C]:
        C[K] extends (
            item: any,
            index: number
        ) => infer R
            ? R
            : C[K]
};


/**
 * Enhances a collection of data objects by attaching additional
 * computed or static properties without modifying the original data.
 *
 * This utility is designed for transforming clean backend/API models
 * into frontend-friendly UI models.
 *
 * It preserves the original object structure and creates a new array
 * where every item contains:
 *
 * - Original API properties
 * - Additional UI-specific properties
 *
 * The original array and its objects are never mutated.
 *
 * ---
 *
 * ## Type Inference ya T
 *
 * Kigezo `T` kinadukuliwa (inferred) moja kwa moja kutoka kwenye
 * `data` — hakuna haja ya kuandika generic wazi:
 *
 * ```ts
 * const globalRules: CompatibleGradingRule[] = [...];
 *
 * // T inadukuliwa kama CompatibleGradingRule, "rule" ina type sahihi:
 * const gradingRules = enhance(globalRules, {
 *   badge: (rule) => rule.code === "NECTA" ? "Recommended" : undefined,
 * });
 * ```
 *
 * Ukitaka kulazimisha T kwa sababu maalum (mfano `data` ni array
 * tupu `[]` na huwezi kutegemea inference), bado unaweza kuandika
 * wazi: `enhance<CompatibleGradingRule>(globalRules, {...})`.
 *
 * ---
 *
 * ## Type Safety
 *
 * This function is fully type-safe and uses TypeScript inference to
 * automatically understand:
 *
 * - The shape of the original data (`T`) — sasa lazima ipitishwe wazi
 * - The keys added through the enhancement configuration (`C`)
 * - The final returned object structure
 *
 * The returned type becomes:
 *
 * ```ts
 * OriginalData & AddedProperties
 * ```
 *
 * Example:
 *
 * ```ts
 * interface School {
 *   id: string;
 *   status: "ACTIVE" | "PENDING";
 * }
 *
 * const result = enhance<School>(
 *   schools,
 *   {
 *     badge: "Setup Required",
 *     color: "yellow"
 *   }
 * );
 *
 * // Result type:
 * Array<{
 *   id:string;
 *   status:"ACTIVE" | "PENDING";
 *   badge:string;
 *   color:string;
 * }>
 * ```
 *
 * ---
 *
 * ## Supported Enhancement Values
 *
 * Every added property can receive either:
 *
 * ### 1. Static value
 *
 * The same value is applied to every item.
 *
 * ```ts
 * {
 *    icon: SchoolIcon,
 *    source: "dashboard"
 * }
 * ```
 *
 *
 * ### 2. Dynamic resolver function
 *
 * The value is calculated from the current item.
 *
 * The resolver receives:
 *
 * - `item`  → current data object
 * - `index` → current array position
 *
 * ```ts
 * {
 *    badge:(school, index)=> {
 *       return school.status === "PENDING"
 *          ? "Setup Required"
 *          : undefined;
 *    }
 * }
 * ```
 *
 * ---
 *
 * ## Common Use Cases
 *
 * This helper is useful when preparing data for:
 *
 * - Radio groups
 * - Select components
 * - Tables
 * - Cards
 * - Dashboard widgets
 * - Navigation menus
 * - Permission-based UI
 *
 * Typical UI properties:
 *
 * - Icons
 * - Badges
 * - Colors
 * - Labels
 * - Display values
 * - Loading states
 * - Disabled states
 * - Visibility rules
 *
 * ---
 *
 * ## Design Principle
 *
 * Keep backend data clean and independent from presentation logic.
 *
 * Instead of mixing UI properties inside API responses:
 *
 * ❌ API:
 *
 * ```ts
 * {
 *    name:"NECTA",
 *    icon:"GraduationCap",
 *    color:"blue"
 * }
 * ```
 *
 * Prefer:
 *
 * ✅ API:
 *
 * ```ts
 * {
 *    name:"NECTA"
 * }
 * ```
 *
 * Then enhance on the frontend:
 *
 * ```ts
 * enhance<GradingRule>(data,{
 *    icon:GraduationCap,
 *    color:"blue"
 * })
 * ```
 *
 * This keeps your application architecture scalable and maintainable.
 *
 * @template T
 * Original data object type. Inadukuliwa (inferred) moja kwa moja
 * kutoka kwa `data`; unaweza pia kuipitisha wazi ukihitaji.
 *
 * @template C
 * Enhancement configuration type inferred automatically from the
 * provided configuration object.
 *
 * @param data
 * Array of original objects to enhance.
 *
 * @param config
 * Object describing additional properties to attach.
 *
 * Each property can be:
 *
 * - A static value
 * - A function returning a computed value
 *
 * @returns
 * A new array containing enhanced objects with full TypeScript inference.
 *
 * @throws
 * This function does not throw errors during enhancement.
 * Resolver errors will propagate naturally if thrown inside
 * a custom resolver function.
 */

export function enhance<
  T extends object,
  C extends EnhancerConfig<T>
>(
  data: readonly T[],
  config: C
): Array<T & InferEnhancements<C>> {

  return data.map((item, index) => {

    const additions = Object.entries(config)
      .reduce<Record<string, unknown>>(
        (acc, [key, resolver]) => {

          acc[key] =
            typeof resolver === "function"
              ? (
                resolver as (
                  item: T,
                  index: number
                ) => unknown
              )(item, index)
              : resolver;

          return acc;

        },
        {}
      );


    return {
      ...item,
      ...additions
    } as T & InferEnhancements<C>;

  });
}