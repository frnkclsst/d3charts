import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn } from "./Shape";
import type { IDatum } from "../types/interfaces";
import { curveFromString } from "../utils/curves";
import { easeFromString } from "../utils/ease";
import { CurveTypes } from "../types/enums";
import type { CurveType } from "../types/enums";

/**
 * Renders a filled area band beneath a line series.
 *
 * The area is drawn using d3's area generator between a lower boundary (`y0`)
 * and an upper boundary (`y1`). For a standard area chart the lower boundary
 * is the zero-line; for stacked area charts it is the previous series' top.
 *
 * The area fades in from opacity 0 to `_opacity` over the animation duration.
 * NaN values in the series create gaps in the area (`defined` predicate).
 *
 * The `<g id="area-N">` group is separate from the line group so that
 * {@link Chart.toggleSerie} can independently toggle the area's visibility.
 */
export class AreaShape extends Shape {
  /** Name of the d3 curve factory (see {@link curveFromString}). */
  private _interpolation: CurveType = CurveTypes.Linear;
  /** Lower boundary coordinate function (maps to the y0 field of IDatum). */
  private _y0!: CoordFn;
  /** Upper boundary coordinate function (maps to the y1 / y field of IDatum). */
  private _y1!: CoordFn;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
  }

  /**
   * Sets the d3 curve factory name.
   * @param name - One of the names accepted by {@link curveFromString}.
   */
  public interpolation(name: CurveType): this {
    this._interpolation = name;
    return this;
  }

  /**
   * Sets the lower boundary coordinate function.
   * @param fn - `(datum, categoryIndex, seriesIndex) => yPixel` for the area's bottom edge.
   */
  public y0(fn: CoordFn): this {
    this._y0 = fn;
    return this;
  }

  /**
   * Sets the upper boundary coordinate function.
   * @param fn - `(datum, categoryIndex, seriesIndex) => yPixel` for the area's top edge.
   */
  public y1(fn: CoordFn): this {
    this._y1 = fn;
    return this;
  }

  /**
   * Renders the filled area path and starts the fade-in animation.
   * @param data - The datum row for this series from {@link Series.getSeriesData}.
   */
  public draw(data: IDatum[]): void {
    const area = d3.area<IDatum>()
      .curve(curveFromString(this._interpolation))
      .defined((d) => !isNaN(d.y))
      .x((d, i)  => this._x(d, i, this._serie))
      .y0((d, i) => this._y0(d, i, this._serie))
      .y1((d, i) => this._y1(d, i, this._serie));

    const svgPath = this._svg
      .append("g")
      .attr("id", `area-${this._serie}`)
      .append("path")
      .attr("class", "area")
      .attr("d", area(data) ?? "")
      .style("fill", this._color)
      .style("opacity", 0);

    svgPath
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .style("opacity", this._opacity);
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }
}
