import * as d3 from "d3";

/**
 * Maps a curve name string to the corresponding d3 curve factory.
 *
 * Used by {@link LineShape} and {@link AreaShape} to configure the path interpolation.
 * Falls back to `d3.curveLinear` for any unrecognised name.
 *
 * Supported names:
 * | Name          | d3 factory              |
 * |---------------|-------------------------|
 * | `"basis"`       | `d3.curveBasis`         |
 * | `"cardinal"`    | `d3.curveCardinal`      |
 * | `"catmull-rom"` | `d3.curveCatmullRom`    |
 * | `"natural"`     | `d3.curveNatural`       |
 * | `"monotone"` / `"monotone-x"` | `d3.curveMonotoneX` |
 * | `"step"`        | `d3.curveStep`          |
 * | `"step-before"` | `d3.curveStepBefore`    |
 * | `"step-after"`  | `d3.curveStepAfter`     |
 * | *(default)*     | `d3.curveLinear`        |
 *
 * @param name - Curve name string (case-sensitive).
 * @returns The corresponding d3 `CurveFactory`.
 */
export function curveFromString(name: string): d3.CurveFactory {
  switch (name) {
    case "basis":       return d3.curveBasis;
    case "cardinal":    return d3.curveCardinal;
    case "catmull-rom": return d3.curveCatmullRom;
    case "natural":     return d3.curveNatural;
    case "monotone":
    case "monotone-x":  return d3.curveMonotoneX;
    case "step":        return d3.curveStep;
    case "step-before": return d3.curveStepBefore;
    case "step-after":  return d3.curveStepAfter;
    default:            return d3.curveLinear;
  }
}
