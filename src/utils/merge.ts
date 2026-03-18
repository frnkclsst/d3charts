/**
 * Performs a deep merge of `overrides` into `defaults`, returning a new object.
 *
 * - Plain objects are merged recursively.
 * - Arrays and primitive values in `overrides` replace those in `defaults` entirely.
 * - `undefined` override values are skipped (the default is preserved).
 *
 * @param defaults  - Base object with all expected keys populated.
 * @param overrides - Partial object whose values take precedence over `defaults`.
 * @returns A new object of type `T` combining both inputs.
 *
 * @example
 * ```ts
 * const base    = { a: 1, b: { c: 2, d: 3 } };
 * const partial = { b: { c: 99 } };
 * mergeOptions(base, partial); // { a: 1, b: { c: 99, d: 3 } }
 * ```
 */
export function mergeOptions<T extends object>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const overrideVal = overrides[key];
    if (overrideVal === undefined) {continue;}
    const defaultVal = defaults[key];
    if (
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(overrideVal) &&
      typeof defaultVal === "object" &&
      defaultVal !== null
    ) {
      result[key] = mergeOptions(defaultVal as object, overrideVal as object) as T[keyof T];
    } else {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}
