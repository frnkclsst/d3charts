import * as d3 from "d3";
import type { MarkerType } from "../types/enums";
import type { GSelection } from "./ChartArea";

const SYMBOL_WIDTH  = 24;
const SYMBOL_HEIGHT = 12;

/** Maps a {@link MarkerType} string to the corresponding d3 symbol type object. */
function symbolType(marker: MarkerType): d3.SymbolType {
  switch (marker) {
    case "cross":         return d3.symbolCross;
    case "diamond":       return d3.symbolDiamond;
    case "square":        return d3.symbolSquare;
    case "triangle-up":   return d3.symbolTriangle;
    case "triangle-down": return d3.symbolTriangle; // rotated via transform
    default:              return d3.symbolCircle;
  }
}

/** Options controlling the visual style of an {@link SVGSymbol} swatch. */
export interface ISymbolOptions {
  /** Whether to include an area fill strip in the `drawLine()` swatch. */
  areaVisible: boolean;
  /** Opacity of the area fill strip. */
  areaOpacity: number;
  /** CSS class applied to the `drawRect()` swatch rect, so it inherits the same fill-opacity,
   * stroke-width, and stroke-opacity as the corresponding chart element class. */
  cssClass: string;
  /** Marker size (scaled ×10 to produce the d3 symbol size). */
  markerSize: number;
  /** Shape of the marker symbol. */
  markerType: MarkerType;
  /** Whether to include a marker in the `drawLine()` swatch. */
  markerVisible: boolean;
}

/**
 * Draws small SVG swatches used in the legend and (optionally) tooltips.
 *
 * Three drawing modes are available:
 * - `drawRect()`   — solid colour rectangle (default for bar/column/pie legends).
 * - `drawLine()`   — horizontal line with optional area strip and marker.
 * - `drawMarker()` — standalone marker symbol centred in the swatch.
 *
 * Set `color` before calling any draw method.
 */
export class SVGSymbol {
  /** Stroke/fill colour used by all draw methods. Must be set before drawing. */
  public color: string = "#000";

  private readonly _svg: GSelection;
  private readonly _opts: ISymbolOptions;

  /**
   * @param svg  - The `<svg>` or `<g>` element to append shapes into.
   * @param opts - Swatch styling options.
   */
  public constructor(svg: GSelection, opts: ISymbolOptions) {
    this._svg  = svg;
    this._opts = opts;
  }

  /** Draws a solid colour rectangle spanning the full swatch width (24 × 11 px). */
  public drawRect(): void {
    this._svg
      .append("rect")
      .attr("class", this._opts.cssClass)
      .attr("x", 0)
      .attr("width", SYMBOL_WIDTH)
      .attr("height", 11)
      .style("fill", this.color);
  }

  /**
   * Draws a horizontal line across the swatch centre.
   * Optionally adds a filled area strip below the line and/or a marker at the midpoint.
   */
  public drawLine(): void {
    const cy = SYMBOL_HEIGHT / 2;

    this._svg.append("line")
      .attr("x1", 0).attr("x2", SYMBOL_WIDTH)
      .attr("y1", cy).attr("y2", cy)
      .style("stroke", this.color)
      .style("stroke-width", "2");

    if (this._opts.areaVisible) {
      this._svg.append("rect")
        .attr("x", 0).attr("y", cy)
        .attr("width", SYMBOL_WIDTH).attr("height", cy)
        .attr("opacity", this._opts.areaOpacity)
        .style("fill", this.color);
    }

    if (this._opts.markerVisible) {
      this._drawMarker(SYMBOL_WIDTH / 2, cy);
    }
  }

  /** Draws a marker symbol centred in the swatch (24 × 12 px). */
  public drawMarker(): void {
    this._drawMarker(SYMBOL_WIDTH / 2, SYMBOL_HEIGHT / 2);
  }

  /**
   * Appends a `<path class="marker">` at coordinates `(cx, cy)`.
   * `triangle-down` is rendered as an upward triangle rotated 180°.
   */
  private _drawMarker(cx: number, cy: number): void {
    const type     = this._opts.markerType;
    const rotate   = type === "triangle-down" ? "rotate(180)" : "";
    const pathData = d3.symbol()
      .size(this._opts.markerSize * 10)
      .type(symbolType(type))();

    this._svg.append("path")
      .attr("class", "marker")
      .attr("d", pathData ?? "")
      .attr("stroke", this.color)
      .attr("fill", this.color)
      .attr("transform", `translate(${cx},${cy}) ${rotate}`.trim());
  }
}
