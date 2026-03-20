import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisType, ScaleType, StackType } from "../types/enums";
import type { Axis, ChartScale } from "../core/Axis";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { BarShape } from "../shapes/BarShape";

/**
 * Horizontal bar chart — one `<rect class="bar">` per data point per series.
 *
 * Compared to {@link ColumnChart}, the axes are transposed:
 * - The **X axis** carries data values (linear scale).
 * - The **Y axis** carries category labels (ordinal or time scale).
 *
 * Multiple series are rendered side-by-side within each category band.
 * Bars grow from left to right during the enter animation.
 * Negative bars grow to the left from the zero line.
 *
 * @example
 * ```ts
 * const chart = new BarChart("#chart", data, {
 *   xAxis: { gridlines: GridLineType.Major },
 * });
 * chart.draw();
 * ```
 */
export class BarChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Mark X axes as data axes so zero-lines are drawn when data goes negative
    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisType.X;
    }
  }

  /** Renders axes and bar series. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;

    for (let s = 0; s < this.series.length; s++) {
      const xIdx  = this.getAxisByName(AxisType.X, this.series.items[s].axis);
      const zeroX = (this.
        axes[xIdx].scale as d3.ScaleLinear<number, number>)(0);

      new BarShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .startX(zeroX)
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
   * Returns the pixel height (vertical thickness) of a bar.
   * - Ordinal scale: `bandWidth / numberOfSeries`.
   * - Time scale: `plotHeight / numberOfSeries / numberOfCategories`.
   */
  public getHeight(_d: IDatum, _i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const axis = this.axes[idx];
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>).bandwidth() / this.series.length;
    }
    return this.canvas.plotArea.height / this.series.length / this.categories.length;
  }

  /**
   * Returns the pixel width (horizontal length) of a bar: `|scale(y1) - scale(y0)|`.
   * For plain series `y0 = 0`, so this equals `|scale(y) - scale(0)|`.
   */
  public getWidth(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y1) - scale(d.y0));
  }

  /**
   * Returns the X pixel position (left edge) of a bar.
   * Negative bars start at `|scale(y)|` (mirrored from zero).
   * Positive bars start at `scale(y0)` (which equals `scale(0)` for plain series).
   */
  public override getXCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return d.y < 0 ? Math.abs(scale(d.y)) : scale(d.y0);
  }

  /**
   * Returns the Y pixel position (top edge) of a bar.
   * Each series within a band is offset by `seriesIndex × barHeight`.
   */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));

    if (axis.getScaleType() === ScaleType.Ordinal) {
      const scale = axis.scale as d3.ScaleBand<string>;
      return (scale(String(val)) ?? 0) + scale.bandwidth() / this.series.length * serie;
    }
    const scale = axis.scale as d3.ScaleTime<number, number>;
    return scale(val as Date) + this.canvas.plotArea.height / this.categories.length / this.series.length * serie;
  }

  /**
   * Overrides the default X scale with a **linear** scale driven by data values.
   * Domain: `[min, max]` where min falls back to 0 when all values are non-negative.
   */
  public override getXScale(axis: Axis): ChartScale {
    const min   = this.series.min(axis.name, this.stackType);
    const max   = this.series.max(axis.name, this.stackType);
    const start = this.canvas.plotArea.axisSize.left;
    const end   = this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

    axis.setScaleType(ScaleType.Linear);
    return d3.scaleLinear()
      .domain([min < 0 ? min : 0, max])
      .nice()
      .range([start, end]);
  }

  /**
   * Overrides the default Y scale with an **ordinal or time** scale driven by categories.
   * - Ordinal: `scaleBand` with configured padding.
   * - Time: `scaleTime` with reversed domain so the earliest date is at the top.
   */
  public override getYScale(axis: Axis): ChartScale {
    const start = this.canvas.plotArea.axisSize.top;
    const end   = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

    if (this.categories.format === "%s") {
      axis.setScaleType(ScaleType.Ordinal);
      return d3.scaleBand<string>()
        .domain(this.categories.labels)
        .range([start, end])
        .paddingInner(this.options.plotOptions.bands.innerPadding)
        .paddingOuter(this.options.plotOptions.bands.outerPadding);
    }

    axis.setScaleType(ScaleType.Time);
    return d3.scaleTime()
      .domain(
        (d3.extent(this.categories.labels, (l) => {
          const p = this.categories.parseFormat(l);
          return p instanceof Date ? p : new Date(String(p));
        }) as [Date, Date]).reverse()
      )
      .nice()
      .range([start, end]);
  }
}

/**
 * Stacked bar chart — series are stacked horizontally rather than placed side-by-side.
 * Each bar's height spans the full band and its width represents only its own `y` value.
 */
export class StackedBarChart extends BarChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackType.Normal;
  }

  /** Height for stacked bars: full band width (no per-series subdivision). */
  public override getHeight(_d: IDatum, _i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const axis = this.axes[idx];
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>).bandwidth();
    }
    return this.canvas.plotArea.height / this.series.length / this.categories.length;
  }

  /** Width for stacked bars: `|scale(0) - scale(y)|` (absolute contribution). */
  public override getWidth(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(0) - scale(d.y));
  }

  /**
   * X position for stacked bars.
   * - Negative values: start at `scale(sum + y)` (right edge of the negative segment).
   * - Positive values: start at `scale(sum - y)` (left edge of the positive segment).
   */
  public override getXCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return d.perc < 0
      ? scale((d.sum + d.y))
      : scale(d.sum - d.y);
  }

  /** Y position for stacked bars: band start (no per-series offset). */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));
    if (axis.getScaleType() === ScaleType.Ordinal) {
      return (axis.scale as d3.ScaleBand<string>)(String(val)) ?? 0;
    }
    return (axis.scale as d3.ScaleTime<number, number>)(val as Date);
  }
}

/**
 * 100% stacked bar chart — bars are normalised so the combined stack always
 * fills the full X axis (0–1, displayed as 0–100%).
 */
export class StackedPercentBarChart extends StackedBarChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackType.Percent;
  }

  /**
   * Overrides the X scale with a fixed [0, 1] domain (0% to 100%).
   * Skips `.nice()` so the axis never exceeds 100%.
   * Defaults the tick-label format to ".0%" when no format is configured.
   */
  public override getXScale(axis: Axis): ChartScale {
    const start = this.canvas.plotArea.axisSize.left;
    const end   = this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;
    axis.setScaleType(ScaleType.Linear);
    if (!axis.labels.format) {axis.labels.format = ".0%";}
    return d3.scaleLinear()
      .domain([0, 1])
      .range([start, end]);
  }

  /** X position for percent-stacked bars: `scale(d.y0)` (left edge of the percent segment). */
  public override getXCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return scale(d.y0);
  }

  /** Width for percent-stacked bars: `|scale(y1) - scale(y0)|`. */
  public override getWidth(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y1) - scale(d.y0));
  }
}
