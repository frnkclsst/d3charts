import type * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisType, ScaleType, SeriesTypes } from "../types/enums";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { ColumnShape } from "../shapes/ColumnShape";
import { LineShape } from "../shapes/LineShape";

/**
 * Combo chart — mixes column and line series in the same chart.
 *
 * Set `ISerie.type` to `"column"` or `"line"` on each series item to control
 * how it is rendered. Series without a type are silently skipped.
 *
 * Columns are drawn first (behind lines) so lines always appear on top.
 * Only column-type series count toward the column width calculation — line
 * series do not occupy band space.
 *
 * @example
 * ```ts
 * const data: IChartData = {
 *   categories: { format: "%s", data: ["Jan", "Feb", "Mar"] },
 *   series: [
 *     { name: "Sales",  type: "column", data: [100, 200, 150] },
 *     { name: "Target", type: "line",   data: [120, 180, 160] },
 *   ],
 * };
 * const chart = new ComboChart("#chart", data);
 * chart.draw();
 * ```
 */
export class ComboChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. Each series must have `type: "column"` or `type: "line"`.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisType.Y;
    }
  }

  /** Renders axes, then column series, then line series. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;

    // Draw columns first (behind lines)
    for (let s = 0; s < this.series.length; s++) {
      if (this.series.items[s].type !== "column") {continue;}

      const yIdx  = this.getAxisByName(AxisType.Y, this.series.items[s].axis);
      const zeroY = (this.axes[yIdx].scale as d3.ScaleLinear<number, number>)(0);

      new ColumnShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .startY(zeroY)
        .height((d, i) => this._colHeight(d, i, s))
        .width((d, i)  => this._colWidth(d, i, s, this._columnCount()))
        .labels(
          this.series.items[s].format,
          this.options.series.labels.rotate,
          this.options.series.labels.visible
        )
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie))
        .x((d, i) => this.getXCoordinate(d, i, s))
        .y((d, i) => this.getYCoordinate(d, i, s))
        .draw(this.series.getSeriesData(s));
    }

    // Draw lines on top
    for (let s = 0; s < this.series.length; s++) {
      if (this.series.items[s].type !== "line") {continue;}
      if (this.series.items[s].data.length === 0) {continue;}

      new LineShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .interpolation(this.options.plotOptions.line.interpolation)
        .labels(
          this.series.items[s].format,
          this.options.series.labels.rotate,
          this.options.series.labels.visible
        )
        .marker(
          this.options.plotOptions.markers.size,
          this.series.items[s].marker,
          this.options.plotOptions.markers.visible
        )
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie))
        .x((d, i) => this.getXCoordinate(d, i, s))
        .y((d, i) => this.getYCoordinate(d, i, s))
        .draw(this.series.getSeriesData(s));
    }
  }

  // ─── coordinate overrides ──────────────────────────────────────────────────

  /** Dispatches to the column or line X helper based on series type. */
  public override getXCoordinate(d: IDatum, i: number, serie: number): number {
    if (this.series.items[serie].type === SeriesTypes.Column) {
      return this._colX(d, i, serie, this._columnCount());
    }
    return this._lineX(d, i, serie);
  }

  /** Dispatches to the column or line Y helper based on series type. */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    if (this.series.items[serie].type === SeriesTypes.Column) {
      return this._colY(d, i, serie);
    }
    return this._lineY(d, i, serie);
  }

  // ─── column helpers ────────────────────────────────────────────────────────

  /**
   * Pixel height of a column: `|scale(y) - scale(0)|`.
   * Negative values produce a downward-growing column.
   */
  private _colHeight(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y) - scale(0));
  }

  /**
   * Pixel width of a column, divided among column-type series only.
   * - Ordinal: `bandWidth / columnTotal`.
   * - Time: `plotWidth / columnTotal / categoryCount`.
   */
  private _colWidth(_d: IDatum, _i: number, serie: number, colTotal: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>).bandwidth() / colTotal;
    }
    return this.canvas.plotArea.width / colTotal / this.categories.length;
  }

  /**
   * X position (left edge) of a column.
   * Each column-type series is offset by its column-index (not overall series-index).
   */
  private _colX(d: IDatum, i: number, serie: number, colTotal: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));
    const colIdx = this._columnIndex(serie);

    if (axis.getScaleType() === ScaleType.Ordinal) {
      const scale = axis.scale as d3.ScaleBand<string>;
      return (scale(String(val)) ?? 0) + scale.bandwidth() / colTotal * colIdx;
    }
    const scale = axis.scale as d3.ScaleTime<number, number>;
    return scale(val as Date) + this.canvas.plotArea.width / this.categories.length / colTotal * colIdx;
  }

  /**
   * Y position (top edge) of a column.
   * Negative values start above `scale(y)` so the column extends upward to `scale(0)`.
   */
  private _colY(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return d.y < 0
      ? scale(d.y) - Math.abs(scale(d.y) - scale(0))
      : scale(d.y);
  }

  // ─── line helpers ──────────────────────────────────────────────────────────

  /**
   * X position for a line series data point.
   * For ordinal scales the midpoint of the band is used; for time scales the raw pixel position.
   */
  private _lineX(_d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));
    if (axis.getScaleType() === ScaleType.Ordinal) {
      const scale = axis.scale as d3.ScaleBand<string>;
      return (scale(String(val)) ?? 0) + scale.bandwidth() / 2;
    }
    return (axis.scale as d3.ScaleTime<number, number>)(val as Date);
  }

  /** Y position for a line series data point: `scale(d.y)`. */
  private _lineY(d: IDatum, _i: number, serie: number): number {
    const idx = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y);
  }

  // ─── utils ─────────────────────────────────────────────────────────────────

  /** Returns the total number of column-type series (used to divide band width). */
  private _columnCount(): number {
    return this.series.items.filter((s) => s.type === SeriesTypes.Column).length;
  }

  /**
   * Returns the zero-based index of `serie` among column-type series only.
   * Used to compute the X offset within a band, ignoring line-type series.
   *
   * @param serie - Overall series index.
   */
  private _columnIndex(serie: number): number {
    let count = -1;
    for (let i = 0; i <= serie; i++) {
      if (this.series.items[i].type === SeriesTypes.Column) {count++;}
    }
    return count;
  }
}
