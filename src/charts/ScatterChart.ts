import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisTypes, ScaleTypes } from "../types/enums";
import type { Axis, ChartScale } from "../core/Axis";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import { BubbleShape } from "../shapes/BubbleShape";

/**
 * Scatter / bubble chart.
 *
 * **Data format:**
 * - `series[0]` — X values (one per data point). Not rendered; not shown in legend.
 * - `series[1..n]` — Y values per group. Each may optionally include a `size[]` array
 *   to produce a bubble chart (variable-area symbols).
 *
 * Both axes use linear scales driven by the actual data range.
 * The X scale domain is `[0, max(series[0])]` (or `[min, max]` for negative X values).
 *
 * @example
 * ```ts
 * const data: IChartData = {
 *   categories: { format: "%s", data: ["A", "B", "C"] },
 *   series: [
 *     { name: "X",       data: [10, 20, 30] },          // X values
 *     { name: "Group 1", data: [5, 15, 25], size: [3, 6, 9] }, // Y + bubble magnitude
 *   ],
 * };
 * const chart = new ScatterChart("#chart", data);
 * chart.draw();
 * ```
 */
export class ScatterChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. `series[0]` provides X values; `series[1+]` provide Y values.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Legend shows Y series only (skip the X series at index 0)
    this.canvas.legendArea.items = this.series.getLabels().slice(1);

    // Legend swatches inherit fill-opacity/stroke from the .bubble CSS class
    this.canvas.legendArea.swatchCssClass = "bubble";

    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisTypes.Y;
    }
  }

  /** Renders axes and bubble shapes for each Y series. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;
    const { minRadius, maxRadius } = this.options.plotOptions.bubble;
    const minArea = Math.PI * minRadius ** 2;
    const maxArea = Math.PI * maxRadius ** 2;

    // Build a single linear scale across all Y series so bubbles are comparable.
    // Area is proportional to data value (correct perceptual encoding).
    const allSizes = this.series.items.slice(1).flatMap(s => s.size ?? []);
    const maxDataSize = allSizes.length > 0 ? Math.max(...allSizes) : 1;
    const sizeScale = d3.scaleLinear().domain([0, maxDataSize]).range([minArea, maxArea]);

    // series[0] = X values (skip rendering); series[1..n] = Y groups
    for (let s = 1; s < this.series.length; s++) {
      const rawSizes = this.series.items[s].size ?? [];
      const scaledAreas = rawSizes.length > 0
        ? rawSizes.map(v => sizeScale(v))
        : new Array(this.series.getSeriesData(s).length).fill(minArea);

      new BubbleShape(svgSeries, s)
        .animation(duration, ease)
        .color(this.colorPalette.color(s - 1))
        .sizes(scaledAreas)
        .labels(
          this.series.items[s].format,
          this.options.series.labels.rotate,
          this.options.series.labels.visible
        )
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie, serie - 1))
        .x((d, i) => this.getXCoordinate(d, i, s))
        .y((d, i) => this.getYCoordinate(d, i, s))
        .draw(this.series.getSeriesData(0)); // drive bubble position from X series
    }
  }

  /**
   * X coordinate comes from `series[0]` (the X-values series).
   * `d.y` here is the X value from that series.
   */
  public override getXCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisTypes.X, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return scale(d.y); // d.y = X value from series[0]
  }

  /**
   * Y coordinate comes from the corresponding Y series datum at position `i`.
   */
  public override getYCoordinate(_d: IDatum, i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisTypes.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return scale(this.series.getSeriesData(serie)[i].y);
  }

  /**
   * Overrides the default X scale with a linear scale driven by `series[0]` data values.
   * Domain: `[0, max]` (or `[min, max]` when X values are negative).
   */
  public override getXScale(axis: Axis): ChartScale {
    const data  = this.series.items[0].data;
    const min   = Math.min(...data);
    const max   = Math.max(...data);
    const start = this.canvas.plotArea.axisSize.left;
    const end   = this.canvas.plotArea.axisSize.left + this.canvas.plotArea.width;

    axis.setScaleType(ScaleTypes.Linear);
    return d3.scaleLinear()
      .domain([min < 0 ? min : 0, max])
      .nice()
      .range([start, end]);
  }

  /**
   * Overrides the default Y scale with a linear scale driven by Y series min/max.
   * Domain: `[max, 0]` (or `[max, min]` for negative Y values), top to bottom.
   */
  public override getYScale(axis: Axis): ChartScale {
    const min   = this.series.min(axis.name, this.stackType);
    const max   = this.series.max(axis.name, this.stackType);
    const start = this.canvas.plotArea.axisSize.top;
    const end   = this.canvas.plotArea.axisSize.top + this.canvas.plotArea.height;

    axis.setScaleType(ScaleTypes.Linear);
    return d3.scaleLinear()
      .domain([max, min < 0 ? min : 0])
      .nice()
      .range([start, end]);
  }
}
