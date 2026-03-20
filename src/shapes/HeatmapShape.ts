import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn, DataSelection } from "./Shape";
import type { IDatum } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/**
 * Renders a single heatmap row as `<rect class="cell">` elements.
 *
 * Each cell's fill colour is determined by a sequential color scale function
 * passed via {@link colorFn}, mapping the datum's `y` value to a CSS colour.
 *
 * Cells fade in from opacity 0 → 1 during the enter animation.
 * Data labels are rendered centred inside each cell after animation completes.
 *
 * Each row group gets `id="serie-N"` so {@link Chart.toggleSerie} can
 * fade the entire row.
 */
export class HeatmapShape extends Shape {
  /** Fixed pixel width of each cell (= x band scale bandwidth). */
  private _cellWidth:  number = 0;
  /** Fixed pixel height of each cell (= y band scale bandwidth). */
  private _cellHeight: number = 0;
  /** Maps a raw value to a CSS fill colour. */
  private _colorFn!:   (v: number) => string;
  /** Optional callback to attach tooltip behaviour to the rect selection. */
  private _tooltipFn?: (sel: DataSelection<SVGRectElement>, serie: number) => void;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
  }

  /**
   * Sets the pixel width of every cell (equal to the X band scale's bandwidth).
   * @param w - Width in pixels.
   */
  public cellWidth(w: number): this { this._cellWidth = w; return this; }

  /**
   * Sets the pixel height of every cell (equal to the Y band scale's bandwidth).
   * @param h - Height in pixels.
   */
  public cellHeight(h: number): this { this._cellHeight = h; return this; }

  /**
   * Sets the sequential colour mapping function.
   * @param fn - Takes a raw `y` value and returns a CSS colour string.
   */
  public colorFn(fn: (v: number) => string): this { this._colorFn = fn; return this; }

  /**
   * Provides a function to attach tooltip behaviour to the rendered rects.
   * @param fn - Receives the rect selection and the series index.
   */
  public tooltipFn(fn: (sel: DataSelection<SVGRectElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Renders cell rects for this row and starts the fade-in animation.
   * @param data - The datum row for this series from {@link Series.getSeriesData}.
   */
  public draw(data: IDatum[]): void {
    const group = this._svg
      .append("g")
      .attr("id", `serie-${this._serie}`);

    const rects = group
      .selectAll<SVGRectElement, IDatum>("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x",      (d, i) => this._x(d, i, this._serie))
      .attr("y",      (d, i) => this._y(d, i, this._serie))
      .attr("width",  this._cellWidth)
      .attr("height", this._cellHeight)
      .attr("fill",   d => isNaN(d.y) ? "transparent" : this._colorFn(d.y))
      .attr("opacity", 0);

    let pending = data.length;

    rects
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .attr("opacity", 1)
      .on("end", () => {
        pending--;
        if (pending === 0 && this._labels.visible) {
          this._drawLabels(data);
        }
      });

    this._tooltipFn?.(rects, this._serie);
  }

  /**
   * Appends centred `<text class="label">` elements inside each cell.
   * Called after all cells have finished animating.
   */
  private _drawLabels(data: IDatum[]): void {
    this._initLabels();
    const fmt = this._labels.format ? d3.format(this._labels.format) : String;

    data.forEach((d, i) => {
      if (isNaN(d.y)) return;

      const x = this._x(d, i, this._serie);
      const y = this._y(d, i, this._serie);

      this._svgLabels.append("text")
        .text(fmt(this._labelValueFn(d)))
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#fff")
        .attr("transform", `translate(${x + this._cellWidth / 2},${y + this._cellHeight / 2})`);
    });
  }
}
