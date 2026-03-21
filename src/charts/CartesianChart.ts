import * as d3 from "d3";
import { Chart } from "./Chart";
import { XAxis, YAxis } from "../core/Axis";
import type { Axis, IAxisContext, ChartScale } from "../core/Axis";
import type { AxisType } from "../types/enums";
import { ScaleTypes } from "../types/enums";
import type { IDatum, IChartData, IOptions } from "../types/interfaces";

/**
 * Abstract base class for all cartesian (axis-based) chart types.
 *
 * Extends {@link Chart} with:
 * - A collection of {@link XAxis} and {@link YAxis} instances built from `options.xAxes` / `options.yAxes`.
 * - A two-pass axis rendering cycle (`setSize` → `draw`) that measures axes before
 *   positioning them, ensuring the plot area shrinks correctly to fit axis labels.
 * - Default scale factories (`getXScale`, `getYScale`) that can be overridden by subclasses
 *   (e.g. {@link BarChart} swaps the scale types for its horizontal orientation).
 * - Coordinate helper stubs (`getXCoordinate`, `getYCoordinate`, etc.) implemented by
 *   concrete chart classes.
 *
 * Concrete classes: {@link LineChart}, {@link ColumnChart}, {@link BarChart},
 * {@link ScatterChart}, {@link ComboChart}.
 */
export abstract class CartesianChart extends Chart {
  /** All axes for this chart — X axes first, then Y axes. */
  public axes: Axis[] = [];

  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data including categories and series definitions.
   * @param options  - Optional partial configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    for (const axOpts of this.options.xAxes) {
      this.axes.push(new XAxis(axOpts));
    }
    for (const axOpts of this.options.yAxes) {
      this.axes.push(new YAxis(axOpts));
    }

    this.canvas.legendArea.items = this.series.getLabels();
  }

  /**
   * Renders axes in two passes (size measurement then positioning + gridlines).
   * Subclasses override this to draw data shapes after calling `super.draw()`.
   */
  public override draw(): void {
    super.draw();

    if (!this.hasData()) {return;}

    const ctx = this._makeAxisContext();

    for (const axis of this.axes) {
      axis.setSize(ctx);
    }
    for (let i = 0; i < this.axes.length; i++) {
      this.axes[i].draw(ctx);
      if (this.axes.length > 1) {
        this.axes[i].setColor(this.colorPalette.color(i));
      }
    }
  }

  /**
   * Finds the index of the axis matching a given type and optional name reference.
   *
   * When multiple axes of the same type exist, the one whose `name` equals `ref` is
   * returned. If no named match is found, the last axis of the given type is returned
   * (i.e. the default axis).
   *
   * @param type - `AxisType.X` or `AxisType.Y`.
   * @param ref  - Axis name to look for (empty string matches the last axis of the type).
   * @returns Zero-based index into `this.axes`, or `-1` if no matching axis exists.
   */
  public getAxisByName(type: AxisType, ref: string): number {
    let last = -1;
    for (let i = 0; i < this.axes.length; i++) {
      if (this.axes[i].type === type) {
        last = i;
        if (ref !== "" && this.axes[i].name === ref) {return i;}
      }
    }
    return last;
  }

  // ─── Coordinate helpers — overridden by concrete charts ──────────────────

  /**
   * Returns the X pixel coordinate for a datum.
   * Overridden by all concrete cartesian chart classes.
   */
  public getXCoordinate(_d: IDatum, _i: number, _serie: number): number { return 0; }

  /**
   * Returns the Y pixel coordinate for a datum.
   * Overridden by all concrete cartesian chart classes.
   */
  public getYCoordinate(_d: IDatum, _i: number, _serie: number): number { return 0; }

  /**
   * Returns the lower Y pixel coordinate for a range datum (`y0`).
   * Relevant for area and range-bar charts.
   */
  public getY0Coordinate(_d: IDatum, _i: number, _serie: number): number { return 0; }

  /**
   * Returns the upper Y pixel coordinate for a range datum (`y1`).
   * Relevant for area and range-bar charts.
   */
  public getY1Coordinate(_d: IDatum, _i: number, _serie: number): number { return 0; }

  // ─── Default scale factories ──────────────────────────────────────────────

  /**
   * Builds the X scale for a given axis.
   *
   * - Returns a `scaleBand` (ordinal) when `categories.format === "%s"`.
   * - Returns a `scaleTime` for all other category formats.
   *
   * Overridden by {@link BarChart} which uses a linear X scale for its data values.
   *
   * @param axis - The X axis being scaled (its `scaleType` is updated as a side effect).
   */
  public getXScale(axis: Axis): ChartScale {
    const pa    = this.canvas.plotArea;
    const start = pa.axisSize.left;
    const end   = pa.axisSize.left + pa.width;

    if (this.categories.format === "%s") {
      axis.setScaleType(ScaleTypes.Ordinal);
      return d3.scaleBand<string>()
        .domain(this.categories.labels)
        .range([start, end])
        .paddingInner(this.options.plotOptions.bands.innerPadding)
        .paddingOuter(this.options.plotOptions.bands.outerPadding);
    }

    axis.setScaleType(ScaleTypes.Time);
    return d3.scaleTime()
      .domain(
        d3.extent(this.categories.labels, (label) => {
          const parsed = this.categories.parseFormat(label);
          return parsed instanceof Date ? parsed : new Date(String(parsed));
        }) as [Date, Date]
      )
      .nice()
      .range([start, end]);
  }

  /**
   * Builds the Y scale for a given axis (always a linear scale).
   *
   * Domain runs from `max` (top of chart) down to `min` or 0, whichever is lower.
   *
   * Overridden by {@link BarChart} and {@link ScatterChart}.
   *
   * @param axis - The Y axis being scaled (its `scaleType` is updated as a side effect).
   */
  public getYScale(axis: Axis): ChartScale {
    const pa  = this.canvas.plotArea;
    const min = this.series.min(axis.name, this.stackType);
    const max = this.series.max(axis.name, this.stackType);

    axis.setScaleType(ScaleTypes.Linear);
    return d3.scaleLinear()
      .domain([max, min < 0 ? min : 0])
      .nice()
      .range([pa.axisSize.top, pa.axisSize.top + pa.height]);
  }

  /**
   * Builds the {@link AxisContext} object passed to each axis during the draw cycle.
   * Wraps `getXScale` / `getYScale` as callbacks to avoid a direct import of `CartesianChart`
   * inside `Axis`.
   */
  private _makeAxisContext(): IAxisContext {
    return {
      plotArea: this.canvas.plotArea,
      getXScale: (axis) => this.getXScale(axis),
      getYScale: (axis) => this.getYScale(axis),
      seriesMin: (name?) => this.series.min(name, this.stackType)
    };
  }
}
