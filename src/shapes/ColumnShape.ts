import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn, DataSelection } from "./Shape";
import type { IDatum } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/**
 * Renders a single column series as `<rect class="column">` elements.
 *
 * Columns grow upward from `y` + `height` to `y` over the animation duration
 * (height starts at 0 and transitions to the target height).
 *
 * Tooltips are attached immediately (before animation starts) so the user can
 * hover columns while they animate. Labels are appended once the last column
 * finishes animating.
 *
 * Each column group gets `id="serie-N"` so {@link Chart.toggleSerie} can
 * fade the entire series.
 */
export class ColumnShape extends Shape {
  /** Returns the pixel height of a column for a given datum. */
  private _height!: CoordFn;
  /** Returns the pixel width of a column for a given datum. */
  private _width!:  CoordFn;
  /** Pixel position of the zero line — columns start collapsed here before animating. */
  private _startY: number = 0;
  /** Optional per-datum colour function — overrides the single `_color` when set. */
  private _colorFn?: (datumIndex: number) => string;
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
   * Sets the function that computes each column's pixel height.
   * @param fn - `(datum, categoryIndex, seriesIndex) => heightPixels`.
   */
  public height(fn: CoordFn): this { this._height = fn; return this; }

  /**
   * Sets the function that computes each column's pixel width.
   * @param fn - `(datum, categoryIndex, seriesIndex) => widthPixels`.
   */
  public width(fn: CoordFn):  this { this._width  = fn; return this; }

  /**
   * Sets the pixel Y position of the zero line. Columns start collapsed at this
   * position and animate outward — positive columns grow up, negative columns grow down.
   * @param y - Pixel coordinate of `scale(0)` on the Y axis.
   */
  public startY(y: number): this { this._startY = y; return this; }

  /**
   * Sets a per-datum colour function. When provided, each column is coloured
   * by `fn(datumIndex)` instead of the single series colour. Used by
   * {@link VariwideChart} to assign a unique colour to each column.
   * @param fn - `(datumIndex) => cssColorString`.
   */
  public colorFn(fn: (datumIndex: number) => string): this {
    this._colorFn = fn;
    return this;
  }

  /**
   * Provides a function to attach tooltip behaviour to the rendered rects.
   * @param fn - Receives the rect selection and the series index.
   */
  public tooltipFn(fn: (sel: DataSelection<SVGRectElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  /**
   * Renders the column rects and starts the grow animation.
   * @param data - The datum row for this series from {@link Series.getSeriesData}.
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
      .attr("class", "column")
      .attr("fill",   this._colorFn ? (_, i): string => this._colorFn!(i) : this._color)
      .attr("stroke", this._colorFn ? (_, i): string => this._colorFn!(i) : this._color)
      .attr("stroke-width", 1)
      .attr("width",  (d, i) => this._width(d, i, this._serie))
      .attr("x",      (d, i) => this._x(d, i, this._serie))
      // Start collapsed at the zero line; both y and height animate to final values
      .attr("height", 0)
      .attr("y",      this._startY);

    let pending = data.length;

    rects
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .attr("height", (d, i) => this._height(d, i, this._serie))
      .attr("y",      (d, i) => this._y(d, i, this._serie))
      .on("end", () => {
        pending--;
        if (pending === 0) {
          if (this._labels.visible) {this._drawLabels(data);}
        }
      });

    this._tooltipFn?.(rects, this._serie);
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Appends centred `<text class="label">` elements inside each column rect.
   * Labels are rendered after all columns have finished animating.
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
