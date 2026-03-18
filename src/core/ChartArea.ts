import type * as d3 from "d3";

/** Alias for a D3 selection of an SVG `<g>` element. */
export type GSelection = d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

/** Flags controlling which sides of a rectangular area have a visible border line. */
export interface IBorder {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
}

/**
 * Base class for all rectangular areas that make up a chart
 * (plot area, title area, legend area).
 *
 * Provides shared geometry properties (`x`, `y`, `width`, `height`, `padding`)
 * and a `drawBorders()` helper that appends separator lines to `svg`.
 */
export class ChartArea {
  /** Which sides should have a visible border line. */
  public border: IBorder = { bottom: false, left: false, right: false, top: false };
  /** Height of the area in pixels. */
  public height: number = 0;
  /** Internal padding in pixels (applied inside the area boundaries). */
  public padding: number = 0;
  /** Width of the area in pixels. */
  public width: number = 0;
  /** SVG `<g>` element that contains this area's content. Set by `draw()`. */
  public svg!: GSelection;
  /** X offset of the area within the canvas SVG. */
  public x: number = 0;
  /** Y offset of the area within the canvas SVG. */
  public y: number = 0;

  /**
   * Appends separator `<line>` elements to `this.svg` for each enabled border side.
   * Must be called after `this.svg` has been created.
   */
  public drawBorders(): void {
    if (this.border.bottom) {this._drawLine(0, this.width, this.height, this.height);}
    if (this.border.top)    {this._drawLine(0, this.width, 0, 0);}
    if (this.border.left)   {this._drawLine(0, 0, 0, this.height);}
    if (this.border.right)  {this._drawLine(this.width, this.width, 0, this.height);}
  }

  private _drawLine(x1: number, x2: number, y1: number, y2: number): void {
    this.svg
      .append("line")
      .attr("class", "sep")
      .attr("x1", x1).attr("y1", y1)
      .attr("x2", x2).attr("y2", y2);
  }
}
