import type * as d3 from "d3";
import { ChartArea } from "./ChartArea";
import type { ResolvedPlotAreaOptions } from "./Options";

/**
 * Tracks how much space each axis has consumed inside the plot area.
 * Axes call `_adjustPlotArea()` during their `setSize()` pass to shrink
 * the available drawing area and accumulate their own offset here.
 */
export interface IAxisSize {
  /** Total width consumed by left-side Y axes (px). */
  left: number;
  /** Total width consumed by right-side Y axes (px). */
  right: number;
  /** Total height consumed by top-side X axes (px). */
  top: number;
  /** Total height consumed by bottom-side X axes (px). */
  bottom: number;
}

/**
 * The rectangular region inside the canvas where data shapes are drawn.
 *
 * The plot area is positioned by {@link Canvas._positionAreas} and rendered as a
 * `<g class="plotarea">` element translated by its `(x, y)` coordinates plus padding.
 * Axes then shrink the effective drawing space by updating `axisSize`.
 */
export class PlotArea extends ChartArea {
  /**
   * Cumulative space reserved by axes on each side of the plot area.
   * Reset to zero at the start of each `draw()` call.
   */
  public axisSize: IAxisSize = { left: 0, right: 0, top: 0, bottom: 0 };

  /**
   * @param options - Resolved plot-area options (border visibility and padding).
   */
  public constructor(options: ResolvedPlotAreaOptions) {
    super();
    this.border  = { ...options.border };
    this.padding = options.padding;
  }

  /**
   * Appends the `<g class="plotarea">` group to the canvas SVG and resets `axisSize`.
   * The group is translated by `(x + padding, y + padding)` so that child elements
   * use the inner coordinate space.
   *
   * @param canvasSvg - The root SVG element produced by {@link Canvas.draw}.
   */
  public draw(canvasSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>): void {
    this.axisSize = { left: 0, right: 0, top: 0, bottom: 0 };

    this.svg = canvasSvg
      .append("g")
      .attr("class", "plotarea")
      .attr("transform", `translate(${this.x + this.padding},${this.y + this.padding})`);

    this.drawBorders();
  }
}
