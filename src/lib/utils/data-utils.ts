/**
 * Universal Search function - Inatafuta neno kwenye array ya objects yoyote kwa kina (recursive).
 * * @template T - Aina ya object iliyopo kwenye array.
 * @param {T[]} data - Array ya data unayotaka kutafutia.
 * @param {string} searchTerm - Neno unalotafuta.
 * @param {Set<any>} [seen=new Set()] - (Internal) Inazuia circular reference issues.
 * @returns {T[]} - Array ya matokeo yaliyochujwa.
 * * @example
 * const results = functionSearch(staffList, "john");
 */
export const functionSearch = <T>(
  data: T[],
  searchTerm: string,
  seen = new Set<any>()
): T[] => {
  if (!searchTerm || !Array.isArray(data)) return data;

  const lowerTerm = searchTerm.toLowerCase();

  return data.filter((item) => {
    /**
     * Helper ya ku-flatten object kwa usalama.
     * Inatumia Set kuzuia circular references (kama Object A ina link na Object B na B ina link na A).
     */
    const flattenObject = (obj: any): string => {
      if (obj === null || obj === undefined) return "";

      // Zuia circular reference
      if (typeof obj === 'object') {
        if (seen.has(obj)) return "";
        seen.add(obj);
      }

      let str = "";
      for (const key in obj) {
        const value = obj[key];

        if (typeof value === "object" && value !== null) {
          str += flattenObject(value) + " ";
        } else if (value !== null && value !== undefined) {
          str += String(value).toLowerCase() + " ";
        }
      }
      return str;
    };

    // Tunapoweka filter, tunafuta 'seen' kwa kila item mpya ili search iwe accurate
    const searchString = flattenObject(item);
    seen.clear();

    return searchString.includes(lowerTerm);
  });
};



type SortDirection = 'asc' | 'desc';

