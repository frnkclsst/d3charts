import * as d3 from "d3";
import { Chart } from "./Chart";
import type { IChartData, IOptions } from "../types/interfaces";
import { easeFromString } from "../utils/ease";

/**
 * Radial bar chart — each category occupies a concentric ring; each series is
 * rendered as a stacked arc segment within that ring.
 *
 * Rings are sorted by their total value: the smallest total is placed in the
 * innermost ring and the largest in the outermost ring. Arcs start at the
 * 9 o'clock position and grow clockwise.
 *
 * The legend shows **series** labels (e.g. "Gold", "Silver", "Bronze").
 * Clicking a legend item calls the base {@link Chart.toggleSerie} which
 * shows/hides the arcs for the corresponding series across all rings.
 *
 * @example
 * ```ts
 * const data = {
 *   categories: { format: "%s", data: ["Norway", "USA", "Germany"] },
 *   series: [
 *     { name: "Gold",   data: [148, 96,  92] },
 *     { name: "Silver", data: [133, 102, 86] },
 *     { name: "Bronze", data: [124, 84,  60] },
 *   ],
 * };
 * const chart = new RadialBarChart("#chart", data);
 * chart.draw();
 * ```
 */
export class RadialBarChart extends Chart {
  /**
   * @param selector - CSS selector for the container element.
   * @param data     - Chart data. Categories become rings; series become stacked arc segments.
   * @param options  - Optional chart configuration.
   */
  public constructor(selector: string, data: IChartData, options?: IOptions) {
    super(selector, data, options);

    // Legend shows series labels (stacked segment names)
    this.canvas.legendArea.items = this.series.getLabels();

    // Legend swatches inherit fill-opacity/stroke from the .arc CSS class
    this.canvas.legendArea.swatchCssClass = "arc";
  }

