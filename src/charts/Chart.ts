import * as d3 from "d3";
import { Canvas } from "../core/Canvas";
import { Categories } from "../core/Categories";
import { ColorPalette } from "../core/ColorPalette";
import { Series } from "../core/Series";
import { Tooltip } from "../core/Tooltip";
import { resolveOptions } from "../core/Options";
import type { ResolvedOptions } from "../core/Options";
import { StackTypes } from "../types/enums";
import type { StackType } from "../types/enums";
import type { IChartData, IOptions } from "../types/interfaces";

/**
 * Abstract base class for all chart types.
 *
 * Handles:
 * - Options resolution ({@link resolveOptions}).
 * - Construction of shared sub-systems: {@link Canvas}, {@link Categories},
 *   {@link ColorPalette}, {@link Series}, and {@link Tooltip}.
 * - Responsive re-draw via `ResizeObserver`.
 * - Series visibility toggling (legend click → fade transition).
 * - Cleanup via `destroy()`.
 *
 * Concrete chart classes extend either this class (for non-Cartesian charts such as
 * {@link PieChart}) or {@link CartesianChart} (for axis-based charts).
 *
 * @example
 * ```ts
 * const chart = new LineChart("#chart", data, options);
 * chart.draw();
 * // later:
 * chart.destroy();
 * ```
 */
export abstract class Chart {
  /** The canvas that owns the root SVG and the three layout areas. */
  public canvas: Canvas;
  /** Category labels shared across all series. */
  public categories: Categories;
  /** Cyclic colour palette used to assign colours to series. */
  public colorPalette: ColorPalette;
  /** The collection of normalised series and their datum matrix. */
  public series: Series;
  /** Fully-resolved chart options (with defaults applied). */
  public options: ResolvedOptions;
  /** CSS selector of the DOM element the chart is mounted into. */
  public selector: string;
  /**
   * Stacking mode for the chart.
   * Set by subclasses (e.g. `StackedColumnChart` sets `StackType.Normal`).
   * Defaults to `StackType.None`.
   */
  public stackType: StackType;
  /** Hover tooltip manager. */
  public tooltip: Tooltip;

  private readonly _resizeObserver: ResizeObserver | null = null;
  private _resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private _initialObserverFired = false;
  /** Preserved raw input data so `draw()` can rebuild `Series` with the current `stackType`. */
  private readonly _rawData: IChartData;

  /**
   * @param selector - CSS selector for the container element (e.g. `"#my-chart"`).
   * @param data     - Chart data including categories and series definitions.
   * @param options  - Optional partial configuration. Missing fields use defaults.
   * @throws {Error} If `selector` does not match any element in the DOM.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    this.selector  = selector;
    this.stackType = StackTypes.None;
    this.options   = resolveOptions(options);
    this._rawData  = data;

    if (d3.select(selector).empty()) {
      throw new Error(`Chart selector '${selector}' not found in DOM`);
    }

    this.categories  = new Categories(data.categories.data, data.categories.format);
    this.colorPalette = new ColorPalette(this.options.plotOptions.colors);
    this.series      = new Series(data.series, this.options, this.stackType);
    this.canvas      = new Canvas(this.options);
    this.tooltip     = new Tooltip(
      selector,
      this.series,
      this.categories,
      this.colorPalette,
      this.options.tooltip
    );

    // Responsive: redraw on container resize
    const node = d3.select(selector).node() as Element | null;
    if (node && typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => {
        if (!this._initialObserverFired) { this._initialObserverFired = true; return; } // skip initial notification
        if (this._resizeTimer !== null) { clearTimeout(this._resizeTimer); }
        this._resizeTimer = setTimeout(() => {
          this._resizeTimer = null;
          d3.select(this.selector).selectAll("*").remove();
          this.draw();
        }, 100);
      });
      this._resizeObserver.observe(node);
    }
  }

  /**
   * Renders the chart into the container.
   *
   * Rebuilds `Series` (to pick up any `stackType` set by a subclass constructor)
   * and delegates to {@link Canvas.draw}. Subclasses override this to draw axes
   * and data shapes, always calling `super.draw()` first.
   */
  public draw(): void {
    // Rebuild with the correct stackType — subclasses set it after super() returns
    this.series = new Series(this._rawData.series, this.options, this.stackType);

    this.canvas.draw(
      this.selector,
      this.hasData(),
      (i) => this.colorPalette.color(i),
      (i) => this.toggleSerie(i)
    );
  }

  /**
   * Disconnects the `ResizeObserver` and removes all child elements from the container.
   * Call this before unmounting the chart from the DOM.
   */
  public destroy(): void {
    this._resizeObserver?.disconnect();
    if (this._resizeTimer !== null) {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = null;
    }
    d3.select(this.selector).selectAll("*").remove();
  }

  /**
   * Returns `true` when there is at least one series with renderable data.
   * A series is considered renderable when it has `data` values or both `min` and `max` arrays.
   */
  public hasData(): boolean {
    return this.series.items.some(
      (s) => s.data.length > 0 || (s.min.length > 0 && s.max.length > 0)
    );
  }

  /**
   * Toggles the visibility of a series and its associated labels / area by fading
   * its SVG group in or out over 200 ms.
   *
   * Called automatically when a legend item is clicked.
   *
   * @param index - Zero-based series index.
   */
  public toggleSerie(index: number): void {
    const sel     = d3.select(`${this.selector} #serie-${index}`);
    const opacity = sel.style("opacity") === "1" ? 0 : 1;

    sel.transition().duration(200).style("opacity", opacity);
    d3.select(`${this.selector} #labels-${index}`).transition().duration(200).style("opacity", opacity);
    d3.select(`${this.selector} #area-${index}`).transition().duration(200).style("opacity", opacity);
  }
}
