import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisTypes, ScaleTypes, StackTypes } from "../types/enums";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { LineShape } from "../shapes/LineShape";
import { AreaShape } from "../shapes/AreaShape";

/**
 * Line chart — one `<path class="line">` per series, drawn as an animated stroke.
 *
 * Features:
 * - Optional area fill beneath each line (`plotOptions.area.visible`).
 * - Optional data-point markers with tooltip support.
 * - Optional value labels above each marker.
 * - Supports ordinal (string) and time-based X axes.
 * - Areas are drawn first (behind lines) so lines always appear on top.
 *
 * @example
 * ```ts
 * const chart = new LineChart("#chart", data, {
 *   plotOptions: { area: { visible: true }, markers: { type: "circle" } },
 * });
 * chart.draw();
 * ```
 */
export class LineChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Mark Y axes as data axes so zero-lines are drawn when data goes negative
    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisTypes.Y;
    }
    this.canvas.legendArea.swatchType = "line";
  }

  /** Renders axes, optional area fills, and line series. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;
    const { visible: areaVisible, opacity: areaOpacity } = this.options.plotOptions.area;
    const { interpolation } = this.options.plotOptions.line;

    // Draw areas first (they sit behind lines)
    if (areaVisible) {
      for (let s = 0; s < this.series.length; s++) {
        new AreaShape(svgSeries, s)
          .animation(duration, ease)
          .color(this.colorPalette.color(s))
          .interpolation(interpolation)
          .opacity(areaOpacity)
          .x((d, i) => this.getXCoordinate(d, i, s))
          .y((d, i) => this.getYCoordinate(d, i, s))
          .y0((d, i) => this.getY0Coordinate(d, i, s))
          .y1((d, i) => this.getY1Coordinate(d, i, s))
          .draw(this.series.getSeriesData(s));
      }
    }

    // Draw lines (skipping range-only series that have no y values)
    for (let s = 0; s < this.series.length; s++) {
      if (this.series.items[s].data.length === 0) {continue;}

      new LineShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s))
        .interpolation(interpolation)
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

  /**
   * Returns the X pixel position for a datum using the ordinal or time scale.
   * For ordinal scales the midpoint of the band is used.
   */
  public override getXCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisTypes.X, this.series.items[serie].axis);
    const axis = this.axes[idx];
    const val  = this.categories.parseFormat(this.categories.getItem(i));

    if (axis.getScaleType() === ScaleTypes.Ordinal) {
      const scale = axis.scale as d3.ScaleBand<string>;
      return scale(String(val))! + scale.bandwidth() / 2;
    }
    return (axis.scale as d3.ScaleTime<number, number>)(val as Date);
  }

  /** Returns the Y pixel position for the raw `d.y` value. */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    const idx  = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y);
  }

  /** Returns the Y pixel position for the lower boundary `d.y0` (used by area fills). */
  public override getY0Coordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y0);
  }

  /** Returns the Y pixel position for the upper boundary `d.y1` (used by area fills). */
  public getY1Coordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y1);
  }
}

/**
 * Stacked line chart — series values are summed column by column so lines sit
 * on top of each other rather than overlapping.
 *
 * Y coordinates are derived from `d.sum` (cumulative total) instead of `d.y`.
 */
export class StackedLineChart extends LineChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackTypes.Normal;
    this.canvas.legendArea.swatchType = "line";
  }

  /** Maps to `d.sum` (cumulative stacked value). */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.sum);
  }

  /** Maps to `d.sum - d.y` (the bottom of this series' stacked segment). */
  public override getY0Coordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.sum - d.y);
  }

  /** Maps to `d.sum` (the top of this series' stacked segment). */
  public override getY1Coordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.sum);
  }
}

/**
 * 100% stacked line chart — series are normalised so that the combined total
 * always fills the full Y axis range (0–1, displayed as 0–100%).
 *
 * Y coordinates are derived from `d.y0` and `d.y1` (pre-computed percentage bounds).
 */
export class StackedPercentLineChart extends LineChart {
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    this.stackType = StackTypes.Percent;
    this.canvas.legendArea.swatchType = "line";
  }

  /** Maps to `d.y1` (upper percentage bound of this series' stacked segment). */
  public override getYCoordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y1);
  }

  /** Maps to `d.y0` (lower percentage bound of this series' stacked segment). */
  public override getY0Coordinate(d: IDatum, i: number, serie: number): number {
    const idx = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    return (this.axes[idx].scale as d3.ScaleLinear<number, number>)(d.y0);
  }
}
