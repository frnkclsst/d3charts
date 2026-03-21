import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisType, ScaleType, StackType } from "../types/enums";
import type { Axis, ChartScale } from "../core/Axis";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { ColumnShape } from "../shapes/ColumnShape";

/**
 * Vertical bar (column) chart — one `<rect class="column">` per data point per series.
 *
 * Multiple series are rendered side-by-side within each category band (grouped columns).
 * Columns grow upward from the baseline during the enter animation.
 *
 * Supports ordinal (string) and time-based X axes. Negative values are drawn below
 * the baseline (the column starts at `scale(0)` and grows downward).
 *
 * @example
 * ```ts
 * const chart = new ColumnChart("#chart", data, {
 *   xAxis: { gridlines: GridLineType.Major },
 *   yAxis: { title: { text: "Revenue" } },
 * });
 * chart.draw();
 * ```
 */
export class ColumnChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Mark Y axes as data axes so zero-lines are drawn when data goes negative
    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisType.Y;
    }

    // Legend swatches inherit fill-opacity/stroke from the .column CSS class
    this.canvas.legendArea.swatchCssClass = "column";
  }

  /** Renders axes and column series. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;

    for (let s = 0; s < this.series.length; s++) {
      const yIdx  = this.getAxisByName(AxisType.Y, this.series.items[s].axis);
      const zeroY = (this.axes[yIdx].scale as d3.ScaleLinear<number, number>)(0);

      new ColumnShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .startY(zeroY)
        .height((d, i) => this.getHeight(d, i, s))
        .width((d, i)  => this.getWidth(d, i, s))
        .labels(
          this.stackType === StackType.Percent && !this.series.items[s].format
            ? ".0%"
            : this.series.items[s].format,
          this.options.series.labels.rotate,
          this.options.series.labels.visible
        )
        .labelValue(this.stackType === StackType.Percent ? (d): number => d.perc : (d): number => d.y)
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie))
        .x((d, i) => this.getXCoordinate(d, i, s))
        .y((d, i) => this.getYCoordinate(d, i, s))
        .draw(this.series.getSeriesData(s));
    }
  }

  /**
   * Returns the pixel height of a column: `|scale(y1) - scale(y0)|`.
   * For plain series `y0 = 0` and `y1 = y`, so this equals `|scale(y) - scale(0)|`.
   */
  public getHeight(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y1) - scale(d.y0));
  }

  /**
   * Returns the pixel width of a single column.
   * - Ordinal scale: `bandWidth / numberOfSeries`.
   * - Time scale: `plotWidth / numberOfSeries / numberOfCategories`.
   */
  public getWidth(_d: IDatum, _i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>).bandwidth() / this.series.length;
    }
    return this.canvas.plotArea.width / this.series.length / this.categories.length;
  }

  /**
   * Returns the X pixel position of the left edge of a column.
   * Each series within a band is offset by `seriesIndex × columnWidth`.
   */
  public override getXCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));

    if (axis.getScaleType() === ScaleType.Ordinal) {
      const scale = axis.scale as d3.ScaleBand<string>;
      return (scale(String(val)) ?? 0) + scale.bandwidth() / this.series.length * serie;
    }
    const scale = axis.scale as d3.ScaleTime<number, number>;
    return scale(val as Date) + this.canvas.plotArea.width / this.series.length / this.categories.length * serie;
  }

  /**
   * Returns the Y pixel position of the top edge of a column.
   * For positive values: `scale(y1)`. For negative values: `scale(0)` (column grows down).
   */
  public override getYCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return d.y < 0 ? scale(0) : scale(d.y1);
  }
}

/**
 * Stacked column chart — series are stacked vertically rather than placed side-by-side.
 * Each column's width spans the full band and its height represents only its own `y` value.
 */
export class StackedColumnChart extends ColumnChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackType.Normal;
  }

  /** Height for stacked columns: `|scale(0) - scale(y)|` (absolute contribution). */
  public override getHeight(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(0) - scale(d.y));
  }

  /** Width for stacked columns: full band width (no per-series subdivision). */
  public override getWidth(_d: IDatum, _i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>).bandwidth();
    }
    return this.canvas.plotArea.width / this.series.length / this.categories.length;
  }

  /** X position for stacked columns: band start (no per-series offset). */
  public override getXCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>)(String(val)) ?? 0;
    }
    return (axis.scale as d3.ScaleTime<number, number>)(val as Date);
  }

  /** Y position for stacked columns: `scale(d.sum)` — the running cumulative top. */
  public override getYCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return scale(d.sum);
  }
}

/**
 * 100% stacked column chart — columns are normalised so the combined stack always
 * fills the full Y axis (0–1, displayed as 0–100%).
 */
export class StackedPercentColumnChart extends StackedColumnChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackType.Percent;
  }

  /** Y position for percent-stacked columns: `scale(d.y1)` (upper percentage bound). */
  public override getYCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return scale(d.y1);
  }

  /** Height for percent-stacked columns: `|scale(y1) - scale(y0)|`. */
  public override getHeight(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y1) - scale(d.y0));
  }

  /**
   * Overrides the Y scale with a fixed [1, 0] domain (100% to 0%).
   * Skips `.nice()` so the axis never exceeds 100%.
   * Defaults the tick-label format to ".0%" when no format is configured.
   */
  public override getYScale(axis: Axis): ChartScale {
    const pa = this.canvas.plotArea;
    axis.setScaleType(ScaleType.Linear);
    if (!axis.labels.format) {axis.labels.format = ".0%";}
    return d3.scaleLinear()
      .domain([1, 0])
      .range([pa.axisSize.top, pa.axisSize.top + pa.height]);
  }
}
