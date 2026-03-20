import type * as d3 from "d3";
import type { IDatum } from "../types/interfaces";
import { EaseTypes } from "../types/enums";
import type { EaseType } from "../types/enums";

/** A function that maps a datum + category index + series index to a pixel coordinate. */
export type CoordFn    = (d: IDatum, i: number, serie: number) => number;

/** D3 selection of an SVG `<g>` element used as the parent for a series group. */
export type SeriesGroup = d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

/** D3 selection of bound `IDatum` SVG elements (e.g. `<path>`, `<rect>`). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataSelection<E extends Element = Element> = d3.Selection<E, IDatum, any, unknown>;

/**
 * Abstract base class for all renderable shapes.
 *
 * Provides a fluent builder API — each configuration method returns `this` so
 * calls can be chained:
 * ```ts
 * new LineShape(svgSeries, serieIndex)
 *   .animation(1000, "cubic")
 *   .color("#5491F6")
 *   .x((d, i) => xScale(i))
 *   .y((d, i) => yScale(d.y))
 *   .draw(data);
 * ```
 *
 * Subclasses implement `draw(data)` to produce the actual SVG elements.
 */
export class Shape {
  /** Animation duration (ms) and easing function name. */
  protected _animation: { duration: number; ease: EaseType };
  /** Fill / stroke colour for this shape. */
  protected _color:     string;
  /** Data-label configuration. */
  protected _labels:    { format: string; rotate: boolean; visible: boolean };
  /** Extracts the numeric value displayed in a data label. Defaults to `d.y`. */
  protected _labelValueFn: (d: IDatum) => number;
  /** Overall opacity of the shape (used by area fills). */
  protected _opacity:   number;
  /** Zero-based series index — used to generate element IDs and look up data. */
  protected _serie:     number;
  /** Parent `<g>` element to append this shape's group into. */
  protected _svg:       SeriesGroup;
  /** `<g id="labels-N">` group appended by `_initLabels()`. */
  protected _svgLabels!: SeriesGroup;
  /** Callback that maps a datum to its X pixel coordinate. */
  protected _x!:        CoordFn;
  /** Callback that maps a datum to its Y pixel coordinate. */
  protected _y!:        CoordFn;

  /**
   * @param svg   - Parent series group to append into.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    this._svg          = svg;
    this._serie        = serie;
    this._animation    = { duration: 0, ease: EaseTypes.Linear };
    this._color        = "#000";
    this._opacity      = 1;
    this._labels       = { format: "", rotate: false, visible: false };
    this._labelValueFn = (d: IDatum): number => d.y;
  }

  /**
   * Sets the enter animation duration and easing function.
   * @param duration - Duration in milliseconds.
   * @param ease     - d3 easing function name (see {@link easeFromString}).
   */
  public animation(duration: number, ease: EaseType): this {
    this._animation = { duration, ease };
    return this;
  }

  /**
   * Sets the fill/stroke colour for this shape.
   * @param color - CSS colour string.
   */
  public color(color: string): this {
    this._color = color;
    return this;
  }

  /**
   * Configures data-label rendering.
   * @param format  - d3 number-format string (empty = use `String`).
   * @param rotate  - Rotate labels 90°.
   * @param visible - Whether labels are rendered at all.
   */
  public labels(format: string, rotate: boolean, visible: boolean): this {
    this._labels = { format, rotate, visible };
    return this;
  }

  /**
   * Overrides the datum property used for data-label text. Defaults to `d.y`.
   * Use `(d) => d.perc` for 100%-stacked charts to show the percentage share.
   */
  public labelValue(fn: (d: IDatum) => number): this {
    this._labelValueFn = fn;
    return this;
  }

  /**
   * Sets the overall opacity (relevant for area fills).
   * @param opacity - Value between 0 and 1.
   */
  public opacity(opacity: number): this {
    this._opacity = opacity;
    return this;
  }

  /**
   * Sets the X coordinate function.
   * @param fn - `(datum, categoryIndex, seriesIndex) => xPixel`.
   */
  public x(fn: CoordFn): this {
    this._x = fn;
    return this;
  }

  /**
   * Sets the Y coordinate function.
   * @param fn - `(datum, categoryIndex, seriesIndex) => yPixel`.
   */
  public y(fn: CoordFn): this {
    this._y = fn;
    return this;
  }

  /**
   * Creates the `<g id="labels-N">` group used by subclasses to append label text.
   * Must be called before any labels are appended.
   */
  protected _initLabels(): void {
    this._svgLabels = this._svg
      .append("g")
      .attr("id", `labels-${this._serie}`)
      .attr("opacity", "1") as unknown as SeriesGroup;
  }
}
