import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn, DataSelection } from "./Shape";
import type { IDatum } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/**
 * Renders a single Y series of a scatter/bubble chart as `<path class="bubble">` elements.
 *
 * Each bubble is a d3 symbol path that grows from size 0 to its target size over
 * the animation duration. Bubble sizes come from `ISerie.size[]` (each value is
 * multiplied by 10 to produce the d3 symbol area). When no `size` array is provided
 * a default area of 60 is used (equivalent to `size = 6`).
 *
 * X coordinates are driven from `series[0]` data values (the dedicated X series),
 * while Y coordinates come from the matching Y series data.
 *
 * The SVG group is given `id="serie-N-1"` (N = series index, offset by 1 because
 * index 0 is the X-values series and is not rendered).
 */
export class BubbleShape extends Shape {
  /** Per-point size values (multiplied ×10 to produce d3 symbol area). */
  private _sizes: number[] = [];
  /** Optional callback to attach tooltip behaviour to the bubble selection. */
  private _tooltipFn?: (sel: DataSelection<SVGPathElement>, serie: number) => void;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index (1-based in scatter charts, as index 0 is X data).
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
  }

  /**
   * Provides per-point size values.
   * @param s - Array of size values, one per data point. Each is multiplied ×10.
   */
  public sizes(s: number[]): this {
    this._sizes = s;
    return this;
  }

  /**
   * Provides a function to attach tooltip behaviour to the rendered bubbles.
   * @param fn - Receives the path selection and the series index.
   */
  public tooltipFn(fn: (sel: DataSelection<SVGPathElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  /**
   * Renders the bubble paths and starts the grow animation.
   * @param data - The datum row for `series[0]` (X values) — used to position bubbles on X.
   */
  public draw(data: IDatum[]): void {
    const enter = this._svg
      .append("g")
      .attr("id", `serie-${this._serie - 1}`)
      .selectAll<SVGPathElement, IDatum>("path")
      .data(data)
      .enter();

    const bubbles = enter
      .append("path")
      .attr("class", "bubble")
      .style("fill", this._color)
      .style("stroke", this._color)
      // Start at size 0 so they grow in from invisible
      .attr("d", d3.symbol<IDatum>().size(0).type(d3.symbolCircle))
      .attr("transform", (d, i) => {
        const x = this._x(d, i, 0);               // X from series[0]
        const y = this._y(d, i, this._serie);      // Y from this series
        return `translate(${x},${y})`;
      });

    let pending = data.length;

    bubbles
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .attrTween("d", (_d, i) => {
        const targetSize = this._sizes[i] !== undefined ? this._sizes[i] * 10 : 60;
        const interp = d3.interpolateNumber(0, targetSize);
        return (t: number): string => d3.symbol().size(interp(t)).type(d3.symbolCircle)() ?? "";
      })
      .on("end", () => {
        pending--;
        if (pending === 0 && this._labels.visible) {
          this._drawLabels(data);
        }
      });

    this._tooltipFn?.(bubbles, this._serie);
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Appends centred `<text class="label">` elements at each bubble position.
   * Labels are rendered after all bubbles have finished animating.
   */
  private _drawLabels(data: IDatum[]): void {
    this._initLabels();
    const fmt = this._labels.format ? d3.format(this._labels.format) : String;

    data.forEach((d, i) => {
      const x = this._x(d, i, this._serie);
      const y = this._y(d, i, this._serie);
      this._svgLabels.append("text")
        .text(fmt(this._labelValueFn(d)))
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#fff")
        .attr("transform", `translate(${x},${y})`);
    });
  }
}