  /** Renders the canvas layout and all radial rings. */
  public override draw(): void {
    super.draw();
    if (!this.hasData()) {return;}

    const pa = this.canvas.plotArea;
    const cx = pa.width  / 2;
    const cy = pa.height / 2;
    const n  = this.categories.labels.length;

    const { duration, ease } = this.options.plotOptions.animation;

    // Total value per category (sum of all series values)
    const totals = this.categories.labels.map((_: string, ci: number) =>
      this.series.items.reduce((sum, s) => sum + (s.data[ci] ?? 0), 0)
    );

    // Sort categories ascending by total (smallest → innermost ring)
    const sortedIndices = Array.from({ length: n }, (_, i) => i)
      .sort((a, b) => totals[a] - totals[b]);

    // Scale domain: round up to a nice value so the 0 and max labels don't collide
    const rawMax  = Math.max(...totals);
    const niceMax = Math.ceil(rawMax / 100) * 100;

    // Radial geometry — reserve room for scale labels outside the outermost ring
    const outerPad   = 34;  // px reserved for scale tick labels
    const labelPad   = 10;  // px gap between ring start and category label
    const maxRadius  = Math.min(cx, cy) - outerPad;
    const innerRadius = maxRadius * 0.15; // centre hole
    const ringWidth  = (maxRadius - innerRadius) / n;
    const gapRatio   = 0.12; // fraction of ring width used as intra-ring gap

    // Angle convention: 0 = 12 o'clock, clockwise.
    const startAngle = 0;
    const angleScale = d3.scaleLinear()
      .domain([0, niceMax])
      .range([0, 2 * Math.PI]);

    // Helper: D3 arc angle → SVG (x, y)
    const sx = (theta: number, r: number): number =>  Math.sin(theta) * r;
    const sy = (theta: number, r: number): number => -Math.cos(theta) * r;

    // Map category index → ring index (sorted by total)
    const ciToRingIdx = new Map<number, number>();
    sortedIndices.forEach((ci, ringIdx) => ciToRingIdx.set(ci, ringIdx));

    // Pre-compute arc start/end angles for every (ci, si) combination,
    // stored as arcAngles[ci][si] so they can be looked up in any iteration order.
    interface IArcAngles { arcStart: number; arcEnd: number; }
    const arcAngles: IArcAngles[][] = this.categories.labels.map((_: string, ci: number) => {
      let cumAngle = startAngle;
      return this.series.items.map((serie) => {
        const value    = serie.data[ci] ?? 0;
        const arcStart = cumAngle;
        const arcEnd   = cumAngle + angleScale(value);
        cumAngle = arcEnd;
        return { arcStart, arcEnd };
      });
    });

    const svgSeries = pa.svg
      .append("g")
      .attr("class", "series")
      .attr("transform", `translate(${cx},${cy})`);

    // --- Series groups (for legend-click toggling via base toggleSerie) ---
    // Arc data is bound in original category order (ci) so that
    // allData.indexOf(datum) === ci → tooltip subtitle resolves correctly.
    interface IArcDatum { value: number; arcStart: number; arcEnd: number; rInner: number; rOuter: number; }

    this.series.items.forEach((serie, si) => {
      const serieGroup = svgSeries.append("g")
        .attr("id", `serie-${si}`)
        .attr("class", "arc");

      // One datum per category, in original category order.
      const arcData: IArcDatum[] = this.categories.labels.map((_: string, ci: number) => {
        const ringIdx = ciToRingIdx.get(ci) ?? 0;
        const rInner  = innerRadius + ringIdx       * ringWidth + ringWidth * gapRatio / 2;
        const rOuter  = innerRadius + (ringIdx + 1) * ringWidth - ringWidth * gapRatio / 2;
        const { arcStart, arcEnd } = arcAngles[ci][si];
        return { value: serie.data[ci] ?? 0, arcStart, arcEnd, rInner, rOuter };
      });

      const paths = serieGroup
        .selectAll<SVGPathElement, IArcDatum>("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("fill", this.colorPalette.color(si))
        .attr("d", (d) => {
          if (d.value <= 0) {return "";}
          const arcFn = d3.arc<unknown, unknown>().innerRadius(d.rInner).outerRadius(d.rOuter);
          return arcFn({ startAngle: d.arcStart, endAngle: d.arcStart, padAngle: 0 } as never) ?? "";
        });

      paths.filter((d) => d.value > 0)
        .transition()
        .duration(duration)
        .ease(easeFromString(ease))
        .attrTween("d", (d) => (t: number): string => {
          const arcFn = d3.arc<unknown, unknown>().innerRadius(d.rInner).outerRadius(d.rOuter);
          return arcFn({ startAngle: d.arcStart, endAngle: d.arcStart + (d.arcEnd - d.arcStart) * t, padAngle: 0 } as never) ?? "";
        });

      const fmt    = this.options.tooltip.valuePointFormat || serie.format || "";
      const suffix = this.options.tooltip.valueSuffix      || serie.suffix || "";
      const f      = fmt ? d3.format(fmt) : String;
      this.tooltip.attach(paths as never, si, (datum) => {
        const d = datum as IArcDatum;
        return { value: `${f(d.value)}${suffix}`, percent: "", colorIndex: si };
      });
    });

    // --- Category labels: one per ring, last character at the arc start ---
    sortedIndices.forEach((ci, ringIdx) => {
      const rInner = innerRadius + ringIdx       * ringWidth + ringWidth * gapRatio / 2;
      const rOuter = innerRadius + (ringIdx + 1) * ringWidth - ringWidth * gapRatio / 2;
      const rMid   = (rInner + rOuter) / 2;
      svgSeries.append("text")
        .attr("class", "radial-label")
        .attr("x", sx(startAngle, rMid) - labelPad)
        .attr("y", sy(startAngle, rMid))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "central")
        .text(this.categories.labels[ci]);
    });

    // --- Scale tick marks and labels outside the outermost ring ---
    this._drawScaleTicks(svgSeries, maxRadius, niceMax, angleScale, startAngle, sx, sy);
  }

  /**
   * Renders radial scale tick marks and value labels around the outermost ring.
   */
  private _drawScaleTicks(
    g:          d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>,
    maxRadius:  number,
    niceMax:    number,
    angleScale: d3.ScaleLinear<number, number>,
    startAngle: number,
    sx:         (theta: number, r: number) => number,
    sy:         (theta: number, r: number) => number
  ): void {
    const tickValues = d3.ticks(0, niceMax, 5);
    const labelR     = maxRadius + 18;
    const tickInnerR = maxRadius + 2;
    const tickOuterR = maxRadius + 8;

    tickValues.forEach((v) => {
      const theta = startAngle + angleScale(v);

      g.append("line")
        .attr("class", "scale-tick")
        .attr("x1", sx(theta, tickInnerR))
        .attr("y1", sy(theta, tickInnerR))
        .attr("x2", sx(theta, tickOuterR))
        .attr("y2", sy(theta, tickOuterR));

      g.append("text")
        .attr("class", "scale-label")
        .attr("x", sx(theta, labelR))
        .attr("y", sy(theta, labelR))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text(String(v));
    });
  }
}
