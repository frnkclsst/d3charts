import type * as d3 from "d3";
import { ChartArea } from "./ChartArea";
import { SVGSymbol } from "./Symbol";
import type { ResolvedLegendOptions, ResolvedOptions } from "./Options";

/**
 * Renders the interactive legend inside a `<g class="legend">` group.
 *
 * The legend is hidden when `width === 0`.
 * Each item shows a colour swatch (via {@link SVGSymbol}) and a text label.
 * Clicking an item calls `onToggle(index)` to show/hide the corresponding series.
 *
 * Item positions are stacked vertically starting 60 px from the top of the area,
 * with 20 px between items.
 */
export class LegendArea extends ChartArea {
  /** Labels to render — populated by the chart after the `Series` is built. */
  public items: string[] = [];
  /** Where the legend sits relative to the plot area. */
  public readonly position: string;
  /** Optional title rendered above the item list. */
  public readonly title: string;
  /**
   * Fill opacity applied to `drawRect()` swatches in the legend.
   * Should match the CSS `fill-opacity` of the chart element type
   * (e.g. `0.4` for columns/bars, `0.8` for pie slices). Defaults to `1`.
   */
  public swatchFillOpacity: number = 1;

  private readonly _opts: ResolvedOptions;

  /**
   * @param options      - Resolved legend-area options.
   * @param resolvedOpts - Full resolved options (needed to configure the symbol swatch).
   */
  public constructor(options: ResolvedLegendOptions, resolvedOpts: ResolvedOptions) {
    super();
    this.border   = { ...options.border };
    this.height   = options.height;
    this.position = options.position;
    this.title    = options.title;
    this.width    = options.width;
    this._opts    = resolvedOpts;
  }

  /**
   * Appends the legend group to the canvas SVG and renders title + items.
   * Does nothing when `this.width === 0`.
   *
   * @param canvasSvg - The root SVG element produced by {@link Canvas.draw}.
   * @param colorFn   - Returns the colour string for a given series index.
   * @param onToggle  - Called with a series index when a legend item is clicked.
   */
  public draw(
    canvasSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
    colorFn: (i: number) => string,
    onToggle: (index: number) => void
  ): void {
    if (this.width === 0) {return;}

    this.svg = canvasSvg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${this.x},${this.y})`);

    this._drawTitle();
    this._drawItems(colorFn, onToggle);
    this.drawBorders();
  }

  /** Renders the legend title text and a separator line beneath it. */
  private _drawTitle(): void {
    const g = this.svg.append("g").attr("class", "title");

    g.append("line")
      .attr("class", "sep")
      .attr("x1", 20).attr("y1", 40)
      .attr("x2", this.width - 20).attr("y2", 40);

    g.append("text")
      .attr("class", "title")
      .text(this.title)
      .attr("x", 22)
      .attr("y", 26);
  }

  /**
   * Renders one legend item per label.
   * Each item is a `<g class="item">` containing a symbol swatch SVG and a text element.
   *
   * @param colorFn  - Returns the colour for series `i`.
   * @param onToggle - Click handler receiving the item's series index.
   */
  private _drawItems(colorFn: (i: number) => string, onToggle: (index: number) => void): void {
    this.items.forEach((label, i) => {
      const g = this.svg
        .append("g")
        .attr("class", "item")
        .attr("data-serie", i)
        .attr("transform", `translate(22,${i * 20 + 60})`)
        .on("click", () => onToggle(i));

      const symSvg = g.append("svg")
        .attr("width", 24)
        .attr("height", 12) as unknown as d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

      const symbol = new SVGSymbol(symSvg, {
        areaVisible:   this._opts.plotOptions.area.visible,
        areaOpacity:   this._opts.plotOptions.area.opacity,
        fillOpacity:   this.swatchFillOpacity,
        markerSize:    this._opts.plotOptions.markers.size,
        markerType:    this._opts.plotOptions.markers.type,
        markerVisible: this._opts.plotOptions.markers.visible
      });
      symbol.color = colorFn(i);
      symbol.drawRect();

      g.append("text")
        .attr("x", 30)
        .attr("y", 9)
        .style("text-anchor", "start")
        .text(label);
    });
  }
}
