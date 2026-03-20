import * as d3 from "d3";
import { CartesianChart } from "./CartesianChart";
import { AxisType, ScaleType } from "../types/enums";
import type { Axis, ChartScale } from "../core/Axis";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";
import type { TooltipExtractor } from "../core/Tooltip";
import { ColumnShape } from "../shapes/ColumnShape";

/**
 * Variwide chart — a column chart where each column's **width** encodes a second
 * data dimension (the `weight` property on the series), while its **height** encodes
 * the primary value.
 *
 * Columns are packed edge-to-edge with no gaps. Each column receives a unique colour
 * from the palette. A typical use case is visualising labour cost (height) vs GDP
 * (width) per country.
 *
 * @example
 * ```ts
 * const data = {
 *   categories: { format: "%s", data: ["Norway", "Belgium", "Germany"] },
 *   series: [{
 *     name: "Labour cost",
 *     format: "€,.0f",
 *     data:   [52, 48, 37],
 *     weight: [594, 627, 4444]  // GDP in billions USD
 *   }],
 * };
 * const chart = new VariwideChart("#chart", data);
 * chart.draw();
 * ```
 */
export class VariwideChart extends CartesianChart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. The first series must supply a `weight` array.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Mark Y axes as data axes so zero-lines are drawn when data goes negative
    for (const axis of this.axes) {
      axis.isDataAxis = axis.type === AxisType.Y;
    }
  }

  /** Renders axes and variwide column series. */
  public override draw(): void {
    super.draw(); // runs two-pass axis cycle
    if (!this.hasData()) { return; }

    const weights    = this.series.items[0].weight;
    const cumulative = weights.map((_, i) => weights.slice(0, i).reduce((a, b) => a + b, 0));

    // Retrieve the final linear x-scale from pass 2
    const xIdx   = this.getAxisByName(AxisType.X, "");
    const xScale = this.axes[xIdx].scale as d3.ScaleLinear<number, number>;

    // Replace the default numeric ticks with category labels at column midpoints
    this._patchXAxisTicks(xIdx, cumulative, weights);

    const svgSeries = this.canvas.plotArea.svg
      .append("g")
      .attr("class", "series") as unknown as d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>;

    const { duration, ease } = this.options.plotOptions.animation;
    const yIdx  = this.getAxisByName(AxisType.Y, "");
    const zeroY = (this.axes[yIdx].scale as d3.ScaleLinear<number, number>)(0);

    new ColumnShape(svgSeries, 0)
      .animation(duration, ease)
      .colorFn((i) => this.colorPalette.color(i))
      .startY(zeroY)
      .height((d, i) => this.getHeight(d, i, 0))
      .width((_d, i) => xScale(cumulative[i] + weights[i]) - xScale(cumulative[i]))
      .labels(
        this.series.items[0].format,
        this.options.series.labels.rotate,
        this.options.series.labels.visible
      )
      .labelValue((d) => d.y)
      .tooltipFn((sel, serie) => {
        const extractor: TooltipExtractor = (datum, i) => ({
          value:      this.tooltip.formatValue(datum as IDatum, serie),
          percent:    "",
          colorIndex: i
        });
        this.tooltip.attach(sel as never, serie, extractor);
      })
      .x((_d, i) => xScale(cumulative[i]))
      .y((d, i) => this.getYCoordinate(d, i, 0))
      .draw(this.series.getSeriesData(0));
  }

  /**
   * Returns a linear X scale with domain `[0, totalWeight]` so that column widths
   * are proportional to each datum's weight value.
   *
   * The x-axis tick labels are subsequently patched by `_patchXAxisTicks()` to show
   * category names at column midpoints instead of raw numeric weight values.
   */
  public override getXScale(axis: Axis): ChartScale {
    const pa      = this.canvas.plotArea;
    const start   = pa.axisSize.left;
    const end     = pa.axisSize.left + pa.width;
    const weights = this.series.items[0]?.weight ?? [];
    const total   = weights.reduce((a, b) => a + b, 0) || 1;

    axis.setScaleType(ScaleType.Linear);
    return d3.scaleLinear()
      .domain([0, total])
      .range([start, end]);
  }

  /**
   * Returns the pixel height of a column: `|scale(y1) - scale(y0)|`.
   */
  public getHeight(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return Math.abs(scale(d.y1) - scale(d.y0));
  }

  /**
   * Returns the Y pixel position of the top edge of a column.
   */
  public override getYCoordinate(d: IDatum, _i: number, serie: number): number {
    const idx   = this.getAxisByName(AxisType.Y, this.series.items[serie].axis);
    const scale = this.axes[idx].scale as d3.ScaleLinear<number, number>;
    return d.y < 0 ? scale(0) : scale(d.y1);
  }

  /**
   * Re-renders the x-axis with tick marks positioned at each column's midpoint
   * and labelled with the corresponding category name.
   *
   * Called after `super.draw()` (which renders the axis with default linear ticks)
   * to replace the numeric ticks with meaningful category labels.
   */
  private _patchXAxisTicks(xIdx: number, cumulative: number[], weights: number[]): void {
    const axis      = this.axes[xIdx];
    const labels    = this.categories.labels;
    const midpoints = cumulative.map((c, i) => c + weights[i] / 2);

    axis.getAxisFn()
      .tickValues(midpoints)
      .tickFormat((_, i) => labels[i] ?? "");

    axis.getSvgAxis().call(axis.getAxisFn() as never);

    // Ensure all category ticks are visible (pass-1 auto-thinning used wrong positions)
    axis.getSvgAxis().selectAll<SVGGElement, unknown>(".tick text").style("display", null);

    // Re-apply label rotation if explicitly configured (d3 resets transforms on new ticks)
    const rotate = axis.labels.rotate;
    if (rotate) {
      const angle = -Math.abs(rotate); // bottom axis always rotates to a negative angle
      axis.getSvgAxis().selectAll<SVGTextElement, unknown>(".tick text").each(function () {
        const text = d3.select(this);
        const y    = Number(text.attr("y"));
        text
          .style("alignment-baseline", "middle")
          .style("text-anchor", "end")
          .attr("y", "0").attr("dy", "0")
          .attr("transform", `translate(0,${y}) rotate(${angle})`);
      });
    }
  }
}
