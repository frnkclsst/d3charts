import * as d3 from "d3";
import { Shape } from "./Shape";
import type { SeriesGroup, DataSelection, CoordFn } from "./Shape";
import type { IDatum } from "../types/interfaces";
import type { MarkerType, CurveType } from "../types/enums";
import { CurveTypes } from "../types/enums";
import { curveFromString } from "../utils/curves";
import { easeFromString } from "../utils/ease";
import { d3SymbolType } from "../utils/symbols";
import { getHeight } from "../utils/dom";

/**
 * Renders a single line series as an SVG `<path class="line">` with optional
 * data-point markers and value labels.
 *
 * Drawing sequence:
 * 1. A `<path>` is drawn using d3's line generator.
 * 2. A stroke-dashoffset animation sweeps the line from left to right.
 * 3. When the animation ends, markers are placed at each data point and
 *    tooltips are attached (if `tooltipFn` was supplied).
 * 4. If `labels.visible`, value labels are appended above each marker.
 *
 * NaN values in the series are treated as gaps in the line (`defined` predicate).
 */
export class LineShape extends Shape {
  /** Name of the d3 curve factory to use (see {@link curveFromString}). */
  private _interpolation: CurveType = CurveTypes.Linear;
  /** Marker configuration */
  private _marker: { size: number; type: MarkerType; visible: boolean };

  /** Called once, after animation, to attach tooltip behaviour to the marker selection. */
  private _tooltipFn?: (sel: DataSelection<SVGPathElement>, serie: number) => void;

  /**
   * @param svg   - Parent series group.
   * @param serie - Zero-based series index.
   */
  public constructor(svg: SeriesGroup, serie: number) {
    super(svg, serie);
    this._marker = { size: 6, type: "circle", visible: true };
  }

  /**
   * Sets the d3 curve factory name.
   * @param name - One of the names accepted by {@link curveFromString}.
   */
  public interpolation(name: CurveType): this {
    this._interpolation = name;
    return this;
  }

  /**
   * Configures marker symbols drawn at each data point.
   * @param size    - Marker size (scaled ×10 to produce the d3 symbol size).
   * @param type    - Marker shape name.
   * @param visible - Whether markers are shown at all.
   */
  public marker(size: number, type: MarkerType, visible: boolean): this {
    this._marker = { size, type, visible };
    return this;
  }

  /**
   * Provides the function called after animation to bind tooltip behaviour to markers.
   * @param fn - Receives the marker selection and the series index.
   */
  public tooltipFn(fn: (sel: DataSelection<SVGPathElement>, serie: number) => void): this {
    this._tooltipFn = fn;
    return this;
  }

  /**
   * Renders the line into the parent SVG group and starts the enter animation.
   * @param data - The datum row for this series from {@link Series.getSeriesData}.
   */
  public draw(data: IDatum[]): void {
    const line = d3.line<IDatum>()
      .curve(curveFromString(this._interpolation))
      .defined((d) => !isNaN(d.y))
      .x((d, i) => this._x(d, i, this._serie))
      .y((d, i) => this._y(d, i, this._serie));

    const serieGroup = this._svg
      .append("g")
      .attr("id", `serie-${this._serie}`);

    const svgPath = serieGroup
      .append("path")
      .attr("class", "line")
      .attr("d", line(data) ?? "")
      .attr("stroke", this._color)
      .attr("stroke-width", 2)
      .attr("fill", "none");

    // Stroke-dashoffset animation draws the line progressively
    const pathNode = svgPath.node();
    const pathLen  = pathNode ? pathNode.getTotalLength() : 0;

    svgPath
      .attr("stroke-dasharray", `${pathLen} ${pathLen}`)
      .attr("stroke-dashoffset", pathLen)
      .transition()
      .duration(this._animation.duration)
      .ease(easeFromString(this._animation.ease))
      .attr("stroke-dashoffset", 0)
      .on("end", () => {
        if (this._marker.visible) {
          const markers = this._drawMarkers(serieGroup, data);
          this._tooltipFn?.(markers, this._serie);
        }
        if (this._labels.visible) {
          this._drawLabels(serieGroup);
        }
      });
  }

  // Satisfy TypeScript — override return to allow chaining in subclasses
  public override x(fn: CoordFn): this { return super.x(fn); }
  public override y(fn: CoordFn): this { return super.y(fn); }

  /**
   * Appends `<path class="marker">` elements at each data point position.
   * @returns The D3 selection of marker paths (used to attach tooltips).
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
      .attr("stroke", this._color)
      .attr("fill",   this._color)
      .attr("d", d3.symbol<IDatum>().size(this._marker.size * 10).type(symType))
      .attr("transform", (d, i) => {
        const x = this._x(d, i, this._serie);
        const y = this._y(d, i, this._serie);
        return `translate(${x},${y}) ${rotate}`.trim();
      });
  }

  /**
   * Appends `<text class="label">` elements above (or beside, when rotated)
   * each marker, formatted with `labels.format`.
   */
  private _drawLabels(
    serieGroup: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>
  ): void {
    this._initLabels();
    const fmt     = this._labels.format ? d3.format(this._labels.format) : String;
    const rotate  = this._labels.rotate ? -90 : 0;
    const markerR = this._marker.size / 2;

    serieGroup.selectAll<SVGPathElement, IDatum>(".marker")
      .each((d: IDatum, i: number) => {
        const x  = this._x(d, i, this._serie);
        const y  = this._y(d, i, this._serie);

        const text = this._svgLabels.append("text")
          .text(fmt(this._labelValueFn(d)))
          .attr("class", "label")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("fill", this._color)
          .attr("transform", `translate(${x},${y}) rotate(${rotate})`);

        const h = getHeight(text as never);
        if (rotate !== 0) {
          text.attr("dx", h + markerR);
        } else {
          text.attr("dy", -(h + markerR));
        }
      });
  }
}
