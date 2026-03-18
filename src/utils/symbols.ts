import * as d3 from "d3";
import type { MarkerType } from "../types/enums";

/**
 * Maps a {@link MarkerType} string to the corresponding d3 symbol type object.
 *
 * Used by {@link LineShape} and {@link BubbleShape} to configure the d3 symbol generator.
 * `"triangle-down"` is mapped to `d3.symbolTriangle` and rotated 180° via a CSS transform
 * at the call site.
 *
 * @param marker - Marker type name.
 * @returns The corresponding `d3.SymbolType`.
 */
export function d3SymbolType(marker: MarkerType): d3.SymbolType {
  switch (marker) {
    case "cross":         return d3.symbolCross;
    case "diamond":       return d3.symbolDiamond;
    case "square":        return d3.symbolSquare;
    case "triangle-up":   return d3.symbolTriangle;
    case "triangle-down": return d3.symbolTriangle;
    default:              return d3.symbolCircle;
  }
}
