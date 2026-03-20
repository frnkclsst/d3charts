import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisType, ScaleType } from "../types/enums";
import type { Axis, ChartScale } from "../core/Axis";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { HeatmapShape } from "../shapes/HeatmapShape";

/**
 * Heatmap chart — a grid of colour-coded cells where each cell's fill intensity
 * encodes a numeric value across two categorical dimensions (X categories × Y series).
 *
 * Both axes use `d3.scaleBand` (ordinal). The fill colour of each cell is
 * determined by a sequential two-stop colour scale that spans the global
 * min–max value range. The colour range can be customised via
 * `plotOptions.heatmap.colorRange`.
 *
 * @example
 * ```ts
 * const data: IChartData = {
 *   categories: { format: "%s", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
 *   series: [
 *     { name: "Morning",   data: [10, 20, 30, 25, 15] },
 *     { name: "Afternoon", data: [40, 55, 60, 45, 30] },
 *     { name: "Evening",   data: [5,  10, 15, 20, 10] },
 *   ],
 * };
 * const chart = new HeatmapChart("#chart", data, {
 *   plotOptions: { heatmap: { colorRange: ["#fff5e6", "#b30000"] } },
 * });
 * chart.draw();
 * ```
 */
export class HeatmapChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data with categories (X axis) and series (Y rows).
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Neither axis drives a zero-line — both are categorical band axes
    for (const axis of this.axes) {
      axis.isDataAxis = false;
    }
  }

  /**
   * X scale: ordinal band over the category labels.
   * Uses tight padding so cells form a near-seamless grid.
   */
  public override getXScale(axis: Axis): ChartScale {
    const pa = this.canvas.plotArea;
    axis.setScaleType(ScaleType.Ordinal);
    return d3.scaleBand<string>()
      .domain(this.categories.labels)
      .range([pa.axisSize.left, pa.axisSize.left + pa.width])
      .paddingInner(0.02)
      .paddingOuter(0.02);
  }

  /**
   * Y scale: ordinal band over the series names (one row per series).
   * Uses tight padding so cells form a near-seamless grid.
   */
  public override getYScale(axis: Axis): ChartScale {
    const pa           = this.canvas.plotArea;
    const seriesNames  = this.series.getLabels();
    axis.setScaleType(ScaleType.Ordinal);
    return d3.scaleBand<string>()
      .domain(seriesNames)
      .range([pa.axisSize.top, pa.axisSize.top + pa.height])
      .paddingInner(0.02)
      .paddingOuter(0.02);
  }

  /** Renders axes and heatmap cell rows. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) { return; }

    // Compute global value range across all series for the colour scale
    let minVal =  Infinity;
    let maxVal = -Infinity;
    for (let s = 0; s < this.series.length; s++) {
      for (const d of this.series.getSeriesData(s)) {
        if (!isNaN(d.y)) {
          if (d.y < minVal) { minVal = d.y; }
          if (d.y > maxVal) { maxVal = d.y; }
        }
      }
    }

    // Sequential two-stop colour scale
    const [c0, c1] = this.options.plotOptions.heatmap.colorRange;
    const colorFn  = d3.scaleLinear<string>()
      .domain([minVal, maxVal])
      .range([c0, c1])
      .interpolate(d3.interpolateRgb);

    const xIdx      = this.getAxisByName(AxisType.X, "");
    const yIdx      = this.getAxisByName(AxisType.Y, "");
    const xScale    = this.axes[xIdx].scale as d3.ScaleBand<string>;
    const yScale    = this.axes[yIdx].scale as d3.ScaleBand<string>;
    const cellWidth  = xScale.bandwidth();
    const cellHeight = yScale.bandwidth();

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease }  = this.options.plotOptions.animation;
    const seriesNames          = this.series.getLabels();

    for (let s = 0; s < this.series.length; s++) {
      const rowY = yScale(seriesNames[s]) ?? 0;

      new HeatmapShape(svgSeries, s)
        .animation(duration, ease)
        .colorFn(colorFn)
        .cellWidth(cellWidth)
        .cellHeight(cellHeight)
        .labels(
          this.series.items[s].format,
          this.options.series.labels.rotate,
          this.options.series.labels.visible
        )
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie))
        .x((_d, i) => xScale(String(this.categories.getItem(i))) ?? 0)
        .y(() => rowY)
        .draw(this.series.getSeriesData(s));
    }
  }

  /** Returns the X pixel position of a cell's left edge. */
  public override getXCoordinate(_d: IDatum, i: number, _serie: number): number {
    const idx   = this.getAxisByName(AxisType.X, "");
    const scale = this.axes[idx].scale as d3.ScaleBand<string>;
    return scale(String(this.categories.getItem(i))) ?? 0;
  }

  /** Returns the Y pixel position of a cell's top edge. */
  public override getYCoordinate(_d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, "");
    const scale = this.axes[idx].scale as d3.ScaleBand<string>;
    return scale(this.series.getLabels()[serie]) ?? 0;
  }
}
