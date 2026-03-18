import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn, DataSelection } from "./Shape";
import type { IDatum } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/**
 * Renders a single bar series as `<rect class="bar">` elements for horizontal bar charts.
 *
 * Bars grow from left to right — width starts at 0 and transitions to the target width,
 * while `x` is re-applied on each animation frame (needed for negative bars that start
 * at a position other than the axis origin).
 *
 * Tooltips are attached immediately (before animation). Labels are appended once the
 * last bar finishes animating.
 *
 * Each bar group gets `id="serie-N"` so {@link Chart.toggleSerie} can fade the series.
 */
export class BarShape extends Shape {
  /** Returns the pixel height (thickness) of a bar for a given datum. */
  private _height!: CoordFn;
  /** Returns the pixel width (length) of a bar for a given datum. */
  private _width!:  CoordFn;
  /** Pixel position of the zero line — bars start collapsed here before animating. */
  private _startX: number = 0;
  /** Optional callback to attach tooltip behaviour to the rect selection. */
  private _tooltipFn?: (sel: DataSelection<SVGRectElement>, serie: number) => void;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
  }

  /**
   * Sets the function that computes each bar's pixel height (vertical thickness).
   * @param fn - `(datum, categoryIndex, seriesIndex) => heightPixels`.
   */
  public height(fn: CoordFn): this { this._height = fn; return this; }

  /**
   * Sets the function that computes each bar's pixel width (horizontal length).
   * @param fn - `(datum, categoryIndex, seriesIndex) => widthPixels`.
   */
  public width(fn: CoordFn):  this { this._width  = fn; return this; }

  /**
   * Sets the pixel X position of the zero line. Bars start collapsed at this
   * position and animate outward — positive bars grow right, negative bars grow left.
   * @param x - Pixel coordinate of `scale(0)` on the X axis.
   */
  public startX(x: number): this { this._startX = x; return this; }

  /**
   * Provides a function to attach tooltip behaviour to the rendered rects.
   * @param fn - Receives the rect selection and the series index.
   */
  public tooltipFn(fn: (sel: DataSelection<SVGRectElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  /**
   * Renders the bar rects and starts the grow animation.
   * @param data - The datum row for this series from {@link Series.getMatrixItem}.
   */
  public draw(data: IDatum[]): void {
    const enter = this._svg
      .append("g")
      .attr("id", `serie-${this._serie}`)
      .selectAll<SVGRectElement, IDatum>("rect")
      .data(data)
      .enter();

    const rects = enter
      .append("rect")
      .attr("class", "bar")
      .attr("fill",   this._color)
      .attr("stroke", this._color)
      .attr("stroke-width", 1)
      .attr("height", (d, i) => this._height(d, i, this._serie))
      .attr("y",      (d, i) => this._y(d, i, this._serie))
      // Start collapsed at the zero line; both x and width animate to final values
      .attr("width",  0)
      .attr("x",      this._startX);

    let pending = data.length;

    rects
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .attr("width", (d, i) => this._width(d, i, this._serie))
      .attr("x",     (d, i) => this._x(d, i, this._serie))
      .on("end", () => {
        pending--;
        if (pending === 0 && this._labels.visible) {
          this._drawLabels(data);
        }
      });

    this._tooltipFn?.(rects, this._serie);
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Appends centred `<text class="label">` elements inside each bar rect.
   * Labels are rendered after all bars have finished animating.
   */
  private _drawLabels(data: IDatum[]): void {
    this._initLabels();
    const fmt = this._labels.format ? d3.format(this._labels.format) : String;

    data.forEach((d, i) => {
      const x  = this._x(d, i, this._serie);
      const y  = this._y(d, i, this._serie);
      const w  = this._width(d, i, this._serie);
      const h  = this._height(d, i, this._serie);
      const rotation = this._labels.rotate ? -90 : 0;
      const dx = rotation !== 0 ? -h / 2 : w / 2;
      const dy = rotation !== 0 ?  w / 2 : h / 2;

      this._svgLabels.append("text")
        .text(fmt(this._labelValueFn(d)))
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#fff")
        .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
        .attr("dx", dx)
        .attr("dy", dy);
    });
  }
}
