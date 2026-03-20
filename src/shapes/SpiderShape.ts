import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, CoordFn, DataSelection } from "./Shape";
import type { IDatum } from "../types/interfaces";
import type { MarkerType } from "../types/enums";
import { easeFromString } from "../utils/ease";
import { d3SymbolType } from "../utils/symbols";

/**
 * Renders a single spider/radar series as a closed SVG polygon.
 *
 * Drawing sequence:
 * 1. An optional filled `<path class="area">` is drawn beneath the polygon.
 * 2. A stroked `<path class="line">` traces the polygon outline.
 * 3. Both animate from the centre point outward to their final positions.
 * 4. After animation, `<circle class="marker">` elements are placed at each vertex
 *    and tooltips are attached (if `tooltipFn` was supplied).
 *
 * Coordinate functions (`_x`, `_y`) are expected to return Cartesian offsets
 * **relative to the spider centre**, since the parent `<g>` is already translated.
 */
export class SpiderShape extends Shape {
  /** X pixel coordinate of the spider centre (relative to parent group). */
  private _cx: number = 0;
  /** Y pixel coordinate of the spider centre (relative to parent group). */
  private _cy: number = 0;
  /** Polygon fill configuration. */
  private _fill: { visible: boolean; opacity: number } = { visible: true, opacity: 0.2 };
  /** Vertex marker configuration. */
  private _marker: { size: number; type: MarkerType; visible: boolean } = { size: 6, type: "circle", visible: true };
  /** Called after animation to attach tooltip behaviour to the marker selection. */
  private _tooltipFn?: (sel: DataSelection<SVGPathElement>, serie: number) => void;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
  }

  /** Sets the X centre coordinate (relative to the translated parent group). */
  public cx(cx: number): this {
    this._cx = cx;
    return this;
  }

  /** Sets the Y centre coordinate (relative to the translated parent group). */
  public cy(cy: number): this {
    this._cy = cy;
    return this;
  }

  /** Configures the semi-transparent polygon fill. */
  public fill(visible: boolean, opacity: number): this {
    this._fill = { visible, opacity };
    return this;
  }

  /** Configures the vertex markers. */
  public marker(size: number, type: MarkerType, visible: boolean): this {
    this._marker = { size, type, visible };
    return this;
  }

  /** Provides the function called after animation to bind tooltip behaviour. */
  public tooltipFn(fn: (sel: DataSelection<SVGPathElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Renders the spider polygon into the parent SVG group and starts the enter animation.
   * @param data - The datum row for this series from {@link Series.getSeriesData}.
   */
  public draw(data: IDatum[]): void {
    const serieGroup = this._svg
      .append("g")
      .attr("id", `serie-${this._serie}`);

    // Build a closed polygon path string from an array of (x, y) offsets
    const toPath = (pts: { x: number; y: number }[]): string => {
      if (pts.length === 0) { return ""; }
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";
    };

    // Initial path: all vertices collapsed at the centre
    const initialPath = toPath(data.map(() => ({ x: this._cx, y: this._cy })));
    // Final path: vertices at their computed positions
    const finalPath = toPath(data.map((d, i) => ({
      x: this._x(d, i, this._serie),
      y: this._y(d, i, this._serie)
    })));

    const { duration, ease } = this._animation;

    if (this._fill.visible) {
      serieGroup
        .append("path")
        .attr("class", "area")
        .attr("d", initialPath)
        .attr("fill", this._color)
        .attr("fill-opacity", this._fill.opacity)
        .attr("stroke", "none")
        .transition()
        .duration(duration)
        .ease(easeFromString(ease))
        .attrTween("d", () => d3.interpolateString(initialPath, finalPath));
    }

    serieGroup
      .append("path")
      .attr("class", "line")
      .attr("d", initialPath)
      .attr("fill", "none")
      .attr("stroke", this._color)
      .attr("stroke-width", 2)
      .transition()
      .duration(duration)
      .ease(easeFromString(ease))
      .attrTween("d", () => d3.interpolateString(initialPath, finalPath))
      .on("end", () => {
        if (this._marker.visible) {
          const markers = this._drawMarkers(serieGroup, data);
          this._tooltipFn?.(markers, this._serie);
        }
      });
  }

  /**
   * Appends `<path class="marker">` elements at each polygon vertex.
   * @returns D3 selection of marker paths bound to the datum array (used for tooltips).
   */
  private _drawMarkers(
    serieGroup: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>,
    data: IDatum[]
  ): DataSelection<SVGPathElement> {
    const symType = d3SymbolType(this._marker.type);
    const rotate  = this._marker.type === "triangle-down" ? "rotate(180)" : "";

    return serieGroup
      .selectAll<SVGPathElement, IDatum>(".marker")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "marker")
      .attr("fill",   this._color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("d", d3.symbol<IDatum>().size(this._marker.size * 10).type(symType))
      .attr("transform", (d, i) => {
        const x = this._x(d, i, this._serie);
        const y = this._y(d, i, this._serie);
        return `translate(${x},${y}) ${rotate}`.trim();
      });
  }
}
