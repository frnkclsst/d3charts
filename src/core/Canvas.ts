import * as d3 from "d3";
import { LegendArea } from "./LegendArea";
import { PlotArea } from "./PlotArea";
import { TitleArea } from "./TitleArea";
import type { ResolvedOptions } from "./Options";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RootSVG = d3.Selection<SVGSVGElement, unknown, any, any>;

/**
 * Owns the root `<svg>` element and the three major layout areas:
 * {@link TitleArea}, {@link LegendArea}, and {@link PlotArea}.
 *
 * Responsibilities:
 * - Measures the container element to determine canvas dimensions when
 *   `options.canvas.width/height` are zero.
 * - Positions the three areas relative to each other (see `_positionAreas`).
 * - Appends the root SVG and delegates rendering to each area.
 * - Draws optional canvas border lines.
 * - Shows a "No data available" message when `hasData` is false.
 */
export class Canvas {
  /** The root `<svg class="svg_chart">` element. Set after `draw()` is called. */
  public svg!: RootSVG;
  /** Legend area instance. `items` must be populated before calling `draw()`. */
  public legendArea: LegendArea;
  /** Plot area instance where data shapes and axes are drawn. */
  public plotArea: PlotArea;
  /** Title area instance. */
  public titleArea: TitleArea;
  /** Canvas height in pixels (may be updated from the container's computed size). */
  public height: number;
  /** Canvas width in pixels (may be updated from the container's computed size). */
  public width: number;

  private readonly _border: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  private readonly _opts: ResolvedOptions;

  /**
   * @param options - Fully-resolved chart options.
   */
  public constructor(options: ResolvedOptions) {
    this._opts      = options;
    this._border    = { ...options.canvas.border };
    this.height     = options.canvas.height;
    this.width      = options.canvas.width;
    this.titleArea  = new TitleArea(options.title);
    this.legendArea = new LegendArea(options.legend, options);
    this.plotArea   = new PlotArea(options.plotArea);
  }

  /**
   * Positions the layout areas, appends the root SVG to the container, and
   * renders each area.
   *
   * When `hasData` is false a centred "No data available" text is shown instead.
   *
   * @param selector - CSS selector of the chart container element.
   * @param hasData  - Whether the chart has renderable data.
   * @param colorFn  - Returns the colour string for a given series index (passed to the legend).
   * @param onToggle - Called with a series index when a legend item is clicked.
   */
  public draw(
    selector: string,
    hasData: boolean,
    colorFn: (i: number) => string,
    onToggle: (i: number) => void
  ): void {
    this._positionAreas(selector);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.svg = (d3.select(selector) as d3.Selection<HTMLElement, unknown, any, any>)
      .append("svg")
      .attr("class", "svg_chart")
      .attr("width", this.width)
      .attr("height", this.height);

    if (hasData) {
      this.titleArea.draw(this.svg);
      this.legendArea.draw(this.svg, colorFn, onToggle);
      this.plotArea.draw(this.svg);
      this._drawBorders();
    } else {
      this.svg.append("text")
        .attr("x", "50%").attr("y", "50%")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .text("No data available");
    }
  }

  /**
   * Computes the positions and sizes of the title, legend, and plot areas.
   *
   * If the container has a non-zero computed `width` or `height`, those values
   * override the options. The legend position (`right` | `left` | `top` | `bottom`)
   * determines how the remaining space is divided between the legend and plot area.
   */
  private _positionAreas(selector: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container    = d3.select(selector) as d3.Selection<HTMLElement, unknown, any, any>;
    const elementWidth = parseFloat(container.style("width"));
    const elementHeight = parseFloat(container.style("height"));

    if (elementWidth  > 0) {this.width  = elementWidth;}
    if (elementHeight > 0) {this.height = elementHeight;}

    const ta = this.titleArea;
    const la = this.legendArea;
    const pa = this.plotArea;

    ta.width  = this.width;
    ta.height = this._opts.title.height;

    pa.height = this.height - ta.height - pa.padding * 2;
    pa.width  = this.width  - pa.padding * 2 - la.width;

    const titleAtBottom = ta.position === "bottom";

    if (titleAtBottom) {
      ta.x = 0;
      ta.y = this.height - ta.height;
      this._positionLegend(la, pa, 0, this.height - ta.height);
    } else {
      ta.x = 0;
      ta.y = 0;
      this._positionLegend(la, pa, ta.height, this.height - ta.height);
    }
  }

  /**
   * Adjusts `la` and `pa` positions/sizes based on the legend's placement.
   *
   * - `right` / `left`: legend sits beside the plot area (same height, reduced plot width).
   * - `bottom` / `top`: legend sits above or below the plot area (same width, reduced plot height).
   *
   * @param la              - Legend area instance to position.
   * @param pa              - Plot area instance to resize.
   * @param topOffset       - Y coordinate where the non-title region starts.
   * @param availableHeight - Height available for the legend + plot area combined.
   */
  private _positionLegend(
    la: LegendArea,
    pa: PlotArea,
    topOffset: number,
    availableHeight: number
  ): void {
    switch (la.position) {
      case "right":
        la.x = this.width - la.width;
        la.y = topOffset;
        la.height = availableHeight;
        pa.x = 0;
        pa.y = topOffset;
        break;
      case "left":
        la.x = 0;
        la.y = topOffset;
        la.height = availableHeight;
        pa.x = la.width;
        pa.y = topOffset;
        break;
      case "bottom":
        la.x = 0;
        la.y = topOffset + availableHeight - la.height;
        la.width  = this.width;
        pa.x = 0;
        pa.y = topOffset;
        pa.height -= la.height;
        pa.width   = this.width - 2 * pa.padding;
        break;
      case "top":
        la.x = 0;
        la.y = topOffset;
        la.width  = this.width;
        pa.x = 0;
        pa.y = topOffset + la.height;
        pa.height -= la.height;
        pa.width   = this.width - 2 * pa.padding;
        break;
      default:
        pa.x = 0;
        pa.y = topOffset;
        break;
    }
  }

  /** Appends `<line class="sep">` elements for each enabled canvas border side. */
  private _drawBorders(): void {
    const b = this._border;
    if (!this.svg) {return;}
    if (b.bottom) {this._drawLine(0, this.width, this.height, this.height);}
    if (b.top)    {this._drawLine(0, this.width, 0, 0);}
    if (b.left)   {this._drawLine(0, 0, 0, this.height);}
    if (b.right)  {this._drawLine(this.width, this.width, 0, this.height);}
  }

  private _drawLine(x1: number, x2: number, y1: number, y2: number): void {
    this.svg.append("line")
      .attr("class", "sep")
      .attr("x1", x1).attr("y1", y1)
      .attr("x2", x2).attr("y2", y2);
  }
}