/**
 * Husaidia kuchimbua thamani kutoka kwenye object kwa kutumia path (mfano: "user.firstName").
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};


/**
* Universal Sort - Inapanga data yoyote kwa ufunguo wowote (hata ulio ndani).
* * @template T - Aina ya object.
* @param {T[]} data - Array ya data.
* @param {string} path - Field unayotaka kupangia (mfano: "user.lastName" au "joiningDate").
* @param {SortDirection} direction - 'asc' au 'desc'.
* * @example
* const sorted = universalSort(staffList, "user.firstName", "asc");
*/
export const universalSort = <T>(
  data: T[],
  path: string,
  direction: SortDirection = 'asc'
): T[] => {
  return [...data].sort((a, b) => {
    let valA = getNestedValue(a, path);
    let valB = getNestedValue(b, path);

    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();

    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};



// /**
//  * A resolver function that can generate
//  * a value dynamically from the original item.
//  *
//  * @template T Original item type
//  * @template V Generated value type
//  */
// export type EnhancerValue<T, V> =
//     V | ((item: T, index: number) => V);



// /**
//  * Configuration used to enhance each item.
//  *
//  * Every key represents a new property that will
//  * be attached to the original object.
//  *
//  * @example
//  * ```ts
//  * {
//  *   badge: "Recommended",
//  *
//  *   color: (item) =>
//  *      item.status === "ACTIVE"
//  *          ? "green"
//  *          : "gray"
//  * }
//  * ```
//  */
// export type EnhancerConfig<T> = Record<
//     string,
//     EnhancerValue<T, unknown>
// >;


// /**
//  * Extracts the final added properties
//  * from enhancer configuration.
//  */
// export type InferEnhancements<
//     C extends Record<string, unknown>
// > = {
//     [K in keyof C]:
//         C[K] extends (
//             item: any,
//             index: number
//         ) => infer R
//             ? R
//             : C[K]
// };


// /**
//  * Enhances a collection of data objects by attaching additional
//  * computed or static properties without modifying the original data.
//  *
//  * This utility is designed for transforming clean backend/API models
//  * into frontend-friendly UI models.
//  *
//  * It preserves the original object structure and creates a new array
//  * where every item contains:
//  *
//  * - Original API properties
//  * - Additional UI-specific properties
//  *
//  * The original array and its objects are never mutated.
//  *
//  * ---
//  *
//  * ## Type Safety
//  *
//  * This function is fully type-safe and uses TypeScript inference to
//  * automatically understand:
//  *
//  * - The shape of the original data (`T`)
//  * - The keys added through the enhancement configuration
//  * - The final returned object structure
//  *
//  * The returned type becomes:
//  *
//  * ```ts
//  * OriginalData & AddedProperties
//  * ```
//  *
//  * Example:
//  *
//  * ```ts
//  * interface School {
//  *   id: string;
//  *   status: "ACTIVE" | "PENDING";
//  * }
//  *
//  * const result = enhance<School>(
//  *   schools,
//  *   {
//  *     badge: "Setup Required",
//  *     color: "yellow"
//  *   }
//  * );
//  *
//  * // Result type:
//  * Array<{
//  *   id:string;
//  *   status:"ACTIVE" | "PENDING";
//  *   badge:string;
//  *   color:string;
//  * }>
//  * ```
//  *
//  * ---
//  *
//  * ## Supported Enhancement Values
//  *
//  * Every added property can receive either:
//  *
//  * ### 1. Static value
//  *
//  * The same value is applied to every item.
//  *
//  * ```ts
//  * {
//  *    icon: SchoolIcon,
//  *    source: "dashboard"
//  * }
//  * ```
//  *
//  *
//  * ### 2. Dynamic resolver function
//  *
//  * The value is calculated from the current item.
//  *
//  * The resolver receives:
//  *
//  * - `item`  → current data object
//  * - `index` → current array position
//  *
//  * ```ts
//  * {
//  *    badge:(school, index)=> {
//  *       return school.status === "PENDING"
//  *          ? "Setup Required"
//  *          : undefined;
//  *    }
//  * }
//  * ```
//  *
//  * ---
//  *
//  * ## Common Use Cases
//  *
//  * This helper is useful when preparing data for:
//  *
//  * - Radio groups
//  * - Select components
//  * - Tables
//  * - Cards
//  * - Dashboard widgets
//  * - Navigation menus
//  * - Permission-based UI
//  *
//  * Typical UI properties:
//  *
//  * - Icons
//  * - Badges
//  * - Colors
//  * - Labels
//  * - Display values
//  * - Loading states
//  * - Disabled states
//  * - Visibility rules
//  *
//  * ---
//  *
//  * ## Example: API Response → UI Model
//  *
//  * Backend returns:
//  *
//  * ```ts
//  * [
//  *   {
//  *     code:"NECTA",
//  *     name:"NECTA Grading"
//  *   },
//  *   {
//  *     code:"CUSTOM",
//  *     name:"Custom Grading"
//  *   }
//  * ]
//  * ```
//  *
//  * Enhance for UI:
//  *
//  * ```ts
//  * const options = enhance(rules, {
//  *
//  *    badge:(rule)=>
//  *       rule.code === "NECTA"
//  *          ? "Recommended"
//  *          : undefined,
//  *
//  *    color:(rule)=>
//  *       rule.code === "NECTA"
//  *          ? "primary"
//  *          : "muted",
//  *
//  *    disabled:false
//  *
//  * });
//  * ```
//  *
//  * Result:
//  *
//  * ```ts
//  * [
//  *   {
//  *     code:"NECTA",
//  *     name:"NECTA Grading",
//  *     badge:"Recommended",
//  *     color:"primary",
//  *     disabled:false
//  *   }
//  * ]
//  * ```
//  *
//  * ---
//  *
//  * ## Design Principle
//  *
//  * Keep backend data clean and independent from presentation logic.
//  *
//  * Instead of mixing UI properties inside API responses:
//  *
//  * ❌ API:
//  *
//  * ```ts
//  * {
//  *    name:"NECTA",
//  *    icon:"GraduationCap",
//  *    color:"blue"
//  * }
//  * ```
//  *
//  * Prefer:
//  *
//  * ✅ API:
//  *
//  * ```ts
//  * {
//  *    name:"NECTA"
//  * }
//  * ```
//  *
//  * Then enhance on the frontend:
//  *
//  * ```ts
//  * enhance(data,{
//  *    icon:GraduationCap,
//  *    color:"blue"
//  * })
//  * ```
//  *
//  * This keeps your application architecture scalable and maintainable.
//  *
//  * @template T
//  * Original data object type.
//  *
//  * @template C
//  * Enhancement configuration type inferred automatically from the
//  * provided configuration object.
//  *
//  * @param data
//  * Array of original objects to enhance.
//  *
//  * @param config
//  * Object describing additional properties to attach.
//  *
//  * Each property can be:
//  *
//  * - A static value
//  * - A function returning a computed value
//  *
//  * @returns
//  * A new array containing enhanced objects with full TypeScript inference.
//  *
//  * @throws
//  * This function does not throw errors during enhancement.
//  * Resolver errors will propagate naturally if thrown inside
//  * a custom resolver function.
//  */

// export function enhance<
//   T extends object,
//   C extends EnhancerConfig<T>
// >(
//   data: readonly T[],
//   config: C
// ): Array<T & InferEnhancements<C>> {

//   return data.map((item, index) => {

//     const additions = Object.entries(config)
//       .reduce<Record<string, unknown>>(
//         (acc, [key, resolver]) => {

//           acc[key] =
//             typeof resolver === "function"
//               ? (
//                 resolver as (
//                   item: T,
//                   index: number
//                 ) => unknown
//               )(item, index)
//               : resolver;

//           return acc;

//         },
//         {}
//       );


//     return {
//       ...item,
//       ...additions
//     } as T & InferEnhancements<C>;

//   });
// }