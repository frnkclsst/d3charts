import * as d3 from "d3";
import type { EaseType } from "../types/enums";

/**
 * Maps an easing name string to the corresponding d3 easing function.
 *
 * Used by all shape `draw()` methods and by {@link PieChart} to configure
 * the enter animation. Falls back to `d3.easeLinear` for unrecognised names.
 *
 * Supported names:
 * | Name       | d3 function       |
 * |------------|-------------------|
 * | `"cubic"`   | `d3.easeCubic`    |
 * | `"elastic"` | `d3.easeElastic`  |
 * | `"bounce"`  | `d3.easeBounce`   |
 * | `"back"`    | `d3.easeBack`     |
 * | `"sin"`     | `d3.easeSin`      |
 * | `"exp"`     | `d3.easeExp`      |
 * | `"circle"`  | `d3.easeCircle`   |
 * | `"quad"`    | `d3.easeQuad`     |
 * | *(default)* | `d3.easeLinear`   |
 *
 * @param name - Easing name string (case-sensitive).
 * @returns A d3 easing function `(t: number) => number`.
 */
export function easeFromString(name: EaseType): (t: number) => number {
  switch (name) {
    case "cubic":   return d3.easeCubic;
    case "elastic": return d3.easeElastic;
    case "bounce":  return d3.easeBounce;
    case "back":    return d3.easeBack;
    case "sin":     return d3.easeSin;
    case "exp":     return d3.easeExp;
    case "circle":  return d3.easeCircle;
    case "quad":    return d3.easeQuad;
    default:        return d3.easeLinear;
  }
}
