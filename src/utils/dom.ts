import type * as d3 from "d3";

/** Convenience alias for a generic D3 selection used as input to DOM measurement helpers. */
export type AnySelection = d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>;

/**
 * Returns the rendered height of an SVG element in pixels using `getBoundingClientRect`.
 * Returns `0` if the node is not attached to the DOM or has no layout box.
 *
 * @param svg - Any D3 selection whose first node should be measured.
 */
export function getHeight(svg: AnySelection): number {
  const node = svg.node() as Element | null;
  return node?.getBoundingClientRect().height ?? 0;
}

/**
 * Returns the rendered width of an SVG element in pixels using `getBoundingClientRect`.
 * Returns `0` if the node is not attached to the DOM or has no layout box.
 *
 * @param svg - Any D3 selection whose first node should be measured.
 */
export function getWidth(svg: AnySelection): number {
  const node = svg.node() as Element | null;
  return node?.getBoundingClientRect().width ?? 0;
}

/**
 * Computes the X offset needed to horizontally align an SVG element within a container.
 *
 * @param svg       - The element to align (its width is measured via `getWidth`).
 * @param width     - Total available width of the container.
 * @param alignment - `"left"` | `"center"` | `"right"`. Defaults to `"left"`.
 * @param margin    - Left/right margin applied for `"left"` and `"right"` alignment.
 * @returns The X pixel offset to apply to the element.
 */
export function align(svg: AnySelection, width: number, alignment: string, margin: number): number {
  switch (alignment) {
    case "left":   return margin;
    case "center": return (width - getWidth(svg)) / 2;
    case "right":  return width - getWidth(svg) - margin;
    default:       return margin;
  }
}

/**
 * Computes the Y offset needed to vertically align an SVG element within a container.
 *
 * @param svg       - The element to align (its height is measured via `getHeight`).
 * @param height    - Total available height of the container.
 * @param alignment - `"top"` | `"middle"` | `"bottom"`. Defaults to `"top"`.
 * @param margin    - Top/bottom margin applied for `"top"` and `"bottom"` alignment.
 * @returns The Y pixel offset to apply to the element.
 */
export function valign(svg: AnySelection, height: number, alignment: string, margin: number): number {
  switch (alignment) {
    case "top":    return margin;
    case "middle": return (height - getHeight(svg)) / 2;
    case "bottom": return height - getHeight(svg) - margin;
    default:       return margin;
  }
}
