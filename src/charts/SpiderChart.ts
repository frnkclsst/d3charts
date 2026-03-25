import * as d3 from "d3";
import { SpiderGridlineTypes } from "../types/enums";
import { Chart } from "./Chart";
import { SpiderShape } from "../shapes/SpiderShape";
import type { IChartData, IOptions } from "../types/interfaces";

/**
 * Spider (radar) chart — multivariate data plotted on n radial axes.
 *
 * Each category becomes a spoke radiating from the centre; each series is
 * rendered as a closed polygon connecting its values on those spokes.
 *
 * The legend shows **series** labels (one per polygon), matching the standard
 * behaviour of CartesianChart-based charts.
 *
 * Polygons animate from the centre outward. Vertex markers appear after the
 * animation and carry tooltips showing the category and value for that point.
 *
 * @example
 * ```ts
 * const chart = new SpiderChart("#chart", {
 *   categories: { format: "%s", data: ["Speed", "Power", "Defense", "Range"] },
 *   series: [
 *     { name: "Unit A", data: [80, 90, 60, 70] },
 *     { name: "Unit B", data: [60, 70, 90, 85] }
 *   ]
 * });
 * chart.draw();
 * ```
 */
export class SpiderChart extends Chart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. Categories are spokes; series are polygons.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);
    // Legend shows series names (one entry per polygon)
    this.canvas.legendArea.items = this.series.getLabels();
    this.canvas.legendArea.swatchType = "line";
  }

  /**
   * Overrides the default toggle to also fade the `#markers-N` group, which
   * lives outside `#serie-N` so that markers always render above all polygons.
   */
  public override toggleSerie(index: number): void {
    super.toggleSerie(index);
    const opacity = d3.select(`${this.selector} #serie-${index}`).style("opacity") === "1" ? 0 : 1;
    d3.select(`${this.selector} #markers-${index}`).transition().duration(200).style("opacity", opacity);
  }

  /** Renders the canvas layout, the spider web background, and all series polygons. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const pa     = this.canvas.plotArea;
    const po     = this.options.plotOptions;
    const { duration, ease } = po.animation;
    const { gridlines, levels } = po.spider;

    const n = this.categories.labels.length;
    if (n < 3) { return; } // A spider chart needs at least 3 axes

    const LABEL_MARGIN = 32; // px of space reserved for category labels outside the web
    const radius = Math.min(pa.width, pa.height) / 2 - LABEL_MARGIN;
    if (radius <= 0) { return; }

    // Angle for spoke i — start at the top (−π/2) and go clockwise
    const angle = (i: number): number => -Math.PI / 2 + (2 * Math.PI * i) / n;

    // Radial scale: data value → pixel distance from centre
    const maxVal = this.series.max();
    const rScale = d3.scaleLinear().domain([0, maxVal > 0 ? maxVal : 1]).range([0, radius]);

    // Root group translated to the centre of the plot area
    const cx = pa.width / 2;
    const cy = pa.height / 2;

    const svgSpider = pa.svg
      .append("g")
      .attr("class", "series")
      .attr("transform", `translate(${cx},${cy})`);

    this._drawWeb(svgSpider, n, radius, levels, gridlines, angle);
    this._drawSpokes(svgSpider, n, radius, angle);

    for (let s = 0; s < this.series.length; s++) {
      const data  = this.series.getSeriesData(s);
      const color = this.colorPalette.color(s);

      // Guard: skip series that have fewer data points than spokes
      if (data.length < n) { continue; }

      new SpiderShape(svgSpider as never, s)
        .animation(duration, ease)
        .color(color)
        .cx(0)
        .cy(0)
        .fill(this.options.plotOptions.area.visible, this.options.plotOptions.area.opacity)
        .marker(
          this.options.plotOptions.markers.size,
          this.series.items[s].marker,
          this.options.plotOptions.markers.visible
        )
        .x((d, i) => rScale(isNaN(d.y) ? 0 : d.y) * Math.cos(angle(i)))
        .y((d, i) => rScale(isNaN(d.y) ? 0 : d.y) * Math.sin(angle(i)))
        .tooltipFn((sel, serie) => this.tooltip.attach(sel as never, serie))
        .draw(data);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Draws the concentric gridline rings (circles or polygons).
   * Also renders a tick label on the rightmost spoke for scale reference.
   */
  private _drawWeb(
    g: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>,
    n: number,
    radius: number,
    levels: number,
    gridlines: "circle" | "polygon",
    angle: (i: number) => number
  ): void {
    for (let level = 1; level <= levels; level++) {
      const r = (level / levels) * radius;

      if (gridlines === SpiderGridlineTypes.Polygon) {
        const pts = Array.from({ length: n }, (_, i) => {
          const a = angle(i);
          return `${r * Math.cos(a)},${r * Math.sin(a)}`;
        }).join(" ");
        g.append("polygon")
          .attr("class", "spider-gridline")
          .attr("points", pts)
          .attr("fill", "none")
          .attr("stroke", "#e0e0e0")
          .attr("stroke-width", 1);
      } else {
        g.append("circle")
          .attr("class", "spider-gridline")
          .attr("cx", 0).attr("cy", 0)
          .attr("r", r)
          .attr("fill", "none")
          .attr("stroke", "#e0e0e0")
          .attr("stroke-width", 1);
      }
    }
  }

  /**
   * Draws the radial spoke lines and category label at the tip of each spoke.
   */
  private _drawSpokes(
    g: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>,
    n: number,
    radius: number,
    angle: (i: number) => number
  ): void {
    const LABEL_PAD = 10; // extra padding beyond the web edge

    for (let i = 0; i < n; i++) {
      const a  = angle(i);
      const sx = radius * Math.cos(a);
      const sy = radius * Math.sin(a);

      g.append("line")
        .attr("class", "spider-spoke")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", sx).attr("y2", sy)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      const lx = (radius + LABEL_PAD) * Math.cos(a);
      const ly = (radius + LABEL_PAD) * Math.sin(a);

      // Horizontal alignment: left for right-side spokes, right for left-side
      const anchor = Math.abs(lx) < 1 ? "middle" : lx > 0 ? "start" : "end";
      // Vertical baseline: hanging at the bottom, auto at the top, central on the sides
      const baseline = ly > 1 ? "hanging" : ly < -1 ? "auto" : "central";

      g.append("text")
        .attr("class", "spider-label")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", anchor)
        .attr("dominant-baseline", baseline)
        .attr("font-size", "12px")
        .attr("fill", "#555")
        .text(this.categories.labels[i]);
    }
  }

}
